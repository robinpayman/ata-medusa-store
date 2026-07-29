"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import {
  getOrCreateCart,
  addToCart as addToCartAPI,
  removeFromCart as removeFromCartAPI,
  updateLineItem as updateLineItemAPI,
  getCart as getCartAPI,
  getCartId,
  clearCartId,
} from "@/lib/api/cart"

export interface CartContextType {
  cartId: string | null
  cart: any | null
  loading: boolean
  error: string | null
  addToCart: (variantId: string, quantity: number) => Promise<void>
  removeFromCart: (lineItemId: string) => Promise<void>
  updateLineItem: (lineItemId: string, quantity: number) => Promise<void>
  refreshCart: () => Promise<void>
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(null)
  const [cart, setCart] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize cart on mount
  useEffect(() => {
    const initializeCart = async () => {
      try {
        setLoading(true)
        const existingCartId = getCartId()

        if (existingCartId) {
          const cartData = await getCartAPI(existingCartId)
          setCartId(existingCartId)
          setCart(cartData)
        } else {
          const newCart = await getOrCreateCart()
          setCartId(newCart.id)
          setCart(newCart)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize cart")
      } finally {
        setLoading(false)
      }
    }

    initializeCart()
  }, [])

  const addToCart = async (variantId: string, quantity: number) => {
    try {
      setError(null)
      if (!cartId) return

      const updatedCart = await addToCartAPI(cartId, variantId, quantity)
      setCart(updatedCart)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add to cart")
      throw err
    }
  }

  const removeFromCart = async (lineItemId: string) => {
    try {
      setError(null)
      if (!cartId) return

      const updatedCart = await removeFromCartAPI(cartId, lineItemId)
      setCart(updatedCart)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove from cart")
      throw err
    }
  }

  const updateLineItem = async (lineItemId: string, quantity: number) => {
    try {
      setError(null)
      if (!cartId) return

      if (quantity <= 0) {
        await removeFromCart(lineItemId)
        return
      }

      const updatedCart = await updateLineItemAPI(cartId, lineItemId, quantity)
      setCart(updatedCart)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update cart")
      throw err
    }
  }

  const refreshCart = async () => {
    try {
      setError(null)
      if (!cartId) return

      const updatedCart = await getCartAPI(cartId)
      setCart(updatedCart)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh cart")
      throw err
    }
  }

  const clearCart = () => {
    setCartId(null)
    setCart(null)
    clearCartId()
  }

  return (
    <CartContext.Provider
      value={{
        cartId,
        cart,
        loading,
        error,
        addToCart,
        removeFromCart,
        updateLineItem,
        refreshCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
