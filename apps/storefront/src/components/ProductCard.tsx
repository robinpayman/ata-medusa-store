import React from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "./Button"

interface ProductCardProps {
  id: string
  name: string
  price: number
  image?: string
  handle?: string
}

export const ProductCard = ({
  id,
  name,
  price,
  image,
  handle,
}: ProductCardProps) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Image Container */}
      <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-sm">Ingen bilde</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Product Name */}
        <Link
          href={`/produkter/${handle || id}`}
          className="block mb-2 hover:text-blue-600 transition-colors duration-200"
        >
          <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm sm:text-base">
            {name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mb-4">
          <p className="text-lg font-bold text-gray-900">
            kr {(price / 100).toLocaleString("no-NO")}
          </p>
          <p className="text-xs text-gray-500">Ekskl. MVA</p>
        </div>

        {/* Add to Cart Button */}
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          aria-label={`Legg ${name} til i handlevogn`}
        >
          Legg til
        </Button>
      </div>
    </div>
  )
}
