"use client"

import { useEffect, useState, useCallback } from "react"
import medusaClient from "@/lib/medusa-client"

export interface Product {
  id: string
  title: string
  handle: string
  description?: string
  thumbnail?: string | null
  images?: Array<{ url: string }>
  variants?: Array<{
    id: string
    title?: string
    price?: number
  }>
}

export interface UseProductsParams {
  limit?: number
  offset?: number
  search?: string
  sort?: string
  priceMin?: number
  priceMax?: number
  categoryId?: string
}

interface UseProductsResult {
  products: Product[]
  isLoading: boolean
  error: Error | null
  total: number
  hasMore: boolean
}

export const useProducts = (params: UseProductsParams = {}): UseProductsResult => {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [total, setTotal] = useState(0)

  const {
    limit = 12,
    offset = 0,
    search = "",
    sort = "created_at",
    priceMin,
    priceMax,
    categoryId,
  } = params

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Build query parameters
      const queryParams: Record<string, any> = {
        limit,
        offset,
      }

      // Add search if provided
      if (search) {
        queryParams.q = search
      }

      // Add price filters if provided
      if (priceMin !== undefined) {
        queryParams.price_min = Math.round(priceMin * 100) // Convert to cents
      }
      if (priceMax !== undefined) {
        queryParams.price_max = Math.round(priceMax * 100) // Convert to cents
      }

      // Add category filter if provided
      if (categoryId) {
        queryParams.category_id = categoryId
      }

      // Fetch products from Medusa
      const response = await medusaClient.store.products.list(queryParams)

      setProducts(response.products || [])
      setTotal(response.count || 0)
    } catch (err) {
      console.error("Failed to fetch products:", err)
      setError(err instanceof Error ? err : new Error("Failed to fetch products"))
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [limit, offset, search, sort, priceMin, priceMax, categoryId])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    isLoading,
    error,
    total,
    hasMore: offset + limit < total,
  }
}
