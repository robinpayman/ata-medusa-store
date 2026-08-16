"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import {
  getOrCreateCart,
  addToCart as addToCartAPI,
  removeFromCart as removeFromCartAPI,
  updateLineItem as updateLineItemAPI,
  updateCart as updateCartAPI,
  getCart as getCartAPI,
  getCartId,
  clearCartId,
} from "@/lib/api/cart"
import { getStoreRegionId } from "@/lib/api/regions"

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

  // Resolves to a real cart, creating one if none exists yet. Used both by
  // the init effect and lazily by addToCart, so an add-to-cart click can
  // never silently no-op just because initialization hasn't finished, is
  // still in flight, or failed for a transient reason - all of which
  // previously left `cartId` null with no way to recover.
  const resolveCart = async (existingCartId: string | null) => {
    // Carts created without a region_id silently default to whatever region
    // Medusa returns first, which is not necessarily the region the
    // customer is actually shopping in. Every real product here only has a
    // price in the storefront's own region, so a cart stuck in the wrong
    // region fails to accept any line item.
    const regionId = await getStoreRegionId()

    if (existingCartId) {
      try {
        let cartData = await getCartAPI(existingCartId)

        if (!cartData) {
          throw new Error("Cart not found")
        }

        // Self-heal carts created before this fix, or carts left over from
        // a different region, instead of leaving them permanently unable
        // to accept new items.
        if (regionId && cartData.region_id !== regionId) {
          cartData = await updateCartAPI(existingCartId, {
            region_id: regionId,
          })
        }

        return cartData
      } catch (err) {
        // Existing cart is gone, expired, or couldn't be moved to the
        // right region (e.g. it was already completed) - fall through to
        // creating a fresh one below rather than leaving the cart unusable.
        console.debug("Debug: Existing cart unusable, creating a new one", err)
      }
    }

    return getOrCreateCart(regionId ?? undefined)
  }

  // Initialize cart on mount
  useEffect(() => {
    const initializeCart = async () => {
      try {
        setLoading(true)
        const cartData = await resolveCart(getCartId())
        setCartId(cartData.id)
        setCart(cartData)
      } catch (err) {
        // A failure here just means the lazy fallback in addToCart will try
        // again on the next add-to-cart click instead of a cart already
        // being ready on page load.
        console.debug("Cart initialization debug:", err)
        setError(null)
      } finally {
        setLoading(false)
      }
    }

    initializeCart()
  }, [])

  const addToCart = async (variantId: string, quantity: number) => {
    try {
      setError(null)

      // cartId can still be null here if initialization hasn't finished, is
      // still in flight, or failed - resolve a real cart on demand instead
      // of silently doing nothing, which used to report a false success to
      // the caller.
      let id = cartId
      if (!id) {
        const cartData = await resolveCart(null)
        id = cartData.id
        setCartId(id)
        setCart(cartData)
      }

      const updatedCart = await addToCartAPI(id, variantId, quantity)
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
