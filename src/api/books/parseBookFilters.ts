import type { BookFilters } from '@/entities/book/client'
import type { ProductCategory } from '@/types/database'
import { bookFiltersSearchParamsSchema } from '@/entities/book/validation'

type SearchParams = Record<string, string | string[] | undefined>

export function parseBookFilters(searchParams: SearchParams): BookFilters {
  const params = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  )
  const parsed = bookFiltersSearchParamsSchema.parse(params)

  return {
    search: parsed.q,
    category: parsed.category === 'all' ? 'all' : (parsed.category as ProductCategory),
    author: parsed.author,
    priceFrom: parsed.priceFrom,
    priceTo: parsed.priceTo,
    sort: parsed.sort,
    page: parsed.page,
  }
}
