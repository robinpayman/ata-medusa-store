"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/Button"
import { useAuth } from "@/context/AuthContext"

export default function AccountPage() {
  const { customer, isLoading, isAuthenticated, logout } = useAuth()
  const router = useRouter()

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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Min Konto</h1>
          <p className="text-gray-600 mb-6">
            Du må logge inn for å se dine kontodetaljer.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/login")}
          >
            Logg inn
          </Button>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Account Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hei, {customer?.first_name}!
          </h1>
          <p className="text-gray-600">
            Velg en handling nedenfor for å administrere kontoen din
          </p>
        </div>

        {/* Account Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Order History */}
          <Link
            href="/account/orders"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ordrehistorikk
            </h3>
            <p className="text-gray-600 text-sm">
              Se dine tidligere bestillinger og status
            </p>
          </Link>

          {/* Addresses */}
          <Link
            href="/account/addresses"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Adresser
            </h3>
            <p className="text-gray-600 text-sm">
              Administrer dine leverings- og fakturaadresser
            </p>
          </Link>

          {/* Profile Settings */}
          <Link
            href="/account/profile"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H5a2 2 0 00-2 2v10a2 2 0 002 2h5m0 0V4m0 12h9a2 2 0 012 2v10a2 2 0 01-2 2h-9m0 0V4"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Profilinnstillinger
            </h3>
            <p className="text-gray-600 text-sm">
              Oppdater dine personlige opplysninger og passord
            </p>
          </Link>

          {/* Account Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Kontoinformasjon
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">E-post</p>
                <p className="font-medium text-gray-900">{customer?.email}</p>
              </div>
              {customer?.phone && (
                <div>
                  <p className="text-sm text-gray-600">Telefon</p>
                  <p className="font-medium text-gray-900">{customer.phone}</p>
                </div>
              )}
              {customer?.created_at && (
                <div>
                  <p className="text-sm text-gray-600">Medlem siden</p>
                  <p className="font-medium text-gray-900">
                    {new Date(customer.created_at).toLocaleDateString("no-NO")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="md"
            onClick={handleLogout}
          >
            Logg ut
          </Button>
        </div>
      </div>
    </div>
  )
}
