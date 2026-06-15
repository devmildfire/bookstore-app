import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type { Book, BookEdition } from '@/entities/book/client'
import { normalizeEditions } from '@/entities/book/normalize'

// Attaches each book's editions (for the add-to-cart modal) in ONE batched
// query over the page's title_ids, so cards carry their editions at render and
// the modal opens with no client round-trip. Works with either the server data
// client or the browser client (both are SupabaseClient<Database>).
//
// Best-effort: on error it returns the books unchanged (editions stay []), so a
// hiccup here never breaks the catalog render — the modal would just be empty.
export async function attachEditions(
  books: Book[],
  supabase: SupabaseClient<Database>
): Promise<Book[]> {
  if (books.length === 0) return books

  const titleIds = [...new Set(books.map((b) => b.titleId))]
  const { data, error } = await supabase.rpc('get_editions_for_titles', {
    p_title_ids: titleIds,
  })
  if (error || !Array.isArray(data)) return books

  const byTitle = new Map<number, BookEdition[]>()
  for (const row of data) {
    byTitle.set(row.title_id, normalizeEditions(row.editions))
  }
  return books.map((b) => ({ ...b, editions: byTitle.get(b.titleId) ?? [] }))
}
