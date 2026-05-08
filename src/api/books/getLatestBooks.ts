import { createDataClient } from '@/lib/supabase/server'
import { normalizeBook } from '@/entities/book/normalize'
import type { Book } from '@/entities/book/client'
import type { BookServerRow } from '@/entities/book/server'

type RpcFn = (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>

export async function getLatestBooks(limit: number): Promise<Book[]> {
  const supabase = createDataClient()

  const { data, error } = await (supabase.rpc as unknown as RpcFn)('get_catalog_books', {
    result_limit: limit,
    result_offset: 0,
    sort_by: 'year-desc',
  })

  if (error) throw new Error(`Не удалось загрузить книги: ${error.message}`)

  return ((data ?? []) as BookServerRow[]).map(normalizeBook)
}
