import { createDataClient } from '@/lib/supabase/server'
import type { Book } from '@/entities/book/client'
import { normalizeBook } from '@/entities/book/normalize'
import type { BookServerRow } from '@/entities/book/server'

export const featuredBooksQueryKey = ['featuredBooks'] as const

type RpcFn = (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>

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

  const { data, error } = await (supabase.rpc as unknown as RpcFn)('get_catalog_books', {
    title_ids: titleIds,
    result_limit: titleIds.length,
    result_offset: 0,
    sort_by: 'newest',
  })

  if (error) throw new Error(`Не удалось загрузить избранные книги: ${error.message}`)

  const books = ((data ?? []) as BookServerRow[]).map(normalizeBook)

  // Restore the explicit featured sort order
  return featured
    .map((f) => books.find((b) => b.titleId === f.title_id))
    .filter((b): b is Book => b !== undefined)
}
