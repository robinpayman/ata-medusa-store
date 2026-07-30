"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { getCurrentCustomer, logoutCustomer } from "@/lib/api/auth"

interface Customer {
  id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  billing_address?: any
  shipping_addresses?: any[]
  created_at?: string
}

interface AuthContextType {
  customer: Customer | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
  refreshCustomer: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentCustomer = await getCurrentCustomer()
        setCustomer(currentCustomer)
      } catch (error) {
        // Silently handle init errors - 401 is expected for unauthenticated visitors
        console.debug("Auth initialization debug:", error)
        setCustomer(null)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const logout = async () => {
    try {
      await logoutCustomer()
      setCustomer(null)
    } catch (error) {
      console.error("Logout failed:", error)
      throw error
    }
  }

  const refreshCustomer = async () => {
    try {
      const currentCustomer = await getCurrentCustomer()
      setCustomer(currentCustomer)
    } catch (error) {
      console.error("Failed to refresh customer:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        customer,
        isLoading,
        isAuthenticated: customer !== null,
        logout,
        refreshCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
