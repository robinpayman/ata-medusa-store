import Medusa from "@medusajs/js-sdk"

if (!process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_MEDUSA_BACKEND_URL is not set")
}

if (!process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
  throw new Error("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is not set")
}

const medusaClient = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})

export default medusaClient
