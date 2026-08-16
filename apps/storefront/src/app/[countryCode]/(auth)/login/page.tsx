"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/Button"
import { loginCustomer } from "@/lib/api/auth"
import { useAuth } from "@/context/AuthContext"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { refreshCustomer } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await loginCustomer(email, password)
      await refreshCustomer()
      router.push("/account")
    } catch (err: any) {
      setError(err.message || "Innlogging feilet. Prøv igjen.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Logg inn
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Velg din profil og handleliste
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-postadresse
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              placeholder="ditt@eksempel.no"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Passord
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Logger inn..." : "Logg inn"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Har du ikke konto?{" "}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Opprett konto
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link href="/password-reset" className="text-sm text-blue-600 hover:text-blue-700">
            Glemt passord?
          </Link>
        </div>
      </div>
    </div>
  )
}
