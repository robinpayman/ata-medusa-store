import medusaClient from "@/lib/medusa-client"

export async function completeCart(cartId: string) {
  if (!cartId) {
    throw new Error("Cart ID is required to complete cart")
  }
  try {
    const response = await medusaClient.store.cart.complete(cartId)
    return response
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
