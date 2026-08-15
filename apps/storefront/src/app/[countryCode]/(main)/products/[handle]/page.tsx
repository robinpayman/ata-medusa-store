import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProductByHandle } from "@/lib/api/products"
import ProductDetail from "@/components/ProductDetail"

interface ProductPageProps {
  params: Promise<{
    countryCode: string
    handle: string
  }>
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { countryCode, handle } = await params
  const product = await getProductByHandle(handle, countryCode)

  if (!product) {
    return { title: "Produkt ikke funnet | ata treningsutstyr" }
  }

  const description =
    product.description?.slice(0, 160) ??
    `Kjøp ${product.title} hos ata treningsutstyr.`

  return {
    title: `${product.title} | ata treningsutstyr`,
    description,
    alternates: {
      canonical: `/${countryCode}/products/${product.handle}`,
    },
    openGraph: {
      title: `${product.title} | ata treningsutstyr`,
      description,
      type: "website",
      images: product.thumbnail ? [{ url: product.thumbnail }] : undefined,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { countryCode, handle } = await params
  const product = await getProductByHandle(handle, countryCode)

  // A missing product must be a real 404 so crawlers never index an error page.
  if (!product) {
    notFound()
  }

  return (
    <div className="w-full">
      <ProductDetail product={product} countryCode={countryCode} />
    </div>
  )
}
