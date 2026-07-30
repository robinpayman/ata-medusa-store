import * as fs from "fs"
import { parseArgs } from "util"

// DTO Interfaces
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

interface ImportResult {
  success: boolean
  total_products: number
  products_imported: number
  products_failed: number
  start_time: string
  end_time: string
  duration_seconds: number
  errors: Array<{
    handle: string
    sku: string
    error: string
  }>
}

async function importProducts(inputFile: string): Promise<ImportResult> {
  console.log(`\n📥 Loading transformed products from: ${inputFile}`)

  if (!fs.existsSync(inputFile)) {
    throw new Error(`Input file not found: ${inputFile}`)
  }

  const fileContent = fs.readFileSync(inputFile, "utf-8")
  const productsToImport: ImportProduct[] = JSON.parse(fileContent)

  console.log(`✅ Loaded ${productsToImport.length} products for import`)

  const startTime = new Date()
  const result: ImportResult = {
    success: true,
    total_products: productsToImport.length,
    products_imported: 0,
    products_failed: 0,
    start_time: startTime.toISOString(),
    end_time: "",
    duration_seconds: 0,
    errors: [],
  }

  // Use postgres directly via pg client
  const pg = require("pg")
  const client = new pg.Client({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "medusa-ata-medusa-store",
  })

  try {
    await client.connect()
    console.log(`✅ Database connection established`)

    const skuSet = new Set<string>()

    // Check for existing SKUs
    const existingSKUResult = await client.query(`
      SELECT DISTINCT sku FROM product_variant WHERE sku IS NOT NULL
    `)
    existingSKUResult.rows.forEach((row: any) => skuSet.add(row.sku))
    console.log(`\n🔍 Found ${skuSet.size} existing SKUs in database`)

    // Process each product
    for (const product of productsToImport) {
      try {
        const variantSKU = product.variants[0]?.sku

        // Check for duplicate SKU
        if (variantSKU && skuSet.has(variantSKU)) {
          result.errors.push({
            handle: product.handle,
            sku: variantSKU,
            error: `SKU already exists: ${variantSKU}`,
          })
          result.products_failed++
          continue
        }

        // Insert product
        const productResult = await client.query(
          `INSERT INTO product (title, description, handle, is_giftcard, discountable, thumbnail, external_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
           RETURNING id`,
          [
            product.title,
            product.description,
            product.handle,
            product.is_giftcard,
            product.discountable,
            product.thumbnail || null,
            product.external_id,
          ]
        )

        const productId = productResult.rows[0].id

        // Insert variant
        const variant = product.variants[0]
        const variantResult = await client.query(
          `INSERT INTO product_variant (product_id, title, sku, inventory_quantity, track_inventory, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
           RETURNING id`,
          [
            productId,
            variant.title,
            variant.sku,
            variant.inventory_quantity,
            variant.track_inventory,
          ]
        )

        const variantId = variantResult.rows[0].id

        // Insert price
        const price = variant.prices[0]
        await client.query(
          `INSERT INTO product_variant_price (variant_id, currency_code, amount, created_at, updated_at)
           VALUES ($1, $2, $3, NOW(), NOW())`,
          [variantId, price.currency_code, price.amount]
        )

        // Insert images if available
        if (product.images && product.images.length > 0) {
          for (let idx = 0; idx < product.images.length; idx++) {
            const image = product.images[idx]
            await client.query(
              `INSERT INTO product_image (product_id, url, alt_text, rank, created_at, updated_at)
               VALUES ($1, $2, $3, $4, NOW(), NOW())`,
              [productId, image.url, product.title, idx]
            )
          }
        }

        skuSet.add(variant.sku)
        result.products_imported++

        if (result.products_imported % 50 === 0) {
          console.log(`  ⏳ Imported ${result.products_imported}/${productsToImport.length} products...`)
        }
      } catch (err) {
        result.errors.push({
          handle: product.handle,
          sku: product.variants[0]?.sku || "UNKNOWN",
          error: `${err instanceof Error ? err.message : String(err)}`,
        })
        result.products_failed++
      }
    }
  } finally {
    await client.end()
  }

  const endTime = new Date()
  result.end_time = endTime.toISOString()
  result.duration_seconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000)

  console.log(`\n✅ Import Complete:`)
  console.log(`   ✓ Products imported: ${result.products_imported}`)
  console.log(`   ✗ Products failed: ${result.products_failed}`)
  console.log(`   ⏱️  Duration: ${result.duration_seconds}s`)

  if (result.errors.length > 0) {
    console.log(`\n❌ First 10 errors:`)
    for (const err of result.errors.slice(0, 10)) {
      console.log(`   - [${err.sku}] ${err.error}`)
    }
  }

  // Write import report
  const reportFile = inputFile.replace(".json", ".import.report.json")
  fs.writeFileSync(reportFile, JSON.stringify(result, null, 2))
  console.log(`\n📄 Report saved to: ${reportFile}`)

  return result
}

async function main() {
  const { values } = parseArgs({
    options: {
      input: {
        type: "string",
        short: "i",
      },
    },
  })

  const inputFile = values.input || "/tmp/medusa_products.json"

  try {
    const result = await importProducts(inputFile)
    process.exit(result.success && result.products_failed === 0 ? 0 : 1)
  } catch (err) {
    console.error("❌ Import failed:", err)
    process.exit(1)
  }
}

main()
