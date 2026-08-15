import * as fs from "fs"
import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows"

/**
 * Shape produced by `src/data-import/transform-wp-products.ts`.
 *
 * `amount` is expected in MAJOR currency units (e.g. 499 means 499 NOK).
 * Medusa v2 does not use minor units, so a value in øre/cents here would
 * inflate every price by 100x.
 */
interface ImportProduct {
  title: string
  description: string
  handle: string
  is_giftcard: boolean
  discountable: boolean
  thumbnail?: string
  external_id: string
  variants: Array<{
    title: string
    sku: string
    prices: Array<{
      amount: number
      currency_code: string
    }>
    inventory_quantity: number
    track_inventory: boolean
  }>
  images?: Array<{
    url: string
  }>
}

// Products are created in batches so one failure doesn't abort the whole run
// and memory stays bounded for large catalogues.
const BATCH_SIZE = 50

export default async function importProducts({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("Starting WordPress product import...")

  const inputFile = "/tmp/medusa_products.json"
  if (!fs.existsSync(inputFile)) {
    logger.error(`File not found: ${inputFile}`)
    return
  }

  const fileContent = fs.readFileSync(inputFile, "utf-8")
  const allProducts: ImportProduct[] = JSON.parse(fileContent)

  logger.info(`Loaded ${allProducts.length} products for import`)

  // Every product must belong to a shipping profile in Medusa v2.
  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })

  const shippingProfile = shippingProfiles[0]

  if (!shippingProfile) {
    logger.error(
      "No shipping profile found. Run the initial data seed before importing."
    )
    return
  }

  // Products that aren't linked to the sales channel bound to the publishable
  // API key exist in the database but are invisible to the storefront.
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  })

  const salesChannel = salesChannels[0]

  if (!salesChannel) {
    logger.error(
      "No sales channel found. Run the initial data seed before importing."
    )
    return
  }

  // Inventory levels are created against a stock location; without a level the
  // variant is treated as out of stock even when quantity was imported.
  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  })

  const stockLocation = stockLocations[0]

  if (!stockLocation) {
    logger.error(
      "No stock location found. Run the initial data seed before importing."
    )
    return
  }

  logger.info(
    `Using sales channel "${salesChannel.name}" and stock location "${stockLocation.name}".`
  )

  // Skip anything already present so a partially completed run can be resumed.
  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["handle"],
  })
  const existingHandles = new Set(
    existingProducts.map((p: { handle: string }) => p.handle)
  )

  const productsToImport = allProducts.filter(
    (p) => !existingHandles.has(p.handle)
  )

  const skipped = allProducts.length - productsToImport.length
  if (skipped > 0) {
    logger.info(`Skipping ${skipped} product(s) that already exist.`)
  }

  let imported = 0
  let failed = 0

  for (let i = 0; i < productsToImport.length; i += BATCH_SIZE) {
    const batch = productsToImport.slice(i, i + BATCH_SIZE)

    const products = batch.map((product) => {
      const variant = product.variants[0]

      return {
        title: product.title,
        description: product.description,
        handle: product.handle,
        is_giftcard: product.is_giftcard,
        discountable: product.discountable,
        external_id: product.external_id,
        status: ProductStatus.PUBLISHED,
        shipping_profile_id: shippingProfile.id,
        ...(product.thumbnail && { thumbnail: product.thumbnail }),
        ...(product.images?.length && { images: product.images }),
        // Medusa requires at least one option; single-variant WooCommerce
        // products get a synthetic default so the variant can be created.
        options: [{ title: "Default", values: ["Default"] }],
        variants: [
          {
            title: variant.title,
            sku: variant.sku,
            manage_inventory: variant.track_inventory,
            options: { Default: "Default" },
            prices: variant.prices.map((price) => ({
              amount: price.amount,
              currency_code: price.currency_code.toLowerCase(),
            })),
          },
        ],
        sales_channels: [{ id: salesChannel.id }],
      }
    })

    try {
      await createProductsWorkflow(container).run({ input: { products } })
      imported += batch.length

      await createInventoryLevelsForBatch(container, batch, stockLocation.id)

      logger.info(`Imported ${imported}/${productsToImport.length} products...`)
    } catch (err) {
      failed += batch.length
      logger.error(
        `Failed to import batch starting at index ${i}: ${String(err)}`
      )
    }
  }

  logger.info(`Import completed: ${imported} succeeded, ${failed} failed`)
}

/**
 * Stocks the freshly created variants at the given location.
 *
 * Medusa creates an inventory item per variant when `manage_inventory` is set,
 * but leaves it with no level anywhere. A variant with no level resolves to a
 * quantity of zero and renders as sold out, so the WooCommerce quantity has to
 * be written as an explicit level.
 */
async function createInventoryLevelsForBatch(
  container: MedusaContainer,
  batch: ImportProduct[],
  locationId: string
) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const quantityBySku = new Map<string, number>()
  for (const product of batch) {
    const variant = product.variants[0]
    if (variant?.sku) {
      quantityBySku.set(variant.sku, variant.inventory_quantity ?? 0)
    }
  }

  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["sku", "inventory_items.inventory_item_id"],
    filters: { sku: Array.from(quantityBySku.keys()) },
  })

  const inventory_levels = variants.flatMap((variant) => {
    const stocked_quantity = variant.sku
      ? quantityBySku.get(variant.sku) ?? 0
      : 0

    return (variant.inventory_items ?? []).flatMap((item) =>
      item?.inventory_item_id
        ? [
            {
              location_id: locationId,
              inventory_item_id: item.inventory_item_id,
              stocked_quantity,
            },
          ]
        : []
    )
  })

  if (inventory_levels.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels },
    })
  }
}
