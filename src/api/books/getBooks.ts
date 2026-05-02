import { createDataClient } from '@/lib/supabase/server'
import type { ProductCategory } from '@/types/database'
import type { Book, BookCatalog, BookFilters } from '@/entities/book/client'
import { normalizeBook } from '@/entities/book/normalize'
import { BOOK_CATALOG_PAGE_SIZE, bookCatalogSelect, type BookServerRow } from '@/entities/book/server'

export const booksQueryKey = (filters: BookFilters) => ['books', filters] as const

export async function getBooks(filters: BookFilters): Promise<BookCatalog> {
  const supabase = createDataClient()
  const pageSize = BOOK_CATALOG_PAGE_SIZE
  const from = (filters.page - 1) * pageSize

  const { data, error } = await supabase
    .from('CardBooks')
    .select(bookCatalogSelect)
    .eq('is_published', true)
    .limit(1000)
    .returns<BookServerRow[]>()

  if (error) {
    throw new Error(`Не удалось загрузить каталог книг: ${error.message}`)
  }

  const allBooks = (data ?? []).map(normalizeBook)
  const categories = Array.from(new Set(allBooks.map((book) => book.category))).sort((a, b) => a.localeCompare(b, 'ru'))
  const authors = Array.from(new Set(allBooks.flatMap((book) => book.authorNames))).sort((a, b) => a.localeCompare(b, 'ru'))
  const filteredBooks = sortBooks(filterBooks(allBooks, filters), filters)
  const total = filteredBooks.length
  const books = filteredBooks.slice(from, from + pageSize)

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

function filterBooks(books: Book[], filters: BookFilters): Book[] {
  const search = filters.search.toLocaleLowerCase('ru')

  return books.filter((book) => {
    const matchesSearch =
      !search ||
      book.name.toLocaleLowerCase('ru').includes(search) ||
      book.authorName.toLocaleLowerCase('ru').includes(search)
    const matchesCategory = filters.category === 'all' || book.category === filters.category
    const matchesAuthor = !filters.author || book.authorNames.includes(filters.author)
    const matchesPriceFrom = filters.priceFrom === null || book.price >= filters.priceFrom
    const matchesPriceTo = filters.priceTo === null || book.price <= filters.priceTo

    return matchesSearch && matchesCategory && matchesAuthor && matchesPriceFrom && matchesPriceTo
  })
}

function sortBooks(books: Book[], filters: BookFilters): Book[] {
  return [...books].sort((a, b) => {
    switch (filters.sort) {
      case 'price-asc':
        return a.price - b.price
      case 'price-desc':
        return b.price - a.price
      case 'title':
        return a.name.localeCompare(b.name, 'ru')
      case 'newest':
      default:
        return (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')
    }
  })
}
