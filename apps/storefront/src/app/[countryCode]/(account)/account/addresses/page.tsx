"use client"

import Link from "next/link"
import { Button } from "@/components/Button"
import { useAuth } from "@/context/AuthContext"

export default function AddressesPage() {
  const { customer, isAuthenticated, isLoading } = useAuth()

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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Adresser</h1>
          <p className="text-gray-600 mb-6">
            Du må logge inn for å administrere dine adresser.
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
        <Link href="/account" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Tilbake til konto
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Adresser</h1>
          <p className="text-gray-600">
            Administrer dine leverings- og fakturaadresser
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              Du har ikke lagret noen adresser ennå.
            </p>
            <Button
              variant="primary"
              size="lg"
              className="inline-block"
            >
              Legg til adresse
            </Button>
          </div>
        </div>

        {customer?.shipping_addresses && customer.shipping_addresses.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Leveringsadresser
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.shipping_addresses.map((address: any, index: number) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {address.first_name} {address.last_name}
                  </h3>
                  <p className="text-gray-600 text-sm">{address.address_1}</p>
                  {address.address_2 && (
                    <p className="text-gray-600 text-sm">{address.address_2}</p>
                  )}
                  <p className="text-gray-600 text-sm">
                    {address.postal_code} {address.city}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm">
                      Rediger
                    </Button>
                    <Button variant="outline" size="sm">
                      Slett
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
