import * as fs from "fs"
import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

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
  const productsToImport: ImportProduct[] = JSON.parse(fileContent)

  logger.info(`Loaded ${productsToImport.length} products for import`)

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
      }
    })

    try {
      await createProductsWorkflow(container).run({ input: { products } })
      imported += batch.length
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
