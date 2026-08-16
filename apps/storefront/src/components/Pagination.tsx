interface PaginationProps {
  currentPage: number
  totalPages: number
  /** Builds the href for a given page number. */
  buildHref: (page: number) => string
}

/**
 * Returns a windowed list of page numbers with `"ellipsis"` markers for
 * gaps, e.g. for page 8 of 45: [1, "ellipsis", 7, 8, 9, "ellipsis", 45].
 *
 * Rendering every page number in a flat row breaks down once a catalogue
 * has more than a handful of pages (530 products / 12 per page = 45 pages)
 * — the row simply overflows the viewport width. Windowing keeps the
 * control usable and bounded in width regardless of catalogue size.
 */
function getPageNumbers(
  current: number,
  total: number
): Array<number | "ellipsis"> {
  const neighbors = 1
  const pages: Array<number | "ellipsis"> = [1]

  const left = Math.max(2, current - neighbors)
  const right = Math.min(total - 1, current + neighbors)

  if (left > 2) {
    pages.push("ellipsis")
  }

  for (let page = left; page <= right; page++) {
    pages.push(page)
  }

  if (right < total - 1) {
    pages.push("ellipsis")
  }

  if (total > 1) {
    pages.push(total)
  }

  return pages
}

export default function Pagination({
  currentPage,
  totalPages,
  buildHref,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const pages = getPageNumbers(currentPage, totalPages)

  return (
    <nav
      aria-label="Sidenavigering"
      className="mt-12 flex flex-wrap items-center justify-center gap-2"
    >
      <a
        href={buildHref(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={`px-3 py-2 rounded ${
          currentPage === 1
            ? "pointer-events-none text-gray-300"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        Forrige
      </a>

      {pages.map((page, index) =>
        page === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="px-2 text-gray-400 select-none"
          >
            …
          </span>
        ) : (
          <a
            key={page}
            href={buildHref(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`px-4 py-2 rounded ${
              page === currentPage
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {page}
          </a>
        )
      )}

      <a
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded ${
          currentPage === totalPages
            ? "pointer-events-none text-gray-300"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        Neste
      </a>
    </nav>
  )
}
