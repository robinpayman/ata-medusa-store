import medusaClient from "@/lib/medusa-client"

const CART_ID_STORAGE_KEY = "medusa_cart_id"

/**
 * Every `medusaClient.store.cart.*` method resolves to a response wrapped
 * as `{ cart: StoreCart }`, not the cart itself (confirmed against the SDK's
 * `StoreCartResponse` type). None of the functions below used to unwrap
 * this, so every consumer reading `cart.id`, `cart.items`, `cart.total`,
 * etc. was reading those properties one level too shallow and always
 * getting `undefined` - the cart could never actually work correctly.
 */
function unwrapCart<T extends { cart: unknown }>(response: T): T["cart"] {
  return response.cart
}

export async function getOrCreateCart(regionId?: string) {
  try {
    let cartId = localStorage?.getItem(CART_ID_STORAGE_KEY)

    if (cartId) {
      try {
        const cart = unwrapCart(await medusaClient.store.cart.retrieve(cartId))
        return cart
      } catch (error) {
        // Cart not found or expired - this is normal on first load
        console.debug("Debug: Existing cart not found, creating new cart", error)
        localStorage?.removeItem(CART_ID_STORAGE_KEY)
        cartId = null
      }
    }

    const cart = unwrapCart(
      await medusaClient.store.cart.create({
        ...(regionId && { region_id: regionId }),
      })
    )

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
    const cart = unwrapCart(await medusaClient.store.cart.retrieve(cartId))
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
    // The SDK's method (and request body) is singular: `createLineItem`
    // taking `{ variant_id, quantity }` directly. The previous plural
    // `createLineItems({ items: [...] })` call doesn't exist on the SDK at
    // all, so it silently produced a rejected promise for every add-to-cart
    // attempt that actually reached this function.
    const cart = unwrapCart(
      await medusaClient.store.cart.createLineItem(cartId, {
        variant_id: variantId,
        quantity,
      })
    )
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
    const cart = unwrapCart(
      await medusaClient.store.cart.updateLineItem(cartId, lineItemId, {
        quantity,
      })
    )
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
    // Deleting a line item responds with { deleted, id, object, parent },
    // not { cart }: the updated cart is under `parent`.
    const response = await medusaClient.store.cart.deleteLineItem(
      cartId,
      lineItemId
    )
    return response.parent
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
    const cart = unwrapCart(await medusaClient.store.cart.update(cartId, data))
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
