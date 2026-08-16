import { Suspense } from "react"
import { getProducts, getCategories } from "@/lib/api/products"
import ProductGrid from "@/components/ProductGrid"
import ProductFilters from "@/components/ProductFilters"
import Pagination from "@/components/Pagination"

interface ProductsPageProps {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{
    search?: string
    category?: string
    page?: string
    sort?: string
  }>
}

export const metadata = {
  title: "Produkter | ata treningsutstyr",
  description: "Bla gjennom hele vareutvalget vårt av treningsutstyr",
}

async function ProductsContent({
  searchParams,
  countryCode,
}: {
  searchParams: Promise<{ search?: string; category?: string; page?: string; sort?: string }>
  countryCode: string
}) {
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const limit = 12
  const offset = (page - 1) * limit

  const filters: any = {
    limit,
    offset,
  }

  if (params.search) {
    filters.search = params.search
  }

  if (params.category) {
    filters.categoryId = params.category
  }

  try {
    const [productsData, categoriesData] = await Promise.all([
      getProducts(filters, countryCode),
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
          selectedCategory={params.category}
        />
        <div className="flex-1 min-w-0">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Ingen produkter funnet. Prøv å justere filtrene dine.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-600">
                  Viser {offset + 1} til {Math.min(offset + limit, count)} av{" "}
                  {count} produkter
                </p>
              </div>
              <ProductGrid products={products} />
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                buildHref={(pageNum) =>
                  `/products?page=${pageNum}${
                    params.category ? `&category=${params.category}` : ""
                  }${params.search ? `&search=${params.search}` : ""}`
                }
              />
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
          Kunne ikke laste produkter. Prøv igjen senere.
        </p>
      </div>
    )
  }
}

export default async function ProductsPage(props: ProductsPageProps) {
  const { countryCode } = await props.params

  return (
    <div className="w-full">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">Våre produkter</h1>
          <p className="text-gray-300">
            Kvalitetsutstyr for enhver utholdenhet
          </p>
        </div>
      </div>
      <Suspense fallback={<ProductsLoadingState />}>
        <ProductsContent
          searchParams={props.searchParams}
          countryCode={countryCode}
        />
      </Suspense>
    </div>
  )
}

function ProductsLoadingState() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
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
