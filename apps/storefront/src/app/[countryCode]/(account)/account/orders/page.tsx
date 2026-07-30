"use client"

import Link from "next/link"
import { Button } from "@/components/Button"
import { useAuth } from "@/context/AuthContext"
import { listOrders } from "@/lib/api/orders"
import { useState, useEffect } from "react"

interface Order {
  id: string
  display_id: number
  created_at: string
  status: string
  total: number
  currency_code: string
}

export default function OrdersPage() {
  const { customer, isAuthenticated, isLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && !isLoading && customer?.email) {
      const loadOrders = async () => {
        try {
          const response = await listOrders(customer.email)
          setOrders(response.orders || [])
        } catch (error) {
          console.error("Failed to load orders:", error)
        } finally {
          setOrdersLoading(false)
        }
      }
      loadOrders()
    }
  }, [isAuthenticated, isLoading])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-gray-600">Laster...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Ordrer</h1>
          <p className="text-gray-600 mb-6">
            Du må logge inn for å se dine ordrer.
          </p>
          <Link href="/login">
            <Button variant="primary" size="lg">
              Logg inn
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/account" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Tilbake til konto
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Ordrehistorikk</h1>
          <p className="text-gray-600 mt-2">
            Se alle dine tidligere bestillinger
          </p>
        </div>

        {ordersLoading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">Laster ordrer...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-6">
              Du har ikke gjort noen bestillinger ennå.
            </p>
            <Link href="/products">
              <Button variant="primary" size="lg">
                Begynn å handle
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Ordre #{order.display_id}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "canceled"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {order.status === "completed"
                          ? "Levert"
                          : order.status === "pending"
                          ? "Avventer"
                          : order.status === "canceled"
                          ? "Avbrutt"
                          : "Behandles"}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Dato: {new Date(order.created_at).toLocaleDateString("no-NO")}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 md:text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {(order.total / 100).toFixed(2)} {order.currency_code?.toUpperCase()}
                    </p>
                    <Link href={`/account/orders/${order.id}`}>
                      <Button variant="outline" size="sm" className="mt-2">
                        Se detaljer
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
