import medusaClient from "@/lib/medusa-client"
import { listProducts } from "@lib/data/products"
import { sortProducts } from "@lib/util/sort-products"

/**
 * Medusa v2's `/store/products` endpoint can sort by plain columns like
 * `title` or `created_at` via its `order` param, but not by price: price is
 * computed at read time from the pricing module, not a column on the
 * product/variant table, so `order=variants.calculated_price...` either
 * errors or silently returns an unsorted list (confirmed against the live
 * API rather than assumed). Price sorting is done by fetching the full
 * result set and sorting in memory instead, mirroring the sortProducts()
 * helper already written for this exact limitation.
 */
export type ProductSort =
  | "created_at"
  | "title_asc"
  | "title_desc"
  | "price_asc"
  | "price_desc"

const SERVER_SORTABLE: Record<string, string> = {
  created_at: "-created_at",
  title_asc: "title",
  title_desc: "-title",
}

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
  sort?: ProductSort
}

// Comfortably above the current catalogue size (530 products); used only
// when a price sort needs the full result set to sort correctly.
const MAX_PRODUCTS_FOR_PRICE_SORT = 1000

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
    const limit = filters.limit || 12
    const offset = filters.offset || 0
    const isPriceSort = filters.sort === "price_asc" || filters.sort === "price_desc"

    const baseQueryParams = {
      ...(filters.search && { q: filters.search }),
      ...(filters.categoryId && { category_id: filters.categoryId }),
      ...(filters.collection_id && {
        collection_id: filters.collection_id,
      }),
    }

    if (isPriceSort) {
      const { response } = await listProducts({
        countryCode,
        pageParam: 1,
        queryParams: {
          ...baseQueryParams,
          limit: MAX_PRODUCTS_FOR_PRICE_SORT,
        },
      })

      const sorted = sortProducts(response.products, filters.sort!)

      return {
        products: sorted.slice(offset, offset + limit),
        count: response.count,
      }
    }

    const { response } = await listProducts({
      countryCode,
      pageParam: Math.floor(offset / limit) + 1,
      queryParams: {
        ...baseQueryParams,
        limit,
        ...(filters.sort &&
          SERVER_SORTABLE[filters.sort] && {
            order: SERVER_SORTABLE[filters.sort],
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
    const response = await medusaClient.store.category.list({
      limit: 100,
      fields: "id,name,handle",
    })
    return response
  } catch (error) {
    console.error("Error fetching categories:", error)
    return {
      product_categories: [],
    }
  }
}
