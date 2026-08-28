import { getCategories } from '@lib/data/server-categories'
import Header from './Header'

export default async function HeaderWrapper() {
  const categories = await getCategories()

  return <Header categories={categories} />
}
