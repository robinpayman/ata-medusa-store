import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createRegionsWorkflow,
  createTaxRegionsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"

/**
 * Prepares the store for the Norwegian catalogue.
 *
 * Medusa refuses to create a region whose currency is not listed in the
 * store's `supported_currencies`, so the store must be updated before the
 * region is created. Every step is guarded so the script can be re-run
 * safely.
 */
export default async function setupNorway({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  // ---------------------------------------------------------------------
  // 1. Make NOK a supported store currency
  // ---------------------------------------------------------------------
  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "supported_currencies.currency_code"],
  })

  const store = stores[0]

  if (!store) {
    logger.error("No store found. Run the initial data seed first.")
    return
  }

  const existingCurrencies: string[] = (store.supported_currencies ?? [])
    .map((c) => c?.currency_code)
    .filter((code): code is string => Boolean(code))

  if (existingCurrencies.includes("nok")) {
    logger.info("Store already supports NOK, skipping currency update.")
  } else {
    // NOK becomes the default; the other currencies are retained so existing
    // EUR/USD prices on the demo products keep resolving.
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: {
          supported_currencies: [
            { currency_code: "nok", is_default: true },
            ...existingCurrencies.map((currency_code) => ({
              currency_code,
              is_default: false,
            })),
          ],
        },
      },
    })

    logger.info("Added NOK to store supported currencies (now default).")
  }

  // ---------------------------------------------------------------------
  // 2. Create the Norwegian region
  // ---------------------------------------------------------------------
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code"],
  })

  let norwayRegionId = regions.find((r) => r?.currency_code === "nok")?.id

  if (norwayRegionId) {
    logger.info(`NOK region already exists (${norwayRegionId}), skipping.`)
  } else {
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Norway",
            currency_code: "nok",
            countries: ["no"],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    })

    norwayRegionId = result[0]?.id
    logger.info(`Created Norway region (${norwayRegionId}).`)
  }

  // ---------------------------------------------------------------------
  // 3. Create the Norwegian tax region
  // ---------------------------------------------------------------------
  const { data: taxRegions } = await query.graph({
    entity: "tax_region",
    fields: ["id", "country_code"],
  })

  const hasNorwegianTaxRegion = taxRegions.some(
    (t) => t?.country_code === "no"
  )

  if (hasNorwegianTaxRegion) {
    logger.info("Norwegian tax region already exists, skipping.")
  } else {
    await createTaxRegionsWorkflow(container).run({
      input: [{ country_code: "no", provider_id: "tp_system" }],
    })

    logger.info("Created Norwegian tax region.")
  }

  logger.info("Norway setup complete.")
}
