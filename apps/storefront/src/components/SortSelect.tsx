"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

const SORT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "Anbefalt" },
  { value: "created_at", label: "Nyeste f\u00f8rst" },
  { value: "price_asc", label: "Pris: Lav til h\u00f8y" },
  { value: "price_desc", label: "Pris: H\u00f8y til lav" },
  { value: "title_asc", label: "Navn: A-\u00c5" },
  { value: "title_desc", label: "Navn: \u00c5-A" },
]

interface SortSelectProps {
  currentSort?: string
}

export default function SortSelect({ currentSort }: SortSelectProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())

    if (e.target.value) {
      params.set("sort", e.target.value)
    } else {
      params.delete("sort")
    }

    // A new sort order invalidates the current page number.
    params.delete("page")

    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <span className="whitespace-nowrap">Sorter etter</span>
      <select
        value={currentSort || ""}
        onChange={handleChange}
        className="rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
