import type { BookFilters } from '@/entities/book/client'
import type { ProductCategory } from '@/types/database'
import { bookFiltersSearchParamsSchema } from '@/entities/book/validation'

type SearchParams = Record<string, string | string[] | undefined>

export function parseBookFilters(searchParams: SearchParams): BookFilters {
  const parsed = bookFiltersSearchParamsSchema.parse(searchParams)

  return {
    search: parsed.q,
    categories: [...parsed.type, ...parsed.category] as ProductCategory[],
    authors: parsed.author,
    years: parsed.year,
    priceFrom: parsed.priceFrom,
    priceTo: parsed.priceTo,
    sort: parsed.sort,
    page: parsed.page,
    limit: parsed.limit,
  }
}
