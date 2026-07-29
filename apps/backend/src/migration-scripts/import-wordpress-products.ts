import { MedusaContainer } from "@medusajs/medusa"
import { readFileSync } from "fs"
import { resolve } from "path"

interface WordPressProduct {
  id: number
  name: string
  slug: string
  description: string
  short_description: string
  sku: string
  type: string
  price_ex_vat: number
  price_inc_vat: number
  stock_quantity: number
  stock_status: string
  images: Array<{ url: string; alt: string; local_path?: string }>
  categories: Array<{ name: string; slug: string }>
  tags: Array<{ name: string; slug: string }>
  variants: any[]
  meta: Record<string, any>
}

interface WordPressExport {
  exported_at: string
  total_products: number
  categories: number
  tags: number
  products: WordPressProduct[]
}

async function importProducts(container: MedusaContainer) {
  const logger = container.resolve("logger")
  const productService = container.resolve("productModuleService")
  const categoryService = container.resolve("categoryModuleService")
  const collectionService = container.resolve("collectionModuleService")

  try {
    // Load WordPress export
    const exportPath = resolve(__dirname, "../../products_export.json")
    const exportData: WordPressExport = JSON.parse(readFileSync(exportPath, "utf-8"))

    logger.info(`🔄 Starting import of ${exportData.total_products} products...`)

    // Create collections for WordPress categories
    const collectionMap: Record<string, string> = {}

    logger.info(`📁 Creating ${exportData.categories} collections from categories...`)
    // Note: In production, you'd iterate through unique categories from products
    // For now, we'll create collections as we encounter products

    let createdCount = 0
    let errorCount = 0

    // Import products
    for (const wpProduct of exportData.products) {
      try {
        // Create Medusa product
        const medusaProduct = await productService.create({
          title: wpProduct.name,
          subtitle: wpProduct.short_description || undefined,
          description: wpProduct.description || undefined,
          handle: wpProduct.slug,
          sku: wpProduct.sku,
          status: "published",
          images: wpProduct.images.map((img) => ({
            url: img.url,
            alt_text: img.alt,
          })),
          options: wpProduct.type === "variable" ? [
            {
              title: "Variant",
              values: wpProduct.variants.map((v) => ({ value: v.title })),
            },
          ] : [],
          variants: wpProduct.type === "variable" ? wpProduct.variants.map((v) => ({
            title: v.title,
            sku: v.sku,
            prices: [
              {
                currency_code: "nok",
                amount: Math.round(v.price_ex_vat * 100), // Store in cents
              },
            ],
            inventory_quantity: v.stock || 0,
          })) : [
            {
              title: wpProduct.name,
              sku: wpProduct.sku,
              prices: [
                {
                  currency_code: "nok",
                  amount: Math.round(wpProduct.price_ex_vat * 100), // Store in cents
                },
              ],
              inventory_quantity: wpProduct.stock_quantity || 0,
            },
          ],
          metadata: {
            wordpress_id: wpProduct.id,
            wordpress_type: wpProduct.type,
            original_categories: wpProduct.categories.map((c) => c.name).join(","),
            original_tags: wpProduct.tags.map((t) => t.name).join(","),
          },
        })

        // Add to collections based on categories
        for (const category of wpProduct.categories) {
          try {
            const collectionHandle = category.slug

            // Create or get collection
            if (!collectionMap[collectionHandle]) {
              const collection = await collectionService.create({
                title: category.name,
                handle: collectionHandle,
              })
              collectionMap[collectionHandle] = collection.id
            }

            // Add product to collection
            await collectionService.addProducts(collectionMap[collectionHandle], [
              medusaProduct.id,
            ])
          } catch (e) {
            // Collection may already exist or product may already be in it
            logger.debug(`Collection sync skipped for ${category.name}`)
          }
        }

        createdCount++

        if (createdCount % 50 === 0) {
          logger.info(`✓ Imported ${createdCount}/${exportData.total_products} products`)
        }
      } catch (error) {
        errorCount++
        logger.warn(
          `✗ Error importing product ${wpProduct.sku}: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    }

    logger.info(`✅ Import complete: ${createdCount} created, ${errorCount} errors`)
    logger.info(`📁 Created ${Object.keys(collectionMap).length} collections`)
  } catch (error) {
    logger.error(
      `❌ Import failed: ${error instanceof Error ? error.message : String(error)}`
    )
    throw error
  }
}

export default importProducts
