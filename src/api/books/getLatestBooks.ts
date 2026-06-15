import { createDataClient } from '@/lib/supabase/server'
import { attachEditions } from './attachEditions'
import { normalizeBook } from '@/entities/book/normalize'
import type { Book } from '@/entities/book/client'
import type { BookServerRow } from '@/entities/book/server'

export async function getLatestBooks(limit: number): Promise<Book[]> {
  const supabase = createDataClient()

  const { data, error } = await supabase.rpc('get_catalog_books', {
    result_limit: limit,
    result_offset: 0,
    sort_by: 'year-desc',
  })

  if (error) throw new Error(`Не удалось загрузить книги: ${error.message}`)

  return attachEditions(((data ?? []) as BookServerRow[]).map(normalizeBook), supabase)
}
