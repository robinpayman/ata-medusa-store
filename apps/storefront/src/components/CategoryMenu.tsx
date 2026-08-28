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
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const checkScroll = () => {
    if (containerRef.current) {
      const isScrollable = containerRef.current.scrollWidth > containerRef.current.clientWidth
      setCanScrollLeft(isScrollable && containerRef.current.scrollLeft > 0)
      setCanScrollRight(
        isScrollable &&
        containerRef.current.scrollLeft <
          containerRef.current.scrollWidth - containerRef.current.clientWidth - 10
      )
    }
  }

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768)
  }

  useEffect(() => {
    checkScroll()
    checkMobile()
    window.addEventListener("resize", () => {
      checkScroll()
      checkMobile()
    })
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
      <div className="w-full">
        {/* Category Menu - Mobile optimized */}
        <div className="relative flex items-center group">
          {/* Left Scroll Button - Hidden on mobile, visible on desktop when needed */}
          {canScrollLeft && !isMobile && (
            <button
              onClick={() => scroll("left")}
              className="hidden md:flex absolute left-0 z-10 bg-gradient-to-r from-white to-transparent p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100 duration-200"
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
            className="flex gap-2 overflow-x-auto scrollbar-hide py-3 px-4 sm:px-6 md:px-8 w-full"
          >
            {sortedCategories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.handle}`}
                className="flex-shrink-0 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-900 hover:text-white transition-all duration-200 whitespace-nowrap border border-gray-200 hover:border-gray-900"
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* Right Scroll Button - Hidden on mobile, visible on desktop when needed */}
          {canScrollRight && !isMobile && (
            <button
              onClick={() => scroll("right")}
              className="hidden md:flex absolute right-0 z-10 bg-gradient-to-l from-white to-transparent p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100 duration-200"
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
