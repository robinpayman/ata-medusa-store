import * as fs from "fs"
import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createProductCategoriesWorkflow,
  updateProductsWorkflow,
  deleteProductCategoriesWorkflow,
} from "@medusajs/medusa/core-flows"

interface WPCategory {
  name: string
  slug: string
}

interface WPProduct {
  id: number
  sku: string
  categories?: WPCategory[]
}

const BATCH_SIZE = 50

/**
 * The main WooCommerce import (import-wp-to-medusa.ts) never created
 * product categories at all, even though every one of the 539 exported
 * products carries category data. This script creates the ~70 distinct
 * categories and links each already-imported product (matched by
 * external_id) to them.
 *
 * Also removes the "Shirts"/"Sweatshirts"/"Pants"/"Merch" categories left
 * over from the Medusa demo seed, if nothing still references them (the
 * demo products they were created for have already been deleted).
 */
export default async function importWpCategories({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const inputFile = "/Users/rp/wc-tripletex-integration/products_export.json"
  if (!fs.existsSync(inputFile)) {
    logger.error(`File not found: ${inputFile}`)
    return
  }

  const wpExport = JSON.parse(fs.readFileSync(inputFile, "utf-8"))
  const wpProducts: WPProduct[] = wpExport.products

  // ---------------------------------------------------------------------
  // 1. Remove orphaned demo categories from the Medusa starter seed
  // ---------------------------------------------------------------------
  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "handle", "products.id"],
  })

  const demoCategoryNames = ["Shirts", "Sweatshirts", "Pants", "Merch"]
  const orphanedDemoCategories = existingCategories.filter(
    (c) => demoCategoryNames.includes(c.name) && (c.products?.length ?? 0) === 0
  )

  if (orphanedDemoCategories.length > 0) {
    await deleteProductCategoriesWorkflow(container).run({
      input: orphanedDemoCategories.map((c) => c.id),
    })
    logger.info(
      `Removed ${orphanedDemoCategories.length} orphaned demo categor${
        orphanedDemoCategories.length === 1 ? "y" : "ies"
      }.`
    )
  }

  // ---------------------------------------------------------------------
  // 2. Create every distinct WooCommerce category that doesn't exist yet
  // ---------------------------------------------------------------------
  const categoriesBySlug = new Map<string, WPCategory>()
  for (const product of wpProducts) {
    for (const category of product.categories ?? []) {
      categoriesBySlug.set(category.slug, category)
    }
  }

  logger.info(`Found ${categoriesBySlug.size} distinct categories to import.`)

  const { data: currentCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle"],
  })
  const categoryIdByHandle = new Map(
    currentCategories.map((c) => [c.handle, c.id])
  )

  const missingCategories = Array.from(categoriesBySlug.values()).filter(
    (c) => !categoryIdByHandle.has(c.slug)
  )

  if (missingCategories.length > 0) {
    const { result: createdCategories } =
      await createProductCategoriesWorkflow(container).run({
        input: {
          product_categories: missingCategories.map((c) => ({
            name: c.name,
            handle: c.slug,
            is_active: true,
          })),
        },
      })

    for (const category of createdCategories) {
      categoryIdByHandle.set(category.handle, category.id)
    }
    logger.info(`Created ${createdCategories.length} new categories.`)
  } else {
    logger.info("All categories already exist, skipping creation.")
  }

  // ---------------------------------------------------------------------
  // 3. Link each imported product to its categories
  // ---------------------------------------------------------------------
  const { data: importedProducts } = await query.graph({
    entity: "product",
    fields: ["id", "external_id", "categories.id"],
  })

  const productIdByExternalId = new Map<string, string>()
  const existingCategoryIdsByProductId = new Map<string, Set<string>>()
  for (const p of importedProducts) {
    if (p.external_id) {
      productIdByExternalId.set(p.external_id, p.id)

      const ids = new Set<string>()
      for (const c of p.categories ?? []) {
        if (c?.id) ids.add(c.id)
      }
      existingCategoryIdsByProductId.set(p.id, ids)
    }
  }

  const updates: Array<{ id: string; category_ids: string[] }> = []

  for (const wpProduct of wpProducts) {
    const productId = productIdByExternalId.get(String(wpProduct.id))
    if (!productId) continue

    const categoryIds = (wpProduct.categories ?? [])
      .map((c) => categoryIdByHandle.get(c.slug))
      .filter((id): id is string => Boolean(id))

    if (categoryIds.length === 0) continue

    const existingIds = existingCategoryIdsByProductId.get(productId) ?? new Set()
    const alreadyLinked =
      categoryIds.length === existingIds.size &&
      categoryIds.every((id) => existingIds.has(id))

    if (!alreadyLinked) {
      updates.push({ id: productId, category_ids: categoryIds })
    }
  }

  if (updates.length === 0) {
    logger.info("All products already linked to their categories.")
    logger.info("Category import complete.")
    return
  }

  logger.info(`Linking categories for ${updates.length} product(s)...`)

  let linked = 0
  let failed = 0

  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE)
    try {
      await updateProductsWorkflow(container).run({
        input: { products: batch },
      })
      linked += batch.length
      logger.info(`Linked ${linked}/${updates.length} products...`)
    } catch (err) {
      failed += batch.length
      logger.error(
        `Failed to link category batch starting at index ${i}: ${String(err)}`
      )
    }
  }

  logger.info(`Category import complete: ${linked} linked, ${failed} failed.`)
}
