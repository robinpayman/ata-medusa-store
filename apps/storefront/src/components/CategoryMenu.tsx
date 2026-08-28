"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"

interface Category {
  id: string
  name: string
  handle: string
}

interface CategoryMenuProps {
  categories: Category[]
}

export default function CategoryMenu({ categories }: CategoryMenuProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const checkScroll = () => {
    if (containerRef.current) {
      setCanScrollLeft(containerRef.current.scrollLeft > 0)
      setCanScrollRight(
        containerRef.current.scrollLeft <
          containerRef.current.scrollWidth - containerRef.current.clientWidth - 10
      )
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener("resize", checkScroll)
    return () => window.removeEventListener("resize", checkScroll)
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = 300
      containerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
      setTimeout(checkScroll, 300)
    }
  }

  if (!categories || categories.length === 0) {
    return null
  }

  // Group categories for better discovery (show popular ones first)
  const popularCategories = categories.filter((cat) =>
    ["Shirts", "Sweatshirts", "Pants", "Merch"].includes(cat.name)
  )

  const otherCategories = categories.filter(
    (cat) => !popularCategories.find((p) => p.id === cat.id)
  )

  const sortedCategories = [...popularCategories, ...otherCategories]

  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Menu */}
        <div className="relative flex items-center">
          {/* Left Scroll Button */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 z-10 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-shadow"
              aria-label="Scroll categories left"
            >
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Scrollable Category Container */}
          <div
            ref={containerRef}
            onScroll={checkScroll}
            className="flex gap-2 overflow-x-auto scrollbar-hide py-4 px-8"
          >
            {sortedCategories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.handle}`}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-900 hover:text-white transition-all duration-200 whitespace-nowrap border border-gray-200 hover:border-gray-900"
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* Right Scroll Button */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 z-10 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-shadow"
              aria-label="Scroll categories right"
            >
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* CSS for hiding scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
