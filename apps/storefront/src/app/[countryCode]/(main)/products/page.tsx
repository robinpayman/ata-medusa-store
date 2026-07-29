import { Suspense } from "react"
import { getProducts, getCategories } from "@/lib/api/products"
import ProductGrid from "@/components/ProductGrid"
import ProductFilters from "@/components/ProductFilters"

interface ProductsPageProps {
  searchParams: {
    search?: string
    category?: string
    page?: string
    sort?: string
  }
}

export const metadata = {
  title: "Products | ata treningsutstyr",
  description: "Browse our complete range of training equipment",
}

async function ProductsContent({ searchParams }: ProductsPageProps) {
  const page = parseInt(searchParams.page || "1")
  const limit = 12
  const offset = (page - 1) * limit

  const filters: any = {
    limit,
    offset,
  }

  if (searchParams.search) {
    filters.search = searchParams.search
  }

  if (searchParams.category) {
    filters.categoryId = searchParams.category
  }

  try {
    const [productsData, categoriesData] = await Promise.all([
      getProducts(filters),
      getCategories(),
    ])

    const products = productsData.products || []
    const count = productsData.count || 0
    const categories = categoriesData.product_categories || []
    const totalPages = Math.ceil(count / limit)

    return (
      <div className="flex gap-8 px-6 py-12 max-w-7xl mx-auto">
        <ProductFilters
          categories={categories}
          selectedCategory={searchParams.category}
        />
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No products found. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-600">
                  Showing {offset + 1} to {Math.min(offset + limit, count)} of{" "}
                  {count} products
                </p>
              </div>
              <ProductGrid products={products} />
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <a
                        key={pageNum}
                        href={`/products?page=${pageNum}${
                          searchParams.category
                            ? `&category=${searchParams.category}`
                            : ""
                        }${
                          searchParams.search
                            ? `&search=${searchParams.search}`
                            : ""
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
    console.error("Error loading products:", error)
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg">
          Failed to load products. Please try again later.
        </p>
      </div>
    )
  }
}

export default function ProductsPage(props: ProductsPageProps) {
  return (
    <div className="w-full">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">Our Products</h1>
          <p className="text-gray-300">
            Quality training equipment for every athlete
          </p>
        </div>
      </div>
      <Suspense fallback={<ProductsLoadingState />}>
        <ProductsContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  )
}

function ProductsLoadingState() {
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
