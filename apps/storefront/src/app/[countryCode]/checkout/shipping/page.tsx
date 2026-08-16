"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/CartContext"
import { Button } from "@/components/Button"

interface ShippingFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address1: string
  address2: string
  city: string
  postalCode: string
  country: string
}

export default function ShippingPage() {
  const router = useRouter()
  const { cart, loading } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ShippingFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    postalCode: "",
    country: "NO",
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.address1 ||
      !formData.city ||
      !formData.postalCode
    ) {
      setError("Fyll ut alle påkrevde felt")
      return
    }

    try {
      setIsSubmitting(true)
      // Store shipping data in session/context and proceed
      sessionStorage.setItem("shippingData", JSON.stringify(formData))
      router.push("/checkout/payment")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke fortsette")
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

  const isEmpty = !cart || !cart.items || cart.items.length === 0

  if (isEmpty) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <p className="text-gray-500 text-lg mb-6">Handlekurven din er tom</p>
        <a href="/products">
          <Button variant="primary">Fortsett å handle</Button>
        </a>
      </div>
    )
  }

  return (
    <div className="w-full bg-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leveringsadresse</h1>
        <p className="text-gray-600 mb-8">Steg 1 av 3</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fornavn *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Etternavn *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-post *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse *
            </label>
            <input
              type="text"
              name="address1"
              value={formData.address1}
              onChange={handleInputChange}
              placeholder="Gateadresse"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresselinje 2
            </label>
            <input
              type="text"
              name="address2"
              value={formData.address2}
              onChange={handleInputChange}
              placeholder="Leilighet, etasje osv."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Poststed *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postnummer *
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Land *
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="NO">Norge</option>
                <option value="SE">Sverige</option>
                <option value="DK">Danmark</option>
                <option value="FI">Finland</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <a href="/cart" className="flex-1">
              <Button variant="outline" className="w-full">
                Tilbake til handlekurv
              </Button>
            </a>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {isSubmitting ? "Behandler..." : "Fortsett til leveringsmetode"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
