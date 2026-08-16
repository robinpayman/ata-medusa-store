"use client"

import React, { useState } from "react"
import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import { Button } from "./Button"
import { useCart } from "@/context/CartContext"
import { formatPrice } from "@/lib/util/format-price"

type Variant = HttpTypes.StoreProductVariant

interface ProductDetailProps {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default function ProductDetail({
  product,
  countryCode,
}: ProductDetailProps) {
  const { addToCart, loading: cartLoading } = useCart()
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants?.[0] || null
  )
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [successMessage, setSuccessMessage] = useState(false)

  const images = product.images || []
  const mainImage = images[0]?.url || product.thumbnail
  const [selectedImage, setSelectedImage] = useState(mainImage)

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      console.error("No variant selected")
      return
    }

    try {
      setIsAdding(true)
      await addToCart(selectedVariant.id, quantity)
      setSuccessMessage(true)
      setTimeout(() => setSuccessMessage(false), 2000)
      setQuantity(1)
    } catch (error) {
      console.error("Failed to add to cart:", error)
    } finally {
      setIsAdding(false)
    }
  }

  const displayPrice = formatPrice(selectedVariant?.calculated_price)

  // `inventory_quantity` is null when Medusa doesn't track/return it, which is
  // not the same as zero — treat only an explicit 0 as sold out.
  const inventoryQuantity = selectedVariant?.inventory_quantity
  const isInStock =
    !selectedVariant?.manage_inventory ||
    inventoryQuantity == null ||
    inventoryQuantity > 0

  return (
    <div className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-gray-600">
          <a href={`/${countryCode}/products`} className="hover:text-gray-900">
            Produkter
          </a>
          <span className="mx-2">/</span>
          <span>{product.title}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            <div className="bg-gray-100 rounded-lg overflow-hidden mb-6">
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={product.title}
                  width={600}
                  height={600}
                  className="w-full h-auto object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-96 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.url)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === img.url
                        ? "border-blue-600"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {product.title}
            </h1>

            {/* Price */}
            <div className="mb-6 pb-6 border-b">
              <div className="flex items-baseline gap-2">
                {displayPrice ? (
                  <>
                    <p className="text-3xl font-bold text-gray-900">
                      {displayPrice}
                    </p>
                    <p className="text-sm text-gray-500">Inkl. mva</p>
                  </>
                ) : (
                  <p className="text-lg text-gray-500">
                    Pris ikke tilgjengelig
                  </p>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {isInStock ? (
                <p className="text-success-700 font-medium">På lager</p>
              ) : (
                <p className="text-error-700 font-medium">Utsolgt</p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Beskrivelse
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Variants */}
            {product.variants && product.variants.length > 1 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Varianter
                </h3>
                <div className="space-y-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`w-full px-4 py-3 border-2 rounded-lg transition-colors text-left ${
                        selectedVariant?.id === variant.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{variant.title}</span>
                        <span className="text-gray-600">
                          {formatPrice(variant.calculated_price) ?? "—"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Antall
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-center"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="relative mb-8">
              <Button
                variant="primary"
                className="w-full"
                disabled={
                  isAdding || cartLoading || !isInStock || !selectedVariant
                }
                onClick={handleAddToCart}
                size="lg"
              >
                {isAdding ? "Legger i kurv..." : "Legg i kurv"}
              </Button>
              {successMessage && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-100 text-green-800 rounded font-medium">
                  Lagt i kurv!
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="border-t pt-8 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Om dette produktet
                </h4>
                <ul className="text-gray-700 space-y-2 text-sm">
                  <li>✓ Høy kvalitet treningsutstyr</li>
                  <li>✓ Solid og pålitelig</li>
                  <li>✓ Rask levering tilgjengelig</li>
                  <li>✓ 30 dagers returrett</li>
                </ul>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="border-t pt-8 mt-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <svg className="w-6 h-6 text-gray-900 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Fri frakt</p>
                    <p className="text-gray-600 text-xs">På bestillinger over kr 500</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <svg className="w-6 h-6 text-gray-900 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Enkel retur</p>
                    <p className="text-gray-600 text-xs">30 dagers returrett</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
