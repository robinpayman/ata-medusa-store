export interface CalculatedPrice {
  calculated_amount?: number | null
  currency_code?: string | null
}

/**
 * Medusa v2 returns prices in major units (e.g. `10` means 10 EUR), so the
 * amount must never be divided by 100 the way Medusa v1's minor-unit prices
 * were. The currency comes from the region the price was calculated in
 * rather than being hard coded, and `calculated_price` itself is only
 * populated when the request that fetched the product included a
 * `region_id`.
 */
export function formatPrice(price?: CalculatedPrice | null): string | null {
  const amount = price?.calculated_amount

  if (typeof amount !== "number") {
    return null
  }

  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: (price?.currency_code ?? "nok").toUpperCase(),
  }).format(amount)
}
