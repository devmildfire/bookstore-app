import { createClient } from '@/lib/supabase/client'
import { bookCatalogSelect, type BookServerRow } from '@/entities/book/server'
import { normalizeBook } from '@/entities/book/normalize'
import type { Book } from '@/entities/book/client'

export const searchBooksQueryKey = (query: string) => ['search', 'books', query] as const

export async function searchBooks(query: string): Promise<Book[]> {
  if (query.length < 3) return []

  const supabase = createClient()
  const { data, error } = await supabase
    .from('CardBooks')
    .select(bookCatalogSelect)
    .eq('is_published', true)
    .limit(8)
    .returns<BookServerRow[]>()

  if (error) {
    throw new Error(`Не удалось выполнить поиск: ${error.message}`)
  }

  const allBooks = (data ?? []).map(normalizeBook)
  const lower = query.toLocaleLowerCase('ru')

  return allBooks.filter(
    (book) =>
      book.name.toLocaleLowerCase('ru').includes(lower) ||
      book.authorName.toLocaleLowerCase('ru').includes(lower)
  )
}