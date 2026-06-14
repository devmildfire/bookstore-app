import { createDataClient } from '@/lib/supabase/server'
import type { ProductCategory } from '@/types/database'
import type { BookCatalog, BookFilters } from '@/entities/book/client'
import { normalizeBook } from '@/entities/book/normalize'
import type { BookServerRow } from '@/entities/book/server'

export const booksQueryKey = (filters: BookFilters) => ['books', filters] as const

type CatalogRpcRow = BookServerRow & { total_count: number }
type FilterOptions = {
  categories: ProductCategory[]
  authors: string[]
  years: string[]
}

// Filter types in the order the storefront expects them.
const CANONICAL_TYPE_ORDER: ProductCategory[] = ['PrintBook', 'EBook', 'AudioBook', 'Book2.0']

export async function getBooks(filters: BookFilters): Promise<BookCatalog> {
  const supabase = createDataClient()
  const pageSize = filters.limit
  const offset = (filters.page - 1) * pageSize

  const [rpcResult, filterOptions] = await Promise.all([
    supabase.rpc('get_catalog_books', {
      result_limit: pageSize,
      result_offset: offset,
      search_term: filters.search || undefined,
      product_type_filters: filters.categories,
      author_names_filter: filters.authors,
      year_filters: filters.years,
      price_from: filters.priceFrom ?? undefined,
      price_to: filters.priceTo ?? undefined,
      sort_by: filters.sort,
    }),
    getCatalogFilterOptions(supabase),
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

// Distinct authors / years / published product types for the filter dropdowns, in one
// RPC (get_catalog_facets) instead of re-fetching the whole catalog. Sorting stays here
// to preserve the exact Russian-locale order and the canonical type order.
async function getCatalogFilterOptions(
  supabase: ReturnType<typeof createDataClient>,
): Promise<FilterOptions> {
  const { data, error } = await supabase.rpc('get_catalog_facets')
  if (error) throw new Error(`Не удалось загрузить фильтры каталога: ${error.message}`)

  const facets = parseFacets(data)
  const presentTypes = new Set(facets.productTypes)

  return {
    categories: CANONICAL_TYPE_ORDER.filter((type) => presentTypes.has(type)),
    authors: [...facets.authors].sort((a, b) => a.localeCompare(b, 'ru')),
    years: [...facets.years].sort((a, b) => b.localeCompare(a, 'ru')),
  }
}

function parseFacets(data: unknown): { authors: string[]; years: string[]; productTypes: string[] } {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { authors: [], years: [], productTypes: [] }
  }
  const record = data as Record<string, unknown>
  return {
    authors: toStringArray(record.authors),
    years: toStringArray(record.years),
    productTypes: toStringArray(record.productTypes),
  }
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []
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
