import medusaClient from "@/lib/medusa-client"

const DEFAULT_REGION_COUNTRY_CODE =
  process.env.NEXT_PUBLIC_DEFAULT_REGION || "no"

let cachedRegionId: string | null = null

/**
 * Resolves the region ID the cart should be created in.
 *
 * Carts created without a `region_id` silently default to whatever region
 * Medusa returns first (in this store, "Europe" / EUR), not the region the
 * customer is actually browsing in. Since every real product only has a NOK
 * price, adding it to a EUR cart fails outright with an error that was only
 * ever logged to the console, so the cart looked like it was doing nothing.
 *
 * The result is cached for the lifetime of the page since the store's
 * regions rarely change and this only needs to run once per session.
 */
export async function getStoreRegionId(): Promise<string | null> {
  if (cachedRegionId) {
    return cachedRegionId
  }

  try {
    const { regions } = await medusaClient.store.region.list()

    const matchingRegion = regions.find((region) =>
      region.countries?.some(
        (country) => country.iso_2 === DEFAULT_REGION_COUNTRY_CODE
      )
    )

    const region = matchingRegion ?? regions[0]
    cachedRegionId = region?.id ?? null
    return cachedRegionId
  } catch (error) {
    console.error("Failed to resolve store region:", error)
    return null
  }
}
