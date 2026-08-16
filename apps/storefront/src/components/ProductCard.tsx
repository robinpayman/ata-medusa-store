"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Button } from "./Button"
import { useCart } from "@/context/CartContext"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { formatPrice, type CalculatedPrice } from "@/lib/util/format-price"

interface Variant {
  id: string
  title?: string
  manage_inventory?: boolean
  inventory_quantity?: number | null
  calculated_price?: CalculatedPrice | null
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
  const [showAdded, setShowAdded] = useState(false)
  const [addError, setAddError] = useState(false)

  const image = product.thumbnail || product.images?.[0]?.url
  const variant = product.variants?.[0]
  const displayPrice = formatPrice(variant?.calculated_price)

  // Medusa returns `inventory_quantity: null` when the field was not requested,
  // which is "unknown" rather than "zero". Only mark a product as sold out when
  // we positively know the tracked quantity is 0, so a missing field never
  // blocks a purchase.
  const tracksInventory = variant?.manage_inventory === true
  const rawQuantity = variant?.inventory_quantity
  const hasKnownQuantity = typeof rawQuantity === "number"
  const isInStock = !tracksInventory || !hasKnownQuantity || rawQuantity > 0

  const handleAddToCart = async () => {
    if (!variant || !isInStock) {
      return
    }

    try {
      setIsAdding(true)
      setAddError(false)
      await addToCart(variant.id, 1)
      setShowAdded(true)
      setTimeout(() => setShowAdded(false), 2000)
    } catch (error) {
      console.error("Failed to add to cart:", error)
      setAddError(true)
      setTimeout(() => setAddError(false), 3000)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-grey-20 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2">
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-grey-10">
        {image ? (
          <Image
            src={image}
            alt={product.title}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-sm text-grey-50">Ingen bilde</span>
          </div>
        )}

        {/* Stock status badge */}
        <div className="absolute right-3 top-3">
          {isInStock ? (
            <span className="rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-700">
              På lager
            </span>
          ) : (
            <span className="rounded-full bg-error-50 px-3 py-1 text-xs font-semibold text-error-700">
              Utsolgt
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-grow flex-col p-4">
        {/*
          Stretched link: the anchor's ::after covers the whole card so the
          entire card is clickable, while keeping a single focusable link and
          valid HTML (no button nested inside an anchor).
        */}
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-grey-90 sm:text-base">
          <LocalizedClientLink
            href={`/products/${product.handle}`}
            className="after:absolute after:inset-0 after:content-[''] focus:outline-none group-hover:underline"
          >
            {product.title}
          </LocalizedClientLink>
        </h3>

        {product.description && (
          <p className="mb-3 line-clamp-2 text-xs text-grey-50">
            {product.description}
          </p>
        )}

        <div className="mb-4 mt-auto">
          <p className="text-lg font-bold text-primary-900">
            {displayPrice ?? "Pris ikke tilgjengelig"}
          </p>
          {displayPrice && <p className="text-xs text-grey-50">Inkl. mva</p>}
        </div>

        {/* z-10 lifts the button above the stretched-link overlay */}
        <div className="relative z-10">
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            disabled={isAdding || cartLoading || !isInStock}
            onClick={handleAddToCart}
            aria-label={`Legg ${product.title} i handlekurven`}
          >
            {!isInStock ? "Utsolgt" : isAdding ? "Legger til..." : "Legg i kurv"}
          </Button>

          <span aria-live="polite" className="sr-only">
            {showAdded ? `${product.title} lagt i handlekurven` : ""}
          </span>

          {showAdded && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded bg-success-700 text-sm font-medium text-white">
              Lagt til
            </div>
          )}

          {addError && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded bg-error-700 px-2 text-center text-sm font-medium text-white">
              Kunne ikke legge i kurv
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

export default ProductCard
