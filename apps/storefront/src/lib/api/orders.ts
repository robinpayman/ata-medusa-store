import medusaClient from "@/lib/medusa-client"

export async function completeCart(cartId: string) {
  try {
    const response = await medusaClient.store.cart.complete(cartId)
    return response
  } catch (error) {
    console.error("Error completing cart:", error)
    throw error
  }
}

export async function getOrder(orderId: string) {
  try {
    const order = await medusaClient.store.order.retrieve(orderId)
    return order
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error)
    throw error
  }
}

export async function listOrders(email: string) {
  try {
    const orders = await medusaClient.store.order.list({
      email,
    })
    return orders
  } catch (error) {
    console.error(`Error fetching orders for ${email}:`, error)
    throw error
  }
}

export async function cancelOrder(orderId: string) {
  try {
    const order = await medusaClient.store.order.cancel(orderId)
    return order
  } catch (error) {
    console.error(`Error canceling order ${orderId}:`, error)
    throw error
  }
}
