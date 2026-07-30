import medusaClient from "@/lib/medusa-client"

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

export async function getProducts(filters: ProductFilters = {}) {
  try {
    const response = await medusaClient.store.product.list({
      limit: filters.limit || 12,
      offset: filters.offset || 0,
      ...(filters.search && { q: filters.search }),
      ...(filters.categoryId && { category_id: filters.categoryId }),
      ...(filters.collection_id && { collection_id: filters.collection_id }),
    })

    return response
  } catch (error) {
    console.error("Error fetching products:", error)
    throw error
  }
}

export async function getProductByHandle(handle: string) {
  try {
    const response = await medusaClient.store.product.retrieve(handle)
    return response
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
