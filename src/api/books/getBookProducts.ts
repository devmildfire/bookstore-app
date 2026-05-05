import { createClient } from '@/lib/supabase/client'
import { normalizeBook } from '@/entities/book/normalize'
import type { Book } from '@/entities/book/client'
import type { BookServerRow } from '@/entities/book/server'

type RpcFn = (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>

export const bookProductsQueryKey = (slug: string) => ['book-products', slug] as const

export async function getBookProducts(slug: string): Promise<Book[]> {
  const supabase = createClient()

  const { data, error } = await (supabase.rpc as unknown as RpcFn)('get_catalog_book_by_slug', {
    title_slug: slug,
  })

  if (error) throw new Error(`Не удалось загрузить варианты книги: ${error.message}`)

  return ((data ?? []) as BookServerRow[]).map(normalizeBook)
}
