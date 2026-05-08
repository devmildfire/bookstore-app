import { createDataClient } from '@/lib/supabase/server'
import type { ProductCategory } from '@/types/database'
import type { BookCatalog, BookFilters } from '@/entities/book/client'
import { normalizeBook } from '@/entities/book/normalize'
import type { BookServerRow } from '@/entities/book/server'

export const booksQueryKey = (filters: BookFilters) => ['books', filters] as const

type CatalogRpcRow = BookServerRow & { total_count: number }
type RpcFn = (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>

const CATALOG_FILTER_OPTIONS_LIMIT = 10000

export async function getBooks(filters: BookFilters): Promise<BookCatalog> {
  const supabase = createDataClient()
  const pageSize = filters.limit
  const offset = (filters.page - 1) * pageSize

  const [rpcResult, filterOptionsResult] = await Promise.all([
    (supabase.rpc as unknown as RpcFn)('get_catalog_books', {
      result_limit: pageSize,
      result_offset: offset,
      search_term: filters.search || null,
      product_type_filters: filters.categories,
      author_names_filter: filters.authors,
      year_filters: filters.years,
      price_from: filters.priceFrom,
      price_to: filters.priceTo,
      sort_by: filters.sort,
    }),
    (supabase.rpc as unknown as RpcFn)('get_catalog_books', {
      result_limit: CATALOG_FILTER_OPTIONS_LIMIT,
      result_offset: 0,
      sort_by: 'year-desc',
    }),
  ])

  if (rpcResult.error) throw new Error(`Не удалось загрузить каталог книг: ${rpcResult.error.message}`)
  if (filterOptionsResult.error) {
    throw new Error(`Не удалось загрузить фильтры каталога: ${filterOptionsResult.error.message}`)
  }

  const rows = (rpcResult.data ?? []) as CatalogRpcRow[]
  const filterOptionRows = (filterOptionsResult.data ?? []) as BookServerRow[]
  const total = rows[0]?.total_count ?? 0
  const books = rows.map(normalizeBook)
  const authors = Array.from(new Set(filterOptionRows.flatMap((row) => row.author_names ?? []))).sort((a, b) =>
    a.localeCompare(b, 'ru'),
  )
  const categories = Array.from(new Set(filterOptionRows.map((row) => row.product_type))).sort((a, b) =>
    a.localeCompare(b, 'ru'),
  ) as ProductCategory[]
  const years = Array.from(
    new Set(
      filterOptionRows
        .map((row) => row.title_first_release?.slice(0, 4))
        .filter((year): year is string => Boolean(year)),
    ),
  ).sort((a, b) => b.localeCompare(a, 'ru'))

  return {
    books,
    total,
    page: filters.page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    categories,
    authors,
    years,
  }
}
