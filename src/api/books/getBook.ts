import { createDataClient } from '@/lib/supabase/server'
import type { Book } from '@/entities/book/client'
import { normalizeBook } from '@/entities/book/normalize'
import type { BookServerRow } from '@/entities/book/server'

export const bookQueryKey = (slug: string) => ['book', slug] as const

type RpcFn = (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>

export async function getBook(slug: string): Promise<Book | null> {
  const supabase = createDataClient()

  const { data, error } = await (supabase.rpc as unknown as RpcFn)('get_catalog_book_by_slug', {
    title_slug: slug,
  })

  if (error) throw new Error(`Не удалось загрузить книгу: ${error.message}`)

  const rows = (data ?? []) as BookServerRow[]
  return rows.length > 0 ? normalizeBook(rows[0]) : null
}

export async function getBookEditions(slug: string): Promise<Book[]> {
  const supabase = createDataClient()

  const { data, error } = await (supabase.rpc as unknown as RpcFn)('get_catalog_book_by_slug', {
    title_slug: slug,
  })

  if (error) throw new Error(`Не удалось загрузить варианты книги: ${error.message}`)

  return ((data ?? []) as BookServerRow[]).map(normalizeBook)
}

// Editor-curated list from the TitleSimilarTitles join table, ordered by `position`.
// A title cannot include itself (enforced by a CHECK constraint on the table).
export async function getSimilarBooks(titleId: number): Promise<Book[]> {
  const supabase = createDataClient()

  const { data, error } = await (supabase.rpc as unknown as RpcFn)('get_similar_books', {
    p_title_id: titleId,
  })

  if (error) throw new Error(`Не удалось загрузить похожие книги: ${error.message}`)

  return ((data ?? []) as BookServerRow[]).map(normalizeBook)
}
