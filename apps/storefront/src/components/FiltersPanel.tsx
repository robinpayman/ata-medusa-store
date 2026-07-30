"use client"

import React, { useState } from "react"

export interface FilterState {
  priceMin: number
  priceMax: number
  categoryId?: string
  inStockOnly: boolean
}

interface FiltersPanelProps {
  onFilterChange: (filters: FilterState) => void
  categories?: Array<{ id: string; name: string }>
  maxPrice?: number
}

const FiltersPanel = ({
  onFilterChange,
  categories = [],
  maxPrice = 5000,
}: FiltersPanelProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(maxPrice)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [inStockOnly, setInStockOnly] = useState(false)

  const handleApplyFilters = () => {
    onFilterChange({
      priceMin,
      priceMax,
      categoryId: selectedCategory || undefined,
      inStockOnly,
    })
  }

  const handleClearFilters = () => {
    setPriceMin(0)
    setPriceMax(maxPrice)
    setSelectedCategory("")
    setInStockOnly(false)
    onFilterChange({
      priceMin: 0,
      priceMax: maxPrice,
      inStockOnly: false,
    })
  }

  const hasActiveFilters =
    priceMin > 0 || priceMax < maxPrice || selectedCategory !== "" || inStockOnly

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden mb-4 px-4 py-2 bg-gray-900 text-white rounded-lg flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
      </button>

      {/* Filters Panel */}
      <div
        className={`${
          isOpen ? "block" : "hidden"
        } md:block bg-white p-4 rounded-lg border border-gray-200`}
      >
        {/* Price Range */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Min: kr {priceMin}</label>
              <input
                type="range"
                min="0"
                max={maxPrice}
                value={priceMin}
                onChange={(e) => setPriceMin(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Max: kr {priceMax}</label>
              <input
                type="range"
                min="0"
                max={maxPrice}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Category</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value={category.id}
                    checked={selectedCategory === category.id}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">{category.name}</span>
                </label>
              ))}
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory("")}
                  className="text-xs text-blue-600 hover:text-blue-700 mt-2"
                >
                  Clear category
                </button>
              )}
            </div>
          </div>
        )}

        {/* Stock Status */}
        <div className="mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">In Stock Only</span>
          </label>
        </div>

        {/* Apply/Clear Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleApplyFilters}
            className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Apply Filters
          </button>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </>
  )
}

export default FiltersPanel
