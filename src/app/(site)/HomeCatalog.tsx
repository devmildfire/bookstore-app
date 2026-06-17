import { getBooks, parseBookFilters } from '@/api/books'
import NewProducts from '@/components/book/NewProducts'

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
  const catalog = await getBooks(filters)

  return <NewProducts catalog={catalog} filters={filters} />
}
