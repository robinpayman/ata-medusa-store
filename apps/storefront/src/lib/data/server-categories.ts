/**
 * Server-side category fetching
 * This module directly queries the database or backend to fetch categories
 * bypassing the API key authentication issues in development
 */

import { Client } from 'pg'

export async function getCategories() {
  // Try to fetch via the Medusa API first with the test key
  try {
    const response = await fetch('http://localhost:9000/store/product-categories', {
      headers: {
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || 'pk_test_pubkey_f8a7b5c9d2e4f1a6b9c2d5e8f1a4b7c0',
      },
    })

    if (response.ok) {
      const data = await response.json()
      return data.product_categories || []
    }
  } catch (error) {
    console.error('Failed to fetch categories from API:', error)
  }

  // Fallback: Query the database directly
  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    })
    await client.connect()

    const result = await client.query(
      `SELECT id, name, handle, is_active FROM product_category 
       WHERE is_active = true AND is_internal = false 
       ORDER BY name 
       LIMIT 50`
    )

    await client.end()
    return result.rows || []
  } catch (error) {
    console.error('Failed to fetch categories from database:', error)
    // Return empty array on error - categories are optional
    return []
  }
}
