import { getBrowserClient } from '@/lib/supabase/lazyClient'
import { attachEditions } from './attachEditions'
import { normalizeBook } from '@/entities/book/normalize'
import type { Book } from '@/entities/book/client'
import type { BookServerRow } from '@/entities/book/server'

export const searchBooksQueryKey = (query: string) => ['search', 'books', query] as const

type SearchBooksResult = {
  books: Book[]
  total: number
}

type SearchRpcRow = BookServerRow & { total_count: number }

export async function searchBooks(
  query: string,
  offset: number = 0,
  limit: number = 12,
): Promise<SearchBooksResult> {
  if (query.length < 3) return { books: [], total: 0 }

  const supabase = await getBrowserClient()
  const { data, error } = await supabase.rpc('search_books', {
    search_term: query,
    result_limit: limit,
    result_offset: offset,
  })

  if (error) throw new Error(`Не удалось выполнить поиск: ${error.message}`)

  const rows = (data ?? []) as SearchRpcRow[]
  if (rows.length === 0) return { books: [], total: 0 }

  return {
    books: await attachEditions(rows.map(normalizeBook), supabase),
    total: rows[0].total_count,
  }
}
