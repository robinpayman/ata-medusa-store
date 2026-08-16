import * as fs from "fs"
import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

/**
 * Shape produced by `src/data-import/transform-wp-products.ts`.
 */
interface ImportProduct {
  external_id: string
  description: string
  thumbnail?: string
  images?: Array<{ url: string }>
}

// Kept small so a single failing batch doesn't waste a large amount of work.
const BATCH_SIZE = 50

/**
 * One-off backfill for the 530 products imported by
 * `import-wp-to-medusa.ts` before two bugs were fixed:
 *
 * 1. Images were stored using the WooCommerce export's `local_path`, a
 *    filesystem path from the export machine (e.g. "product_images/foo.webp")
 *    that means nothing to a browser, instead of the real hosted `url`.
 * 2. Descriptions kept raw HTML (including AI-tool-authored Tailwind classes)
 *    which React escapes on render, so the literal `<p class="...">` tags
 *    were visible as page text instead of being sanitized to plain text.
 *
 * This script only touches `images`, `thumbnail` and `description`. Prices
 * and inventory were already verified correct and are left untouched.
 */
export default async function backfillImagesAndDescriptions({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const inputFile = "/tmp/medusa_products.json"
  if (!fs.existsSync(inputFile)) {
    logger.error(`File not found: ${inputFile}`)
    return
  }

  const transformed: ImportProduct[] = JSON.parse(
    fs.readFileSync(inputFile, "utf-8")
  )

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "external_id"],
    filters: { external_id: transformed.map((p) => p.external_id) },
  })

  const productIdByExternalId = new Map<string, string>()
  for (const p of existingProducts) {
    if (p.external_id) {
      productIdByExternalId.set(p.external_id, p.id)
    }
  }

  logger.info(
    `Found ${productIdByExternalId.size} existing products to backfill.`
  )

  let updated = 0
  let skipped = 0
  let failed = 0

  const toUpdate = transformed.filter((p) =>
    productIdByExternalId.has(p.external_id)
  )

  for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
    const batch = toUpdate.slice(i, i + BATCH_SIZE)

    const products = batch.map((product) => ({
      id: productIdByExternalId.get(product.external_id) as string,
      description: product.description,
      ...(product.thumbnail && { thumbnail: product.thumbnail }),
      ...(product.images?.length && { images: product.images }),
    }))

    try {
      await updateProductsWorkflow(container).run({ input: { products } })
      updated += batch.length
      logger.info(`Backfilled ${updated}/${toUpdate.length} products...`)
    } catch (err) {
      failed += batch.length
      logger.error(
        `Failed to backfill batch starting at index ${i}: ${String(err)}`
      )
    }
  }

  skipped = transformed.length - toUpdate.length

  logger.info(
    `Backfill completed: ${updated} updated, ${skipped} not found, ${failed} failed`
  )
}
