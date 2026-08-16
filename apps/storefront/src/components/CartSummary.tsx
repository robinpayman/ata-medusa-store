"use client"

import React from "react"
import Link from "next/link"
import { Button } from "./Button"

interface Cart {
  subtotal?: number
  discount_total?: number
  tax_total?: number
  shipping_total?: number
  total?: number
}

interface CartSummaryProps {
  cart: Cart | null | undefined
}

export default function CartSummary({ cart }: CartSummaryProps) {
  if (!cart) return null

  const subtotal = cart.subtotal || 0
  const discountTotal = cart.discount_total || 0
  const taxTotal = cart.tax_total || 0
  const shippingTotal = cart.shipping_total || 0
  const total = cart.total || 0

  const displaySubtotal = subtotal / 100
  const displayDiscount = discountTotal / 100
  const displayTax = taxTotal / 100
  const displayShipping = shippingTotal / 100
  const displayTotal = total / 100

  return (
    <div className="h-fit sticky top-24 bg-gray-50 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Ordresammendrag</h2>

      <div className="space-y-4 mb-6 border-b border-gray-200 pb-6">
        <div className="flex justify-between text-gray-700">
          <span>Delsum</span>
          <span>kr {displaySubtotal.toLocaleString("no-NO")}</span>
        </div>

        {displayShipping > 0 && (
          <div className="flex justify-between text-gray-700">
            <span>Frakt</span>
            <span>kr {displayShipping.toLocaleString("no-NO")}</span>
          </div>
        )}

        {displayDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Rabatt</span>
            <span>-kr {displayDiscount.toLocaleString("no-NO")}</span>
          </div>
        )}

        {displayTax > 0 && (
          <div className="flex justify-between text-gray-700">
            <span>MVA (25%)</span>
            <span>kr {displayTax.toLocaleString("no-NO")}</span>
          </div>
        )}
      </div>

      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Totalt</span>
          <span className="text-2xl font-bold text-gray-900">
            kr {displayTotal.toLocaleString("no-NO")}
          </span>
        </div>
      </div>

      <Link href="/checkout/shipping" className="block mb-3">
        <Button variant="primary" className="w-full">
          Gå til kassen
        </Button>
      </Link>

      <Link href="/products" className="block">
        <Button variant="outline" className="w-full">
          Fortsett å handle
        </Button>
      </Link>

      <div className="mt-6 text-xs text-gray-600 space-y-2">
        <div className="flex items-start gap-2">
          <span>✓</span>
          <span>Fri frakt på bestillinger over kr 500</span>
        </div>
        <div className="flex items-start gap-2">
          <span>✓</span>
          <span>30 dagers returrett</span>
        </div>
        <div className="flex items-start gap-2">
          <span>✓</span>
          <span>Sikker betaling</span>
        </div>
      </div>
    </div>
  )
}
