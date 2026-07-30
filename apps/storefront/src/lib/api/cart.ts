import medusaClient from "@/lib/medusa-client"

const CART_ID_STORAGE_KEY = "medusa_cart_id"

export async function getOrCreateCart(regionId?: string) {
  try {
    let cartId = localStorage?.getItem(CART_ID_STORAGE_KEY)

    if (cartId) {
      try {
        const cart = await medusaClient.store.cart.retrieve(cartId)
        return cart
      } catch (error) {
        // Cart not found or expired - this is normal on first load
        console.debug("Debug: Existing cart not found, creating new cart", error)
        localStorage?.removeItem(CART_ID_STORAGE_KEY)
        cartId = null
      }
    }

    const cart = await medusaClient.store.cart.create({
      ...(regionId && { region_id: regionId }),
    })

    if (localStorage) {
      localStorage.setItem(CART_ID_STORAGE_KEY, cart.id)
    }

    return cart
  } catch (error) {
    console.debug("Debug: Error creating cart:", error)
    throw error
  }
}

export async function getCart(cartId: string) {
  if (!cartId) {
    console.debug("Cart ID is empty, skipping retrieve")
    return null
  }
  try {
    const cart = await medusaClient.store.cart.retrieve(cartId)
    return cart
  } catch (error) {
    console.debug(`Debug: Error fetching cart ${cartId}:`, error)
    throw error
  }
}

export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number
) {
  if (!cartId) {
    throw new Error("Cart ID is required to add items")
  }
  try {
    const cart = await medusaClient.store.cart.createLineItems(cartId, {
      items: [
        {
          variant_id: variantId,
          quantity,
        },
      ],
    })
    return cart
  } catch (error) {
    console.debug("Debug: Error adding to cart:", error)
    throw error
  }
}

export async function updateLineItem(
  cartId: string,
  lineItemId: string,
  quantity: number
) {
  if (!cartId) {
    throw new Error("Cart ID is required to update items")
  }
  try {
    const cart = await medusaClient.store.cart.updateLineItems(cartId, {
      items: [
        {
          id: lineItemId,
          quantity,
        },
      ],
    })
    return cart
  } catch (error) {
    console.debug("Debug: Error updating line item:", error)
    throw error
  }
}

export async function removeFromCart(cartId: string, lineItemId: string) {
  if (!cartId) {
    throw new Error("Cart ID is required to remove items")
  }
  try {
    const cart = await medusaClient.store.cart.deleteLineItems(
      cartId,
      lineItemId
    )
    return cart
  } catch (error) {
    console.debug("Debug: Error removing from cart:", error)
    throw error
  }
}

export async function updateCart(cartId: string, data: any) {
  if (!cartId) {
    throw new Error("Cart ID is required to update cart")
  }
  try {
    const cart = await medusaClient.store.cart.update(cartId, data)
    return cart
  } catch (error) {
    console.debug("Debug: Error updating cart:", error)
    throw error
  }
}

export async function getShippingMethods(cartId: string) {
  if (!cartId) {
    console.debug("Cart ID is empty, skipping shipping methods fetch")
    return null
  }
  try {
    const methods = await medusaClient.store.fulfillment.listCartOptions(
      cartId
    )
    return methods
  } catch (error) {
    console.debug("Debug: Error fetching shipping methods:", error)
    throw error
  }
}

export function clearCartId() {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(CART_ID_STORAGE_KEY)
  }
}

export function getCartId() {
  if (typeof localStorage !== "undefined") {
    return localStorage.getItem(CART_ID_STORAGE_KEY)
  }
  return null
}
