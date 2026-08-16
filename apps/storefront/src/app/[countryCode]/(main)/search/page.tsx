import { Suspense } from "react"
import { getProducts } from "@/lib/api/products"
import ProductGrid from "@/components/ProductGrid"
import ProductFilters from "@/components/ProductFilters"

interface SearchPageProps {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{
    q?: string
    page?: string
    category?: string
  }>
}

export const metadata = {
  title: "Search Results | ata treningsutstyr",
  description: "Search results for training equipment",
}

async function SearchContent({
  searchParams,
  countryCode,
}: {
  searchParams: Promise<{ q?: string; page?: string; category?: string }>
  countryCode: string
}) {
  const params = await searchParams
  const query = params.q || ""
  const page = parseInt(params.page || "1")
  const limit = 12
  const offset = (page - 1) * limit

  if (!query) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Search the catalog
        </h2>
        <p className="text-gray-600">
          Enter a search term to find products
        </p>
      </div>
    )
  }

  try {
    const productsData = await getProducts(
      {
        limit,
        offset,
        search: query,
        ...(params.category && { categoryId: params.category }),
      },
      countryCode
    )

    const products = productsData.products || []
    const count = productsData.count || 0
    const totalPages = Math.ceil(count / limit)

    return (
      <div className="flex gap-8 px-6 py-12 max-w-7xl mx-auto">
        <ProductFilters
          categories={[]}
          selectedCategory={params.category}
        />

        <div className="flex-1">
          <div className="mb-6">
            <p className="text-gray-600">
              {count === 0 ? (
                <>
                  No results found for "<strong>{query}</strong>"
                </>
              ) : (
                <>
                  {count} result{count !== 1 ? "s" : ""} found for "
                  <strong>{query}</strong>"
                </>
              )}
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-6">
                Try different search terms or browse our full catalog
              </p>
              <a
                href="/products"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Browse All Products
              </a>
            </div>
          ) : (
            <>
              <ProductGrid products={products} />

              {totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <a
                        key={pageNum}
                        href={`/search?q=${encodeURIComponent(query)}&page=${pageNum}${
                          params.category ? `&category=${params.category}` : ""
                        }`}
                        className={`px-4 py-2 rounded ${
                          pageNum === page
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`}
                      >
                        {pageNum}
                      </a>
                    )
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error searching products:", error)
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg">
          Failed to search products. Please try again later.
        </p>
      </div>
    )
  }
}

export default async function SearchPage(props: SearchPageProps) {
  const { countryCode } = await props.params

  return (
    <div className="w-full">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-2">Search Products</h1>
          <p className="text-gray-300">Find the equipment you need</p>
        </div>
      </div>
      <Suspense fallback={<SearchLoadingState />}>
        <SearchContent
          searchParams={props.searchParams}
          countryCode={countryCode}
        />
      </Suspense>
    </div>
  )
}

function SearchLoadingState() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-64 rounded-lg mb-4" />
            <div className="bg-gray-200 h-4 rounded mb-2" />
            <div className="bg-gray-200 h-4 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}
