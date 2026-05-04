import { createDataClient } from '@/lib/supabase/server'
import type { Book } from '@/entities/book/client'
import { normalizeBook } from '@/entities/book/normalize'
import { bookCatalogSelect, type BookServerRow } from '@/entities/book/server'

export const featuredBooksQueryKey = ['featuredBooks'] as const

export async function getFeaturedBooks(): Promise<Book[]> {
  const supabase = createDataClient()

  const { data: featured, error: featuredError } = await supabase
    .from('featured_books')
    .select('title_id')
    .order('sort_order', { ascending: true })

  if (featuredError) {
    throw new Error(`Не удалось загрузить избранные книги: ${featuredError.message}`)
  }

  if (!featured || featured.length === 0) return []

  const titleIds = featured.map((f) => f.title_id)

  const { data, error } = await supabase
    .from('CardBooks')
    .select(bookCatalogSelect)
    .in('title_id', titleIds)
    .returns<BookServerRow[]>()

  if (error) {
    throw new Error(`Не удалось загрузить избранные книги: ${error.message}`)
  }

  const books = (data ?? []).map(normalizeBook)

  const sorted = featured
    .map((f) => books.find((b) => b.titleId === f.title_id))
    .filter((b): b is Book => b !== undefined)

  return sorted
}