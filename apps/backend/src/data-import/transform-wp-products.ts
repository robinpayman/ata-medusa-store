import * as fs from "fs"
import * as path from "path"
import { parseArgs } from "util"

interface WPProduct {
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
  images: Array<{
    id: number
    src: string
    local_path?: string
  }>
  categories: Array<{
    id: number
    name: string
    slug: string
  }>
  tags?: Array<any>
  variants?: Array<any>
  meta?: Record<string, any>
}

interface MedusaProduct {
  title: string
  description: string
  handle: string
  is_giftcard: boolean
  discountable: boolean
  thumbnail?: string
  external_id: string // WordPress product ID
  variants: Array<{
    title: string
    sku: string
    ean?: string
    barcode?: string
    prices: Array<{
      amount: number
      currency_code: string
      region_id?: string
    }>
    inventory_quantity: number
    track_inventory: boolean
  }>
  images?: Array<{
    url: string
  }>
}

interface TransformationResult {
  success: boolean
  products_transformed: number
  products_with_errors: number
  errors: Array<{
    product_id: number
    sku: string
    error: string
  }>
  warnings: Array<{
    product_id: number
    sku: string
    warning: string
  }>
  output_file: string
  timestamp: string
}

async function transformProducts(inputFile: string, outputFile: string): Promise<TransformationResult> {
  console.log(`\n📥 Loading WordPress product export from: ${inputFile}`)

  if (!fs.existsSync(inputFile)) {
    throw new Error(`Input file not found: ${inputFile}`)
  }

  const fileContent = fs.readFileSync(inputFile, "utf-8")
  const wpExport = JSON.parse(fileContent)

  console.log(`✅ Loaded ${wpExport.total_products} products from ${wpExport.exported_at}`)
  console.log(`📊 Categories: ${wpExport.categories.length}, Tags: ${wpExport.tags.length}`)

  const result: TransformationResult = {
    success: true,
    products_transformed: 0,
    products_with_errors: 0,
    errors: [],
    warnings: [],
    output_file: outputFile,
    timestamp: new Date().toISOString(),
  }

  const medusaProducts: MedusaProduct[] = []
  const skuSet = new Set<string>()

  for (const wpProduct of wpExport.products) {
    try {
      // Validation checks
      if (!wpProduct.sku) {
        result.errors.push({
          product_id: wpProduct.id,
          sku: "MISSING",
          error: "Missing SKU",
        })
        result.products_with_errors++
        continue
      }

      if (skuSet.has(wpProduct.sku)) {
        result.warnings.push({
          product_id: wpProduct.id,
          sku: wpProduct.sku,
          warning: `Duplicate SKU detected. First occurrence will be kept.`,
        })
        continue
      }

      // Price validation.
      // Medusa v2 stores prices in MAJOR units (499 means 499 NOK), unlike
      // Medusa v1 which used minor units. Rounding to 2 decimals keeps
      // floating point noise out of the imported amounts.
      const priceAmount = Math.round(wpProduct.price_inc_vat * 100) / 100
      if (priceAmount <= 0) {
        result.errors.push({
          product_id: wpProduct.id,
          sku: wpProduct.sku,
          error: `Invalid price: ${wpProduct.price_inc_vat}`,
        })
        result.products_with_errors++
        continue
      }

      // Stock validation
      const inventory = Math.max(0, wpProduct.stock_quantity || 0)

      // Image handling
      let thumbnail: string | undefined
      const images: Array<{ url: string }> = []

      if (wpProduct.images && wpProduct.images.length > 0) {
        // Use local path if available, otherwise use WordPress URL
        for (const img of wpProduct.images) {
          const imageUrl = img.local_path || img.src
          images.push({ url: imageUrl })

          // Use first image as thumbnail
          if (!thumbnail) {
            thumbnail = imageUrl
          }
        }
      } else {
        result.warnings.push({
          product_id: wpProduct.id,
          sku: wpProduct.sku,
          warning: "No images found for product",
        })
      }

      // Create Medusa product
      const medusaProduct: MedusaProduct = {
        title: wpProduct.name,
        description: wpProduct.description || wpProduct.short_description || "",
        handle: wpProduct.slug,
        is_giftcard: false,
        discountable: true,
        external_id: wpProduct.id.toString(),
        ...(thumbnail && { thumbnail }),
        variants: [
          {
            title: wpProduct.name,
            sku: wpProduct.sku,
            prices: [
              {
                amount: priceAmount,
                currency_code: "nok", // Norwegian Krone
              },
            ],
            inventory_quantity: inventory,
            track_inventory: true,
          },
        ],
        ...(images.length > 0 && { images }),
      }

      medusaProducts.push(medusaProduct)
      skuSet.add(wpProduct.sku)
      result.products_transformed++

      // Progress logging
      if (result.products_transformed % 50 === 0) {
        console.log(`  ⏳ Transformed ${result.products_transformed} products...`)
      }
    } catch (err) {
      result.errors.push({
        product_id: wpProduct.id,
        sku: wpProduct.sku || "UNKNOWN",
        error: `${err instanceof Error ? err.message : String(err)}`,
      })
      result.products_with_errors++
    }
  }

  // Write transformed products
  console.log(`\n💾 Writing transformed products to: ${outputFile}`)
  fs.writeFileSync(outputFile, JSON.stringify(medusaProducts, null, 2))

  // Write transformation report
  const reportFile = outputFile.replace(".json", ".report.json")
  fs.writeFileSync(reportFile, JSON.stringify(result, null, 2))

  console.log(`\n✅ Transformation Complete:`)
  console.log(`   ✓ Products transformed: ${result.products_transformed}`)
  console.log(`   ✗ Products with errors: ${result.products_with_errors}`)
  console.log(`   ⚠️  Warnings: ${result.warnings.length}`)
  console.log(`   📄 Report saved to: ${reportFile}`)

  if (result.errors.length > 0) {
    console.log(`\n❌ First 10 errors:`)
    for (const err of result.errors.slice(0, 10)) {
      console.log(`   - [${err.sku}] ${err.error}`)
    }
  }

  if (result.warnings.length > 0) {
    console.log(`\n⚠️  First 10 warnings:`)
    for (const warn of result.warnings.slice(0, 10)) {
      console.log(`   - [${warn.sku}] ${warn.warning}`)
    }
  }

  return result
}

async function main() {
  const { values } = parseArgs({
    options: {
      input: {
        type: "string",
        short: "i",
      },
      output: {
        type: "string",
        short: "o",
      },
    },
  })

  const inputFile = values.input || "/tmp/products_export.json"
  const outputFile = values.output || "/tmp/medusa_products.json"

  try {
    const result = await transformProducts(inputFile, outputFile)
    process.exit(result.success && result.products_with_errors === 0 ? 0 : 1)
  } catch (err) {
    console.error("❌ Transformation failed:", err)
    process.exit(1)
  }
}

main()
