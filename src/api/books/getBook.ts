import { createClient } from '@/lib/supabase/server'
import type { Book } from '@/entities/book/client'
import { normalizeBook } from '@/entities/book/normalize'
import { bookCatalogSelect, type BookServerRow } from '@/entities/book/server'

export const bookQueryKey = (slug: string) => ['book', slug] as const

export async function getBook(slug: string): Promise<Book | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('CardBooks')
    .select(bookCatalogSelect)
    .eq('is_published', true)
    .returns<BookServerRow[]>()

  if (error) {
    throw new Error(`Не удалось загрузить книгу: ${error.message}`)
  }

  const allBooks = (data ?? []).map(normalizeBook)
  const book = allBooks.find((b) => b.slug === slug)

  return book ?? null
}

export async function getRelatedBooks(book: Book, limit = 4): Promise<Book[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('CardBooks')
    .select(bookCatalogSelect)
    .eq('is_published', true)
    .neq('id', Number(book.id))
    .limit(1000)
    .returns<BookServerRow[]>()

  if (error) {
    throw new Error(`Не удалось загрузить похожие книги: ${error.message}`)
  }

  const allBooks = (data ?? []).map(normalizeBook)

  // Prefer books from the same category
  const sameCategory = allBooks.filter((b) => b.category === book.category && b.id !== book.id)
  const others = allBooks.filter((b) => b.category !== book.category && b.id !== book.id)

  const related = [...sameCategory, ...others].slice(0, limit)

  return related
}
