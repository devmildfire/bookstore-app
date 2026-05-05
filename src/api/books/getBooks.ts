import { createDataClient } from '@/lib/supabase/server'
import type { ProductCategory } from '@/types/database'
import type { BookCatalog, BookFilters } from '@/entities/book/client'
import { normalizeBook } from '@/entities/book/normalize'
import { BOOK_CATALOG_PAGE_SIZE, type BookServerRow } from '@/entities/book/server'

export const booksQueryKey = (filters: BookFilters) => ['books', filters] as const

type CatalogRpcRow = BookServerRow & { total_count: number }

export async function getBooks(filters: BookFilters): Promise<BookCatalog> {
  const supabase = createDataClient()
  const pageSize = BOOK_CATALOG_PAGE_SIZE
  const offset = (filters.page - 1) * pageSize

  const [rpcResult, authorsResult] = await Promise.all([
    (supabase.rpc as unknown as (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>)(
      'get_catalog_books',
      {
        result_limit: pageSize,
        result_offset: offset,
        search_term: filters.search || null,
        product_type_filter: filters.category !== 'all' ? filters.category : null,
        author_name: filters.author || null,
        price_from: filters.priceFrom,
        price_to: filters.priceTo,
        sort_by: filters.sort,
      },
    ),
    supabase.from('Authors').select('name').order('name'),
  ])

  if (rpcResult.error) throw new Error(`Не удалось загрузить каталог книг: ${rpcResult.error.message}`)

  const rows = (rpcResult.data ?? []) as CatalogRpcRow[]
  const total = rows[0]?.total_count ?? 0
  const books = rows.map(normalizeBook)
  const authors = (authorsResult.data ?? []).map((r) => r.name)
  const categories = Array.from(new Set(rows.map((r) => r.product_type))).sort((a, b) =>
    a.localeCompare(b, 'ru'),
  ) as ProductCategory[]

  return {
    books,
    total,
    page: filters.page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    categories,
    authors,
  }
}
