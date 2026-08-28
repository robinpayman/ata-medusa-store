import MegaMenu from "./MegaMenu"
import { getCategories } from "@/lib/data/server-categories"

export default async function MegaMenuWrapper() {
  const categories = await getCategories()

  if (!categories || categories.length === 0) {
    return null
  }

  return <MegaMenu categories={categories} />
}
