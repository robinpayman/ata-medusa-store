"use client"

import { useEffect, useState, useCallback } from "react"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { Fragment } from "react"
import { ChevronDown } from "@medusajs/icons"

type CategoryWithProducts = HttpTypes.StoreProductCategory & {
  product_count?: number
}

/**
 * CategoryMenu - High-conversion category navigation
 * Fetches categories from Medusa API and displays them as a navigation menu
 */
export default function CategoryMenu() {
  const [categories, setCategories] = useState<CategoryWithProducts[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
        const apiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

        if (!backendUrl || !apiKey) {
          console.warn("Missing MEDUSA_BACKEND_URL or MEDUSA_PUBLISHABLE_KEY")
          setCategories([])
          return
        }

        const response = await fetch(
          `${backendUrl}/store/product-categories?limit=100`,
          {
            method: "GET",
            headers: {
              "x-publishable-api-key": apiKey,
              "Content-Type": "application/json",
            },
          }
        )

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        const allCategories = data.product_categories || []

        // Add product counts
        const categoriesWithCounts = allCategories.map(
          (cat: HttpTypes.StoreProductCategory) => ({
            ...cat,
            product_count: cat.products?.length || 0,
          })
        )

        setCategories(categoriesWithCounts)
        setError(null)
      } catch (err) {
        console.error("CategoryMenu fetch error:", err)
        setError("Unable to load categories")
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Filter root categories (no parent)
  const rootCategories = categories.filter((cat) => !cat.parent_category_id)

  // Get children for a category
  const getChildCategories = useCallback(
    (categoryId: string) => {
      return categories.filter((cat) => cat.parent_category_id === categoryId)
    },
    [categories]
  )

  // Show nothing while loading
  if (loading) {
    return (
      <div className="hidden sm:flex items-center gap-4 h-full">
        <div className="flex gap-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-4 w-20 bg-gray-200 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  // Show nothing if no categories
  if (error || rootCategories.length === 0) {
    return null
  }

  return (
    <div className="hidden sm:flex items-center gap-1 h-full px-2">
      {rootCategories.map((category) => {
        const children = getChildCategories(category.id!)
        const hasChildren = children.length > 0

        if (!hasChildren) {
          return (
            <LocalizedClientLink
              key={category.id}
              href={`/categories/${category.handle}`}
              className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
            >
              {category.name}
            </LocalizedClientLink>
          )
        }

        return (
          <Popover key={category.id} className="relative h-full flex">
            {({ open, close }) => (
              <>
                <Popover.Button className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors flex items-center gap-1 h-full">
                  {category.name}
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </Popover.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-75"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <PopoverPanel className="absolute left-0 mt-0 w-56 rounded-lg shadow-lg bg-white border border-gray-200 z-50">
                    <div className="p-4">
                      <div className="mb-4 pb-4 border-b border-gray-100">
                        <LocalizedClientLink
                          href={`/categories/${category.handle}`}
                          className="font-semibold text-gray-900 hover:text-blue-600 transition-colors flex items-center justify-between"
                          onClick={close}
                        >
                          {category.name}
                          {category.product_count && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {category.product_count}
                            </span>
                          )}
                        </LocalizedClientLink>
                      </div>

                      {children.length > 0 && (
                        <nav className="space-y-2 mb-4">
                          {children.map((child) => (
                            <LocalizedClientLink
                              key={child.id}
                              href={`/categories/${child.handle}`}
                              className="block text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded transition-colors"
                              onClick={close}
                            >
                              {child.name}
                              {child.product_count && (
                                <span className="ml-2 text-xs text-gray-500">
                                  ({child.product_count})
                                </span>
                              )}
                            </LocalizedClientLink>
                          ))}
                        </nav>
                      )}

                      <div className="pt-4 border-t border-gray-100">
                        <LocalizedClientLink
                          href={`/categories/${category.handle}`}
                          className="block w-full text-center bg-blue-600 text-white font-medium py-2 px-3 rounded hover:bg-blue-700 transition-colors"
                          onClick={close}
                        >
                          View All
                        </LocalizedClientLink>
                      </div>
                    </div>
                  </PopoverPanel>
                </Transition>
              </>
            )}
          </Popover>
        )
      })}
    </div>
  )
}
