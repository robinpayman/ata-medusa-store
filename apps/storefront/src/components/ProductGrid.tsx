"use client"

import Link from "next/link"
import ProductCard from "./ProductCard"

interface Product {
  id: string
  handle: string
  title: string
  description?: string
  thumbnail?: string | null
  variants?: any[]
  images?: any[]
}

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products available</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link key={product.id} href={`/products/${product.handle}`}>
          <ProductCard product={product} />
        </Link>
      ))}
    </div>
  )
}
