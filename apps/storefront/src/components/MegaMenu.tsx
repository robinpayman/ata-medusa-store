"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

interface Category {
  id: string
  name: string
  handle: string
  productCount?: number
  image?: string
}

interface MegaMenuProps {
  categories: Category[]
}

export default function MegaMenu({ categories }: MegaMenuProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [hoverDelay, setHoverDelay] = useState<NodeJS.Timeout | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Popular categories that appear first
  const popularNames = ["Shirts", "Sweatshirts", "Pants", "Merch"]
  const popularCategories = categories.filter((cat) =>
    popularNames.includes(cat.name)
  )
  const otherCategories = categories.filter(
    (cat) => !popularNames.includes(cat.name)
  )
  const orderedCategories = [...popularCategories, ...otherCategories]

  // Take only top 7 for the main menu (research optimal)
  const mainMenuCategories = orderedCategories.slice(0, 7)

  // Split other categories into columns for mega menu
  const remainingCategories = orderedCategories.slice(7)
  const column2 = remainingCategories.slice(0, Math.ceil(remainingCategories.length / 2))
  const column3 = remainingCategories.slice(Math.ceil(remainingCategories.length / 2))

  const handleMouseEnter = (menuId: string) => {
    if (hoverDelay) clearTimeout(hoverDelay)
    setOpenMenu(menuId)
  }

  const handleMouseLeave = () => {
    const delay = setTimeout(() => {
      setOpenMenu(null)
    }, 150) // 150ms hover delay prevents accidental opens
    setHoverDelay(delay)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      if (hoverDelay) clearTimeout(hoverDelay)
    }
  }, [hoverDelay])

  if (!mainMenuCategories || mainMenuCategories.length === 0) {
    return null
  }

  return (
    <div className="w-full bg-white border-b border-gray-200 sticky top-[60px] z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Menu Bar */}
        <nav className="flex items-center h-14">
          {mainMenuCategories.map((category) => (
            <div
              key={category.id}
              ref={menuRef}
              onMouseEnter={() => handleMouseEnter(category.id)}
              onMouseLeave={handleMouseLeave}
              className="relative group"
            >
              {/* Menu Trigger */}
              <button
                className="px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors border-b-2 border-transparent hover:border-gray-900 h-full flex items-center"
                onClick={() =>
                  setOpenMenu(openMenu === category.id ? null : category.id)
                }
              >
                {category.name}
              </button>

              {/* Mega Menu Panel - Desktop */}
              {openMenu === category.id && (
                <div className="absolute left-0 mt-0 w-screen max-w-5xl bg-white border-b border-gray-200 shadow-lg hidden md:grid grid-cols-4 gap-6 p-6">
                  {/* Column 1: Featured Category Image */}
                  <div className="col-span-1">
                    {category.image ? (
                      <Link href={`/categories/${category.handle}`}>
                        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                          <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className="object-cover hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-end">
                            <div className="p-4 w-full">
                              <h3 className="text-white font-bold text-lg">
                                {category.name}
                              </h3>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <Link href={`/categories/${category.handle}`}>
                        <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center hover:shadow-lg transition-shadow cursor-pointer">
                          <span className="text-gray-600 font-medium">
                            {category.name}
                          </span>
                        </div>
                      </Link>
                    )}
                  </div>

                  {/* Column 2: Subcategories Part 1 */}
                  <div className="col-span-1">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-4">
                      Browse
                    </h4>
                    <ul className="space-y-3">
                      {column2.slice(0, 6).map((subcat) => (
                        <li key={subcat.id}>
                          <Link
                            href={`/categories/${subcat.handle}`}
                            className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                          >
                            {subcat.name}
                          </Link>
                        </li>
                      ))}
                      {column2.length > 6 && (
                        <li>
                          <Link
                            href={`/categories/${category.handle}`}
                            className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors inline-flex items-center"
                          >
                            View all →
                          </Link>
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Column 3: Subcategories Part 2 */}
                  <div className="col-span-1">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-4">
                      Popular
                    </h4>
                    <ul className="space-y-3">
                      {column3.slice(0, 6).map((subcat) => (
                        <li key={subcat.id}>
                          <Link
                            href={`/categories/${subcat.handle}`}
                            className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                          >
                            {subcat.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Column 4: Call-to-Action */}
                  <div className="col-span-1 bg-gray-50 rounded-lg p-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-2">
                        Explore All
                      </h4>
                      <p className="text-xs text-gray-600 mb-4">
                        Browse complete {category.name.toLowerCase()} collection
                      </p>
                    </div>
                    <Link
                      href={`/categories/${category.handle}`}
                      className="inline-flex items-center justify-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors w-full"
                    >
                      View All
                    </Link>
                  </div>
                </div>
              )}

              {/* Mobile Accordion Menu */}
              {openMenu === category.id && (
                <div className="md:hidden absolute left-0 right-0 bg-white border-b border-gray-200 shadow-lg max-h-96 overflow-y-auto">
                  <div className="p-4 space-y-2">
                    {[...column2, ...column3].map((subcat) => (
                      <Link
                        key={subcat.id}
                        href={`/categories/${subcat.handle}`}
                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        onClick={() => setOpenMenu(null)}
                      >
                        {subcat.name}
                      </Link>
                    ))}
                    <Link
                      href={`/categories/${category.handle}`}
                      className="block px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 rounded transition-colors bg-gray-50"
                      onClick={() => setOpenMenu(null)}
                    >
                      View All {category.name}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}
