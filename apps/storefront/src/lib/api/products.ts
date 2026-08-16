import medusaClient from "@/lib/medusa-client"
import { listProducts } from "@lib/data/products"

/**
 * Medusa omits `variants.inventory_quantity` from store responses unless it is
 * explicitly requested. The leading `+` adds the field to the default set
 * instead of replacing it, so thumbnails, images and prices are preserved.
 */
const INVENTORY_FIELDS = "+variants.inventory_quantity"

export interface ProductFilters {
  limit?: number
  offset?: number
  search?: string
  categoryId?: string
  collection_id?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
}

/**
 * Lists products for a given storefront region.
 *
 * `countryCode` is required so the underlying request can resolve a region
 * and pass `region_id`. Without it, Medusa never populates
 * `variants.calculated_price` and every product renders with no price at all.
 */
export async function getProducts(
  filters: ProductFilters = {},
  countryCode: string
) {
  try {
    const { response } = await listProducts({
      countryCode,
      pageParam: filters.offset
        ? Math.floor(filters.offset / (filters.limit || 12)) + 1
        : 1,
      queryParams: {
        limit: filters.limit || 12,
        ...(filters.search && { q: filters.search }),
        ...(filters.categoryId && { category_id: filters.categoryId }),
        ...(filters.collection_id && {
          collection_id: filters.collection_id,
        }),
      },
    })

    return response
  } catch (error) {
    console.error("Error fetching products:", error)
    throw error
  }
}

/**
 * Medusa's `/store/products/:id` endpoint only accepts a product ID, so a
 * handle must be resolved through a filtered list query instead. Going through
 * `listProducts` also applies the region, which is required for Medusa to
 * return `variants.calculated_price` — without a region every variant comes
 * back with no price at all.
 *
 * Returns `null` when no product matches so callers can render a 404 rather
 * than an error state.
 */
export async function getProductByHandle(handle: string, countryCode: string) {
  try {
    const { response } = await listProducts({
      countryCode,
      queryParams: { handle, limit: 1 },
    })

    return response.products[0] ?? null
  } catch (error) {
    console.error(`Error fetching product ${handle}:`, error)
    throw error
  }
}

export async function searchProducts(query: string, limit = 20) {
  try {
    const response = await medusaClient.store.product.list({
      q: query,
      limit,
      fields: INVENTORY_FIELDS,
    })
    return response
  } catch (error) {
    console.error("Error searching products:", error)
    throw error
  }
}

export async function getProductsByCollection(
  collectionId: string,
  limit = 12,
  offset = 0
) {
  try {
    const response = await medusaClient.store.product.list({
      collection_id: collectionId,
      limit,
      offset,
    })
    return response
  } catch (error) {
    console.error(
      `Error fetching products for collection ${collectionId}:`,
      error
    )
    throw error
  }
}

export async function getProductsByCategory(
  categoryId: string,
  limit = 12,
  offset = 0
) {
  try {
    const response = await medusaClient.store.product.list({
      category_id: categoryId,
      limit,
      offset,
    })
    return response
  } catch (error) {
    console.error(
      `Error fetching products for category ${categoryId}:`,
      error
    )
    throw error
  }
}

export async function getCollections() {
  try {
    const response = await medusaClient.store.collection.list()
    return response
  } catch (error) {
    console.error("Error fetching collections:", error)
    throw error
  }
}

export async function getCategories() {
  try {
    // Medusa doesn't have built-in category endpoint by default
    // Return empty categories for now - implement custom module if needed
    return {
      product_categories: [],
    }
  } catch (error) {
    console.error("Error fetching categories:", error)
    return {
      product_categories: [],
    }
  }
}
