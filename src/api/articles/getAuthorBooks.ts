import { createDataClient } from '@/lib/supabase/server'
import { normalizeBook } from '@/entities/book/normalize'
import type { Book } from '@/entities/book/client'
import type { BookServerRow } from '@/entities/book/server'

type RpcFn = (
  name: string,
  params: Record<string, unknown>,
) => Promise<{ data: unknown; error: { message: string } | null }>

// Books authored by the given Author, sorted newest first. Reuses the
// catalog RPC so prices/discounts behave identically to the storefront.
// The RPC filters by author *name* (not id), so we resolve the name first.
export async function getAuthorBooks(authorId: number, limit = 12): Promise<Book[]> {
  const supabase = createDataClient()

  const { data: authorRow, error: authorError } = await supabase
    .from('Authors')
    .select('name')
    .eq('id', authorId)
    .maybeSingle()

  if (authorError) {
    throw new Error(`Не удалось загрузить автора: ${authorError.message}`)
  }
  if (!authorRow) return []

  type RpcName = Parameters<typeof supabase.rpc>[0]
  const rpc: RpcFn = (name, params) =>
    supabase.rpc(name as RpcName, params as never) as unknown as ReturnType<RpcFn>

  const { data, error } = await rpc('get_catalog_books', {
    result_limit: limit,
    result_offset: 0,
    sort_by: 'year-desc',
    author_names_filter: [authorRow.name],
  })

  if (error) throw new Error(`Не удалось загрузить книги автора: ${error.message}`)

  return ((data ?? []) as BookServerRow[]).map(normalizeBook)
}
