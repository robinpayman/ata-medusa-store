"use client"

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
        <p className="text-gray-500">Ingen produkter tilgjengelig</p>
      </div>
    )
  }

  return (
    // `auto-fit` + `minmax` lets the grid always fill the available width: it
    // fits as many 220px+ columns as the container allows and stretches them
    // evenly to fill any remainder, instead of jumping between a fixed
    // number of columns at hard-coded breakpoints.
    <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
