/**
 * Server-side category fetching
 * Fetches product categories from the Medusa backend or database
 * Attempts API first (recommended), falls back to direct database access
 */

import { Client } from 'pg'

interface Category {
  id: string
  name: string
  handle: string
  is_active?: boolean
  image?: string
  productCount?: number
}

/**
 * Fetch categories from the Medusa Store API
 */
async function fetchCategoriesFromAPI(): Promise<Category[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    if (!apiKey) {
      console.warn('No publishable API key available')
      return []
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'}/store/product-categories`,
      {
        headers: {
          'x-publishable-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      console.warn(`API returned ${response.status}: ${response.statusText}`)
      return []
    }

    const data = await response.json()
    const categories = data.product_categories || []
    console.log(`Fetched ${categories.length} categories from Medusa API`)
    return categories
  } catch (error) {
    console.error('Failed to fetch categories from Medusa API:', error)
    return []
  }
}

/**
 * Fetch categories directly from the database
 */
async function fetchCategoriesFromDB(): Promise<Category[]> {
  try {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      console.warn('No DATABASE_URL available for fallback')
      return []
    }

    const client = new Client({
      connectionString: dbUrl,
    })
    await client.connect()

    const result = await client.query<Category>(
      `SELECT 
        pc.id, 
        pc.name, 
        pc.handle,
        COUNT(pcp.product_id) as product_count,
        (SELECT url FROM image WHERE product_id IN (
          SELECT product_id FROM product_category_product WHERE product_category_id = pc.id
        ) LIMIT 1) as image
       FROM product_category pc
       LEFT JOIN product_category_product pcp ON pcp.product_category_id = pc.id
       WHERE pc.is_active = true AND pc.is_internal = false 
       GROUP BY pc.id, pc.name, pc.handle
       ORDER BY CASE 
         WHEN pc.name IN ('Shirts', 'Sweatshirts', 'Pants', 'Merch') THEN 0
         ELSE 1
       END, pc.name
       LIMIT 50`
    )

    await client.end()
    const categories = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      handle: row.handle,
      productCount: parseInt(row.product_count as unknown as string) || 0,
      image: row.image as string | undefined
    })) || []
    console.log(`Fetched ${categories.length} categories from database with images`)
    return categories
  } catch (error) {
    console.error('Failed to fetch categories from database:', error)
    return []
  }
}

/**
 * Get categories with automatic fallback
 * 1. Tries Medusa Store API (primary)
 * 2. Falls back to direct database access
 * 3. Returns empty array if all attempts fail
 */
export async function getCategories(): Promise<Category[]> {
  // Try API first
  const apiCategories = await fetchCategoriesFromAPI()
  if (apiCategories.length > 0) {
    return apiCategories
  }

  // Fall back to database
  const dbCategories = await fetchCategoriesFromDB()
  if (dbCategories.length > 0) {
    return dbCategories
  }

  console.warn('No categories available from API or database')
  return []
}
