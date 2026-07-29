"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Button } from "./Button"
import { useCart } from "@/context/CartContext"

interface Variant {
  id: string
  title?: string
  price?: number
}

interface Product {
  id: string
  title: string
  handle: string
  description?: string
  thumbnail?: string | null
  variants?: Variant[]
  images?: Array<{ url: string }>
}

interface ProductCardProps {
  product: Product
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, loading: cartLoading } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [successMessage, setSuccessMessage] = useState(false)

  const image = product.thumbnail || product.images?.[0]?.url
  const variant = product.variants?.[0]
  const price = variant?.price || 0
  const displayPrice = price / 100 // Convert cents to kroner

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!variant) {
      console.error("No variant available for this product")
      return
    }

    try {
      setIsAdding(true)
      await addToCart(variant.id, 1)
      setSuccessMessage(true)
      setTimeout(() => setSuccessMessage(false), 2000)
    } catch (error) {
      console.error("Failed to add to cart:", error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
      {/* Image Container */}
      <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={product.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm sm:text-base mb-2">
          {product.title}
        </h3>

        {/* Price */}
        <div className="mb-4">
          <p className="text-lg font-bold text-gray-900">
            kr {displayPrice.toLocaleString("no-NO")}
          </p>
          <p className="text-xs text-gray-500">Ex VAT</p>
        </div>

        {/* Add to Cart Button */}
        <div className="relative">
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            disabled={isAdding || cartLoading}
            onClick={handleAddToCart}
            aria-label={`Add ${product.title} to cart`}
          >
            {isAdding ? "Adding..." : "Add to Cart"}
          </Button>
          {successMessage && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-100 text-green-800 rounded text-sm font-medium">
              Added!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard
