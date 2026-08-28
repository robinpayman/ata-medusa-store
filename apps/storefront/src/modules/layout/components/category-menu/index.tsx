import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * CategoryMenu - Server-side category navigation
 * Fetches categories from Medusa API on the server
 */
export default async function CategoryMenu() {
  try {
    const categories = await listCategories()
    
    if (!categories || categories.length === 0) {
      return null
    }

    // Filter root categories
    const rootCategories = categories.filter((cat) => !cat.parent_category_id)

    if (rootCategories.length === 0) {
      return null
    }

    return (
      <div className="hidden sm:flex items-center gap-1 h-full px-2">
        {rootCategories.slice(0, 10).map((category) => (
          <LocalizedClientLink
            key={category.id}
            href={`/categories/${category.handle}`}
            className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors whitespace-nowrap"
          >
            {category.name}
          </LocalizedClientLink>
        ))}
      </div>
    )
  } catch (error) {
    console.error("CategoryMenu error:", error)
    return null
  }
}
