"use client"

import React from "react"
import Link from "next/link"
import { Button } from "./Button"
import { formatPrice } from "@/lib/util/format-price"

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

  // Medusa v2 amounts are already in major units (e.g. 595 means 595 kr),
  // so they must never be divided by 100 the way Medusa v1's minor-unit
  // amounts were. The store is NOK-only today, hence the hardcoded currency.
  const taxTotal = cart.tax_total || 0
  const shippingTotal = cart.shipping_total || 0
  const discountTotal = cart.discount_total || 0

  const currency_code = "nok"
  const displaySubtotal = formatPrice({ calculated_amount: cart.subtotal, currency_code })
  const displayDiscount = formatPrice({ calculated_amount: discountTotal, currency_code })
  const displayTax = formatPrice({ calculated_amount: taxTotal, currency_code })
  const displayShipping = formatPrice({ calculated_amount: shippingTotal, currency_code })
  const displayTotal = formatPrice({ calculated_amount: cart.total, currency_code })

  return (
    <div className="h-fit sticky top-24 bg-gray-50 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Ordresammendrag</h2>

      <div className="space-y-4 mb-6 border-b border-gray-200 pb-6">
        <div className="flex justify-between text-gray-700">
          <span>Delsum</span>
          <span>{displaySubtotal}</span>
        </div>

        {shippingTotal > 0 && (
          <div className="flex justify-between text-gray-700">
            <span>Frakt</span>
            <span>{displayShipping}</span>
          </div>
        )}

        {discountTotal > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Rabatt</span>
            <span>-{displayDiscount}</span>
          </div>
        )}

        {taxTotal > 0 && (
          <div className="flex justify-between text-gray-700">
            <span>MVA (25%)</span>
            <span>{displayTax}</span>
          </div>
        )}
      </div>

      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Totalt</span>
          <span className="text-2xl font-bold text-gray-900">
            {displayTotal}
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
