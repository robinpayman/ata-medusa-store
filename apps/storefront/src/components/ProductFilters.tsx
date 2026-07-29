"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

interface Category {
  id: string
  name: string
}

interface ProductFiltersProps {
  categories: Category[]
  selectedCategory?: string
}

export default function ProductFilters({
  categories,
  selectedCategory,
}: ProductFiltersProps) {
  const searchParams = useSearchParams()

  return (
    <div className="w-64 flex-shrink-0">
      <div className="bg-white rounded-lg shadow p-6 sticky top-20">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>

        <div className="mb-6">
          <h4 className="font-medium text-sm uppercase text-gray-700 mb-3">
            Categories
          </h4>
          <div className="space-y-2">
            <Link
              href="/products"
              className={`block text-sm py-2 px-3 rounded ${
                !selectedCategory
                  ? "bg-blue-100 text-blue-900 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              All Products
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className={`block text-sm py-2 px-3 rounded ${
                  selectedCategory === category.id
                    ? "bg-blue-100 text-blue-900 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium text-sm uppercase text-gray-700 mb-3">
            Price Range
          </h4>
          <p className="text-xs text-gray-500">Coming soon</p>
        </div>

        <div className="border-t pt-4 mt-6">
          <h4 className="font-medium text-sm uppercase text-gray-700 mb-3">
            Availability
          </h4>
          <label className="flex items-center text-sm text-gray-700">
            <input type="checkbox" className="mr-2 rounded" />
            In Stock Only
          </label>
        </div>
      </div>
    </div>
  )
}
