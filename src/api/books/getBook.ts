import { createDataClient } from '@/lib/supabase/server'
import type { Book } from '@/entities/book/client'
import { normalizeBook } from '@/entities/book/normalize'
import { bookCatalogSelect, type BookServerRow } from '@/entities/book/server'

export const bookQueryKey = (slug: string) => ['book', slug] as const

export async function getBook(slug: string): Promise<Book | null> {
  const supabase = createDataClient()

  const { data, error } = await supabase
    .from('CardBooks')
    .select(bookCatalogSelect)
    .eq('is_published', true)
    .filter('Titles.slug', 'eq', slug)
    .limit(1)
    .returns<BookServerRow[]>()

  if (error) {
    throw new Error(`Не удалось загрузить книгу: ${error.message}`)
  }

  const row = data?.[0]
  return row ? normalizeBook(row) : null
}

export async function getRelatedBooks(book: Book, limit = 4): Promise<Book[]> {
  const supabase = createDataClient()

  const { data, error } = await supabase
    .from('CardBooks')
    .select(bookCatalogSelect)
    .eq('is_published', true)
    .neq('id', Number(book.id))
    .order('publish_date', { ascending: false, nullsFirst: false })
    .order('release_date', { ascending: false, nullsFirst: false })
    .limit(limit)
    .returns<BookServerRow[]>()

  if (error) {
    throw new Error(`Не удалось загрузить похожие книги: ${error.message}`)
  }

  return (data ?? []).map(normalizeBook)
}
