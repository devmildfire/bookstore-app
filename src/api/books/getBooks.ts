import { createDataClient } from '@/lib/supabase/server'
import type { ProductCategory } from '@/types/database'
import type { BookCatalog, BookFilters } from '@/entities/book/client'
import { normalizeBook } from '@/entities/book/normalize'
import type { BookServerRow } from '@/entities/book/server'

export const booksQueryKey = (filters: BookFilters) => ['books', filters] as const

type CatalogRpcRow = BookServerRow & { total_count: number }
type RpcFn = (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>
type RpcResult = Awaited<ReturnType<RpcFn>>
type FilterOptions = {
  categories: ProductCategory[]
  authors: string[]
  years: string[]
}

const CATALOG_FILTER_OPTIONS_LIMIT = 10000

export async function getBooks(filters: BookFilters): Promise<BookCatalog> {
  const supabase = createDataClient()
  const pageSize = filters.limit
  const offset = (filters.page - 1) * pageSize

  // Keep `this` bound to the supabase instance — the SDK's rpc() reaches into
  // `this.rest` internally, so an unbound reference crashes at call time.
  // The generated rpc-name union doesn't admit a plain string; the fallback
  // path calls `get_catalog_books` with both new and legacy params, so we widen.
  type RpcName = Parameters<typeof supabase.rpc>[0]
  const rpc: RpcFn = (name, params) => supabase.rpc(name as RpcName, params) as unknown as ReturnType<RpcFn>
  const [rpcResult, filterOptions] = await Promise.all([
    getCatalogBooksWithFallback(rpc, {
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
    getCatalogFilterOptions(supabase, rpc),
  ])

  if (rpcResult.error) throw new Error(`Не удалось загрузить каталог книг: ${rpcResult.error.message}`)

  const rows = (rpcResult.data ?? []) as CatalogRpcRow[]
  const total = rows[0]?.total_count ?? 0
  const books = rows.map(normalizeBook)

  // Periodical issues link to the shared periodical page + anchor, not /books/<slug>.
  const periodicalHrefs = await getPeriodicalHrefs(supabase, books.map((b) => b.titleId))
  for (const book of books) {
    book.periodicalHref = periodicalHrefs.get(book.titleId) ?? null
  }

  return {
    books,
    total,
    page: filters.page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    categories: filterOptions.categories,
    authors: filterOptions.authors,
    years: filterOptions.years,
  }
}

async function getCatalogFilterOptions(
  supabase: ReturnType<typeof createDataClient>,
  rpc: RpcFn,
): Promise<FilterOptions> {
  const [result, categoryResults] = await Promise.all([
    rpc('get_catalog_books', {
      result_limit: CATALOG_FILTER_OPTIONS_LIMIT,
      result_offset: 0,
      sort_by: 'newest',
    }),
    getPublishedProductCategories(supabase),
  ])

  if (result.error) {
    throw new Error(`Не удалось загрузить фильтры каталога: ${result.error.message}`)
  }

  const rows = (result.data ?? []) as BookServerRow[]

  return {
    categories: categoryResults,
    authors: Array.from(new Set(rows.flatMap((row) => row.author_names ?? []))).sort((a, b) =>
      a.localeCompare(b, 'ru'),
    ),
    years: Array.from(
      new Set(
        rows
          .map((row) => row.title_first_release?.slice(0, 4))
          .filter((year): year is string => Boolean(year)),
      ),
    ).sort((a, b) => b.localeCompare(a, 'ru')),
  }
}

async function getPublishedProductCategories(supabase: ReturnType<typeof createDataClient>): Promise<ProductCategory[]> {
  const categoryQueries = [
    { category: 'PrintBook' as const, query: supabase.from('PrintedBooks').select('id').eq('is_published', true).limit(1) },
    { category: 'EBook' as const, query: supabase.from('Ebooks').select('id').eq('is_published', true).limit(1) },
    { category: 'AudioBook' as const, query: supabase.from('Audiobooks').select('id').eq('is_published', true).limit(1) },
    { category: 'Book2.0' as const, query: supabase.from('CardBooks').select('id').eq('is_published', true).limit(1) },
  ]
  const results = await Promise.all(categoryQueries.map(({ query }) => query))

  results.forEach((result) => {
    if (result.error) throw new Error(`Не удалось загрузить типы изданий: ${result.error.message}`)
  })

  return categoryQueries
    .filter((_, index) => (results[index].data ?? []).length > 0)
    .map(({ category }) => category)
}

async function getCatalogBooksWithFallback(rpc: RpcFn, params: Record<string, unknown>): Promise<RpcResult> {
  const result = await rpc('get_catalog_books', params)

  if (!isMissingCatalogFunctionError(result.error?.message)) return result

  return rpc('get_catalog_books', {
    result_limit: params.result_limit,
    result_offset: params.result_offset,
    search_term: params.search_term,
    product_type_filter: getFirstParamValue(params.product_type_filters),
    author_name: getFirstParamValue(params.author_names_filter),
    price_from: params.price_from,
    price_to: params.price_to,
    sort_by: normalizeLegacySort(params.sort_by),
  })
}

function isMissingCatalogFunctionError(message: string | undefined): boolean {
  return Boolean(message?.includes('Could not find the function public.get_catalog_books'))
}

function getFirstParamValue(value: unknown): string | null {
  return Array.isArray(value) && typeof value[0] === 'string' ? value[0] : null
}

function normalizeLegacySort(value: unknown): string {
  if (value === 'price-asc' || value === 'price-desc') return value
  if (value === 'author-asc' || value === 'author-desc') return 'title'
  return 'newest'
}

// Map of titleId → "/books/<periodical-slug>#vol-<n>" for any catalog titles that
// are periodical issues, so their cards link to the shared periodical page.
async function getPeriodicalHrefs(
  supabase: ReturnType<typeof createDataClient>,
  titleIds: number[],
): Promise<Map<number, string>> {
  const map = new Map<number, string>()
  if (titleIds.length === 0) return map

  const { data: titles } = await supabase
    .from('Titles')
    .select('id, periodical_id, volume_number')
    .in('id', titleIds)
    .not('periodical_id', 'is', null)
  if (!titles?.length) return map

  const periodicalIds = Array.from(new Set(titles.map((t) => t.periodical_id).filter((v): v is number => v != null)))
  const { data: periodicals } = await supabase.from('Periodicals').select('id, slug').in('id', periodicalIds)
  const slugById = new Map((periodicals ?? []).map((p) => [p.id, p.slug]))

  for (const t of titles) {
    const slug = t.periodical_id != null ? slugById.get(t.periodical_id) : null
    if (slug) map.set(t.id, `/books/${slug}#vol-${t.volume_number}`)
  }
  return map
}
