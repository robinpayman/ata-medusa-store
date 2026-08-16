import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows"

/**
 * Removes the Medusa starter's demo products (T-Shirt, Sweatshirt,
 * Sweatpants, Shorts) that were created by the initial data seed.
 *
 * These are identified by having no `external_id`: every real product
 * imported from WooCommerce has its WordPress ID stored there, so any
 * product without one is leftover seed/demo data, not real catalogue data.
 */
export default async function deleteDemoProducts({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: demoProducts } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle", "external_id"],
  })

  const toDelete = demoProducts.filter((p) => !p.external_id)

  if (!toDelete.length) {
    logger.info("No demo products found (none without external_id).")
    return
  }

  logger.info(
    `Deleting ${toDelete.length} demo product(s): ${toDelete
      .map((p) => p.title)
      .join(", ")}`
  )

  await deleteProductsWorkflow(container).run({
    input: { ids: toDelete.map((p) => p.id) },
  })

  logger.info("Demo products deleted.")
}
