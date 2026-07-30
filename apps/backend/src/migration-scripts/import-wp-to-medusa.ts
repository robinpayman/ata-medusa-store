import * as fs from "fs"
import { MedusaContainer } from "@medusajs/types"

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

export default async function importProducts({ container }: { container: MedusaContainer }) {
  const logger = container.resolve("logger")
  
  logger.info("Starting WordPress product import...")

  const inputFile = "/tmp/medusa_products.json"
  if (!fs.existsSync(inputFile)) {
    logger.error(`File not found: ${inputFile}`)
    return
  }

  const fileContent = fs.readFileSync(inputFile, "utf-8")
  const productsToImport: ImportProduct[] = JSON.parse(fileContent)

  logger.info(`Loaded ${productsToImport.length} products for import`)

  let imported = 0
  let failed = 0

  // Get the product module service
  try {
    const productModule = container.resolve("productModule")
    
    for (const product of productsToImport) {
      try {
        const variant = product.variants[0]
        const price = variant.prices[0]

        // Create product with variants and prices using the module service
        const createdProduct = await productModule.create({
          title: product.title,
          description: product.description,
          handle: product.handle,
          is_giftcard: product.is_giftcard,
          discountable: product.discountable,
          thumbnail: product.thumbnail || undefined,
          external_id: product.external_id,
          variants: [
            {
              title: variant.title,
              sku: variant.sku,
              inventory_quantity: variant.inventory_quantity,
              track_inventory: variant.track_inventory,
              prices: [
                {
                  currency_code: price.currency_code,
                  amount: price.amount,
                },
              ],
            },
          ],
        })

        imported++
        if (imported % 50 === 0) {
          logger.info(`Imported ${imported}/${productsToImport.length} products...`)
        }
      } catch (err) {
        logger.error(`Failed to import product ${product.handle}: ${String(err)}`)
        failed++
      }
    }

    logger.info(`✅ Import completed: ${imported} succeeded, ${failed} failed`)
  } catch (err) {
    logger.error(`Failed to resolve product module: ${String(err)}`)
    logger.info("Skipping product import - module service not available")
  }
}
