import medusaClient from "@/lib/medusa-client"

export async function registerCustomer(
  email: string,
  password: string,
  firstName: string,
  lastName: string
) {
  try {
    const response = await medusaClient.store.customer.create({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    })
    return response.customer
  } catch (error) {
    console.error("Registration error:", error)
    throw error
  }
}

export async function loginCustomer(email: string, password: string) {
  try {
    const response = await medusaClient.store.auth.login({
      email,
      password,
    })
    return response.customer
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

export async function logoutCustomer() {
  try {
    await medusaClient.store.auth.logout()
  } catch (error) {
    console.error("Logout error:", error)
    throw error
  }
}

export async function getCurrentCustomer() {
  try {
    const response = await medusaClient.store.customer.retrieve()
    return response.customer
  } catch (error) {
    console.error("Get current customer error:", error)
    return null
  }
}

export async function updateCustomer(data: {
  email?: string
  password?: string
  first_name?: string
  last_name?: string
  phone?: string
}) {
  try {
    const response = await medusaClient.store.customer.update(data)
    return response.customer
  } catch (error) {
    console.error("Update customer error:", error)
    throw error
  }
}

export async function requestPasswordReset(email: string) {
  try {
    await medusaClient.store.auth.generateToken({
      email,
    })
  } catch (error) {
    console.error("Password reset request error:", error)
    throw error
  }
}

export async function resetPassword(
  email: string,
  token: string,
  password: string
) {
  try {
    const response = await medusaClient.store.auth.reset({
      email,
      token,
      password,
    })
    return response.customer
  } catch (error) {
    console.error("Password reset error:", error)
    throw error
  }
}
