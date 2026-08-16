"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/CartContext"
import { Button } from "@/components/Button"

export default function PaymentPage() {
  const router = useRouter()
  const { cart, loading } = useCart()
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      sessionStorage.setItem("paymentMethod", paymentMethod)
      router.push("/checkout/review")
    } catch (error) {
      console.error("Payment error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-200 h-8 rounded w-1/4" />
          <div className="bg-gray-200 h-64 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Betalingsmetode</h1>
        <p className="text-gray-600 mb-8">Steg 2 av 3</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === "card"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Kredittkort</p>
                <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
              </div>
            </label>

            <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
              <input
                type="radio"
                name="payment"
                value="bank"
                checked={paymentMethod === "bank"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Bankoverføring</p>
                <p className="text-sm text-gray-600">Direkte bankoverføring (2-3 dager)</p>
              </div>
            </label>

            <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
              <input
                type="radio"
                name="payment"
                value="invoice"
                checked={paymentMethod === "invoice"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Faktura</p>
                <p className="text-sm text-gray-600">Betal med faktura (netto 30 dager)</p>
              </div>
            </label>
          </div>

          {paymentMethod === "card" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
              <p className="text-sm text-gray-700">
                Kortbetaling behandles sikkert via Stripe.
              </p>
            </div>
          )}

          {paymentMethod === "bank" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="text-sm text-gray-700">
                Opplysninger for bankoverføring sendes etter ordrebekreftelse.
              </p>
            </div>
          )}

          {paymentMethod === "invoice" && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <p className="text-sm text-gray-700">
                Fakturabetaling er kun tilgjengelig for bedriftskunder.
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-6">
            <a href="/checkout/shipping" className="flex-1">
              <Button variant="outline" className="w-full">
                Tilbake
              </Button>
            </a>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {isSubmitting ? "Behandler..." : "Se gjennom bestilling"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
