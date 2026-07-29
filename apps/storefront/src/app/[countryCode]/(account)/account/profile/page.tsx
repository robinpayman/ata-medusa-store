"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/Button"
import { updateCustomer } from "@/lib/api/auth"
import { useAuth } from "@/context/AuthContext"

export default function ProfilePage() {
  const { customer, isAuthenticated, isLoading, refreshCustomer } = useAuth()
  const [formData, setFormData] = useState({
    first_name: customer?.first_name || "",
    last_name: customer?.last_name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
  })
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Profilinnstillinger</h1>
          <p className="text-gray-600 mb-6">
            Du må logge inn for å redigere profilen din.
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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPassword((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setIsSubmitting(true)

    try {
      await updateCustomer({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
      })
      await refreshCustomer()
      setMessage("Profilen ble oppdatert!")
    } catch (err: any) {
      setError(err.message || "Feil ved oppdatering av profil")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (password.new !== password.confirm) {
      setError("De nye passordene stemmer ikke overens")
      return
    }

    if (password.new.length < 8) {
      setError("Passord må være minst 8 tegn")
      return
    }

    setIsSubmitting(true)

    try {
      await updateCustomer({
        password: password.new,
      })
      setPassword({ current: "", new: "", confirm: "" })
      setMessage("Passord ble endret!")
    } catch (err: any) {
      setError(err.message || "Feil ved endring av passord")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/account" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Tilbake til konto
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Profilinnstillinger</h1>

          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          {/* Personal Information Form */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Personlig informasjon
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Fornavn
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Etternavn
                  </label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-postadresse
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Oppdaterer..." : "Oppdater profil"}
              </Button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Endre passord
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="current" className="block text-sm font-medium text-gray-700 mb-1">
                  Nåværende passord
                </label>
                <input
                  id="current"
                  name="current"
                  type="password"
                  value={password.current}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="new" className="block text-sm font-medium text-gray-700 mb-1">
                  Nytt passord
                </label>
                <input
                  id="new"
                  name="new"
                  type="password"
                  value={password.new}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 8 tegn</p>
              </div>

              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
                  Bekreft passord
                </label>
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  value={password.confirm}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Endrer passord..." : "Endre passord"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
