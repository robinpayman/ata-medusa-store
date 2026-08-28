import { getCategories } from "@lib/data/server-categories"
import CategoryMenu from "./CategoryMenu"

export default async function CategoryMenuWrapper() {
  const categories = await getCategories()

  return <CategoryMenu categories={categories} />
}
