"use client"

import Link from "next/link"
import { useCart } from "@/context/CartContext"
import CartItem from "@/components/CartItem"
import CartSummary from "@/components/CartSummary"
import { Button } from "@/components/Button"

export default function CartPage() {
  const { cart, loading } = useCart()

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-200 h-8 rounded w-1/4" />
          <div className="bg-gray-200 h-64 rounded" />
        </div>
      </div>
    )
  }

  const items = cart?.items || []
  const isEmpty = items.length === 0

  return (
    <div className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Handlekurv</h1>

        {isEmpty ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-6">Handlekurven din er tom</p>
            <Link href="/products">
              <Button variant="primary">Fortsett å handle</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Varer ({items.length})
                </h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </div>

            {/* Cart Summary */}
            <CartSummary cart={cart} />
          </div>
        )}
      </div>
    </div>
  )
}
