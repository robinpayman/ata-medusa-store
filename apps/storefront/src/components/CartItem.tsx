"use client"

import React, { useState } from "react"
import Image from "next/image"
import { useCart } from "@/context/CartContext"
import { Button } from "./Button"

interface CartLineItem {
  id: string
  title?: string
  description?: string
  thumbnail?: string | null
  variant?: {
    title?: string
    sku?: string
  }
  quantity: number
  unit_price?: number
  subtotal?: number
}

interface CartItemProps {
  item: CartLineItem
}

export default function CartItem({ item }: CartItemProps) {
  const { updateLineItem, removeFromCart } = useCart()
  const [isUpdating, setIsUpdating] = useState(false)

  const price = item.unit_price || 0
  const displayPrice = price / 100
  const subtotal = item.subtotal || 0
  const displaySubtotal = subtotal / 100

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return
    try {
      setIsUpdating(true)
      await updateLineItem(item.id, newQuantity)
    } catch (error) {
      console.error("Failed to update quantity:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    try {
      setIsUpdating(true)
      await removeFromCart(item.id)
    } catch (error) {
      console.error("Failed to remove from cart:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex gap-4 bg-white rounded-lg p-4 border border-gray-200">
      {/* Product Image */}
      <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.title || "Product"}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-xs">No image</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{item.title}</h3>
        {item.variant?.title && (
          <p className="text-sm text-gray-600 mt-1">{item.variant.title}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm font-medium text-gray-900">
            kr {displayPrice.toLocaleString("no-NO")}
          </p>
          <p className="text-sm text-gray-600">
            Subtotal: kr {displaySubtotal.toLocaleString("no-NO")}
          </p>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={isUpdating || item.quantity <= 1}
            className="px-2 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            −
          </button>
          <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={isUpdating}
            className="px-2 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed\"
          >
            +
          </button>
        </div>
        <button
          onClick={handleRemove}
          disabled={isUpdating}
          className="text-red-600 text-sm font-medium hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed\"
        >
          Remove
        </button>
      </div>
    </div>
  )
}
