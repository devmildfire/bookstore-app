import { getBooks } from '@/api/books/getBooks'
import { parseBookFilters } from '@/api/books/parseBookFilters'
import DeferredCatalog from './DeferredCatalog'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// The searchParams-driven catalog grid, isolated so the home page can render it inside
// a <Suspense> boundary: awaiting searchParams here (not in the page) keeps the read +
// the heavy getBooks query off the static shell, so the hero / subscriptions / box-sets
// stream first and the filtered grid streams in behind the skeleton. This is also the
// prerequisite for the home route going static/PPR once cacheComponents is enabled.
export default async function HomeCatalog({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams
  const filters = parseBookFilters(resolvedSearchParams)
  // Fetch TWO batches up front (batch 1 visible + batch 2 hidden/eager render-ahead) so the
  // first "load more" reveals already-loaded cards with no client round-trip. Downstream
  // (NewProducts/BooksFeed) keep the original per-page `filters.limit` for client batches 3+.
  const catalog = await getBooks({ ...filters, limit: filters.limit * 2 })

  // Data fetched server-side (no client round-trip); the heavy render — grid DOM, cover
  // images, CSS, hydration — is deferred to scroll by DeferredCatalog, keeping it out of
  // the LCP window. The catalog is below the fold on mobile after the tall hero.
  return <DeferredCatalog catalog={catalog} filters={filters} />
}
