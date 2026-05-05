import { createDataClient } from '@/lib/supabase/server'
import type { ProductCategory } from '@/types/database'
import type { BookCatalog, BookFilters } from '@/entities/book/client'
import { normalizeBook } from '@/entities/book/normalize'
import { BOOK_CATALOG_PAGE_SIZE, bookCatalogSelect, type BookServerRow } from '@/entities/book/server'

export const booksQueryKey = (filters: BookFilters) => ['books', filters] as const

export async function getBooks(filters: BookFilters): Promise<BookCatalog> {
  const supabase = createDataClient()
  const pageSize = BOOK_CATALOG_PAGE_SIZE
  const offset = (filters.page - 1) * pageSize

  // Resolve author filter to title_ids before the main query (no cross-join in PostgREST)
  let authorTitleIds: number[] | null = null
  if (filters.author) {
    const { data: authorRows } = await supabase
      .from('Authors')
      .select('Titles_Authors(title_id)')
      .eq('name', filters.author)

    authorTitleIds = (authorRows ?? []).flatMap((r) =>
      (r.Titles_Authors ?? []).map((ta) => ta.title_id),
    )
    if (authorTitleIds.length === 0) {
      return { books: [], total: 0, page: filters.page, pageSize, totalPages: 1, categories: [], authors: [] }
    }
  }

  let query = supabase
    .from('CardBooks')
    .select(bookCatalogSelect, { count: 'exact' })
    .eq('is_published', true)

  if (filters.search) {
    // Searches by title; header search bar covers title+author via search_books RPC
    query = query.filter('Titles.name', 'ilike', `%${filters.search}%`)
  }

  if (authorTitleIds !== null) query = query.in('title_id', authorTitleIds)
  if (filters.priceFrom !== null) query = query.gte('price', filters.priceFrom)
  if (filters.priceTo !== null) query = query.lte('price', filters.priceTo)

  switch (filters.sort) {
    case 'price-asc':
      query = query.order('price', { ascending: true })
      break
    case 'price-desc':
      query = query.order('price', { ascending: false })
      break
    case 'title':
      query = query.order('name', { referencedTable: 'Titles', ascending: true })
      break
    case 'newest':
    default:
      query = query
        .order('publish_date', { ascending: false, nullsFirst: false })
        .order('release_date', { ascending: false, nullsFirst: false })
  }

  query = query.range(offset, offset + pageSize - 1)

  const [{ data, count, error }, { data: allAuthorRows }] = await Promise.all([
    query.returns<BookServerRow[]>(),
    supabase.from('Authors').select('name').order('name'),
  ])

  if (error) throw new Error(`Не удалось загрузить каталог книг: ${error.message}`)

  const books = (data ?? []).map(normalizeBook)
  const total = count ?? 0
  const authors = (allAuthorRows ?? []).map((r) => r.name)
  const categories = Array.from(new Set(books.map((b) => b.category))).sort((a, b) =>
    a.localeCompare(b, 'ru'),
  )

  return {
    books,
    total,
    page: filters.page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    categories: categories as ProductCategory[],
    authors,
  }
}
