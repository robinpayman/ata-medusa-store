import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createTaxRatesWorkflow,
  createPricePreferencesWorkflow,
  updatePricePreferencesWorkflow,
} from "@medusajs/medusa/core-flows"

const NORWAY_VAT_RATE = 25

/**
 * Wires up real Norwegian MVA calculation on top of prices that are already
 * VAT-inclusive (imported from WooCommerce's price_inc_vat).
 *
 * Two independent pieces have to agree, or checkout either double-charges
 * VAT or shows none at all:
 *
 * 1. A tax rate must exist for the "no" tax region, or the tax engine has
 *    nothing to calculate and every cart's tax_total stays 0.
 * 2. Medusa must know the stored NOK prices already include that tax
 *    (`PricePreference.is_tax_inclusive` for attribute "currency_code",
 *    value "nok"). Without this, adding a tax rate would ADD 25% on top of
 *    the already-inclusive price instead of splitting it into a net amount
 *    plus the VAT contained within it.
 *
 * With both in place, Medusa's own totals math (see
 * @medusajs/utils totals/line-item) computes:
 *   subtotal (ex VAT)  = unit_price / (1 + rate)
 *   tax_total          = subtotal * rate
 *   total              = subtotal + tax_total   (unchanged from today)
 * i.e. the price charged to the customer never changes; it's just correctly
 * split into a net amount and a VAT amount.
 */
export default async function setupNorwayVat({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  // ---------------------------------------------------------------------
  // 1. Ensure NOK prices are flagged as tax-inclusive
  // ---------------------------------------------------------------------
  const { data: pricePreferences } = await query.graph({
    entity: "price_preference",
    fields: ["id", "attribute", "value", "is_tax_inclusive"],
  })

  const nokPreference = pricePreferences.find(
    (p) => p.attribute === "currency_code" && p.value === "nok"
  )

  if (nokPreference?.is_tax_inclusive) {
    logger.info("NOK prices are already flagged as tax-inclusive, skipping.")
  } else if (nokPreference) {
    await updatePricePreferencesWorkflow(container).run({
      input: {
        selector: { id: [nokPreference.id] },
        update: { is_tax_inclusive: true },
      },
    })
    logger.info("Updated the NOK price preference to be tax-inclusive.")
  } else {
    await createPricePreferencesWorkflow(container).run({
      input: [
        {
          attribute: "currency_code",
          value: "nok",
          is_tax_inclusive: true,
        },
      ],
    })
    logger.info("Created a tax-inclusive price preference for NOK.")
  }

  // ---------------------------------------------------------------------
  // 2. Ensure a 25% default tax rate exists for the Norwegian tax region
  // ---------------------------------------------------------------------
  const { data: taxRegions } = await query.graph({
    entity: "tax_region",
    fields: ["id", "country_code"],
  })

  const norwayTaxRegion = taxRegions.find((r) => r.country_code === "no")

  if (!norwayTaxRegion) {
    logger.error(
      "No Norwegian tax region found. Run setup-norway.ts before this script."
    )
    return
  }

  const { data: existingRates } = await query.graph({
    entity: "tax_rate",
    fields: ["id", "rate", "tax_region_id"],
    filters: { tax_region_id: norwayTaxRegion.id },
  })

  if (existingRates.length > 0) {
    logger.info(
      `Tax region already has ${existingRates.length} rate(s) (e.g. ${existingRates[0].rate}%), skipping.`
    )
  } else {
    await createTaxRatesWorkflow(container).run({
      input: [
        {
          tax_region_id: norwayTaxRegion.id,
          rate: NORWAY_VAT_RATE,
          code: "MVA",
          name: "MVA (25%)",
          is_default: true,
        },
      ],
    })
    logger.info(`Created a ${NORWAY_VAT_RATE}% default MVA tax rate for Norway.`)
  }

  logger.info("Norway VAT setup complete.")
}
