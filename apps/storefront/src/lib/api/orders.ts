import medusaClient from "@/lib/medusa-client"

export async function completeCart(cartId: string) {
  if (!cartId) {
    throw new Error("Cart ID is required to complete cart")
  }
  try {
    const response = await medusaClient.store.cart.complete(cartId)

    // Medusa resolves this call normally even when completion fails
    // validation (e.g. missing shipping address, payment not authorized):
    // the response is a discriminated union of
    // `{ type: "order", order }` or `{ type: "cart", cart, error }`.
    // Treating the response as if it were always the order directly meant
    // a failed checkout would silently look successful and navigate to a
    // confirmation page with no real order behind it.
    if (response.type === "cart") {
      throw new Error(
        response.error?.message || "Kunne ikke fullføre bestillingen"
      )
    }

    return response.order
  } catch (error) {
    console.debug("Debug: Error completing cart:", error)
    throw error
  }
}

export async function getOrder(orderId: string) {
  if (!orderId) {
    throw new Error("Order ID is required to fetch order")
  }
  try {
    const order = await medusaClient.store.order.retrieve(orderId)
    return order
  } catch (error) {
    console.debug(`Debug: Error fetching order ${orderId}:`, error)
    throw error
  }
}

export async function listOrders(email: string) {
  if (!email) {
    throw new Error("Email is required to fetch orders")
  }
  try {
    const orders = await medusaClient.store.order.list({
      email,
    })
    return orders
  } catch (error) {
    console.debug(`Debug: Error fetching orders for ${email}:`, error)
    throw error
  }
}

export async function cancelOrder(orderId: string) {
  if (!orderId) {
    throw new Error("Order ID is required to cancel order")
  }
  try {
    const order = await medusaClient.store.order.cancel(orderId)
    return order
  } catch (error) {
    console.debug(`Debug: Error canceling order ${orderId}:`, error)
    throw error
  }
}
