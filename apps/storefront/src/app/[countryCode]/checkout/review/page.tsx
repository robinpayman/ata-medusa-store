"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/CartContext"
import { completeCart } from "@/lib/api/orders"
import { Button } from "@/components/Button"
import { formatPrice } from "@/lib/util/format-price"

// Medusa v2 amounts are already in major units (e.g. 595 means 595 kr), so
// they must never be divided by 100. The store is NOK-only today, hence the
// hardcoded currency.
const CURRENCY_CODE = "nok"

export default function ReviewPage() {
  const router = useRouter()
  const { cart, loading, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const shippingData = typeof window !== "undefined" 
    ? JSON.parse(sessionStorage.getItem("shippingData") || "{}")
    : {}
  const paymentMethod = typeof window !== "undefined"
    ? sessionStorage.getItem("paymentMethod") || "card"
    : "card"

  const handlePlaceOrder = async () => {
    if (!cart?.id) {
      setError("Handlekurvinformasjon mangler")
      return
    }

    try {
      setIsSubmitting(true)
      const order = await completeCart(cart.id)
      
      // Clear session storage
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("shippingData")
        sessionStorage.removeItem("paymentMethod")
      }
      
      clearCart()
      router.push(`/checkout/confirmation?orderId=${order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke fullføre bestillingen")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-200 h-8 rounded w-1/4" />
          <div className="bg-gray-200 h-96 rounded" />
        </div>
      </div>
    )
  }

  const items = cart?.items || []
  const subtotal = cart?.subtotal || 0
  const total = cart?.total || 0

  return (
    <div className="w-full bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gjennomgå bestilling</h1>
        <p className="text-gray-600 mb-8">Steg 3 av 3</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Leveringsadresse
              </h2>
              <div className="text-gray-700 space-y-1">
                <p>{shippingData.firstName} {shippingData.lastName}</p>
                <p>{shippingData.address1}</p>
                {shippingData.address2 && <p>{shippingData.address2}</p>}
                <p>{shippingData.postalCode} {shippingData.city}</p>
                <p className="text-sm text-gray-600 mt-2">{shippingData.email}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Betalingsmetode
              </h2>
              <div className="text-gray-700">
                {paymentMethod === "card" && "Kredittkort"}
                {paymentMethod === "bank" && "Bankoverføring"}
                {paymentMethod === "invoice" && "Faktura"}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Varer i bestillingen
              </h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border-b pb-4"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">
                        Antall: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-gray-900">
                      {formatPrice({
                        calculated_amount: item.subtotal,
                        currency_code: CURRENCY_CODE,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-6 h-fit">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Ordresammendrag
            </h2>
            <div className="space-y-4 mb-6 border-b pb-6">
              <div className="flex justify-between text-gray-700">
                <span>Delsum</span>
                <span>
                  {formatPrice({
                    calculated_amount: subtotal,
                    currency_code: CURRENCY_CODE,
                  })}
                </span>
              </div>
              {cart?.shipping_total ? (
                <div className="flex justify-between text-gray-700">
                  <span>Frakt</span>
                  <span>
                    {formatPrice({
                      calculated_amount: cart.shipping_total,
                      currency_code: CURRENCY_CODE,
                    })}
                  </span>
                </div>
              ) : null}
              {cart?.tax_total ? (
                <div className="flex justify-between text-gray-700">
                  <span>MVA (25%)</span>
                  <span>
                    {formatPrice({
                      calculated_amount: cart.tax_total,
                      currency_code: CURRENCY_CODE,
                    })}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="mb-6 pb-6 border-b">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Totalt</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice({
                    calculated_amount: total,
                    currency_code: CURRENCY_CODE,
                  })}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {isSubmitting ? "Sender bestilling..." : "Bekreft bestilling"}
              </button>
              <a href="/checkout/payment" className="block">
                <Button variant="outline" className="w-full">
                  Tilbake til betaling
                </Button>
              </a>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700 space-y-2">
              <p className="font-medium text-gray-900">Ordrebeskyttelse</p>
              <p>Bestillingen din er beskyttet av vår sikre kasseprosess.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
