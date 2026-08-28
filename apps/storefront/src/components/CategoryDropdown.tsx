"use client"

import { useState } from "react"
import Link from "next/link"

interface Category {
  id: string
  name: string
  handle: string
}

interface CategoryDropdownProps {
  categories: Category[]
}

export default function CategoryDropdown({ categories }: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <div className="relative group hidden lg:block">
      <button
        className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors inline-flex items-center gap-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        Categories
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-0 w-48 bg-white rounded-lg shadow-lg z-50 py-2 border border-gray-200">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.handle}`}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
