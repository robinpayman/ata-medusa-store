import { Suspense } from "react"
import { getProductByHandle } from "@/lib/api/products"
import ProductDetail from "@/components/ProductDetail"

interface ProductPageProps {
  params: {
    handle: string
  }
}

export const metadata = {
  title: "Product | ata treningsutstyr",
  description: "View detailed product information",
}

async function ProductContent({ handle }: { handle: string }) {
  try {
    const response = await getProductByHandle(handle)
    const product = response.product || response

    if (!product) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Product not found</p>
        </div>
      )
    }

    return <ProductDetail product={product} />
  } catch (error) {
    console.error("Error loading product:", error)
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg">Failed to load product</p>
      </div>
    )
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <div className="w-full">
      <Suspense fallback={<ProductDetailLoading />}>
        <ProductContent handle={params.handle} />
      </Suspense>
    </div>
  )
}

function ProductDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-96 rounded-lg mb-4" />
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-20 w-20 rounded" />
            ))}
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-200 h-8 rounded w-3/4" />
          <div className="bg-gray-200 h-6 rounded w-1/4" />
          <div className="bg-gray-200 h-20 rounded" />
          <div className="bg-gray-200 h-10 rounded w-1/3" />
        </div>
      </div>
    </div>
  )
}
