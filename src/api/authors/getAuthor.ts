import { createDataClient } from '@/lib/supabase/server'
import { normalizeAuthor } from '@/entities/book/normalize'
import type { Author } from '@/entities/book/client'

type ContactRow = { channel: string; url: string; sort_order: number | null }

// Fetch one author (with contacts) for the standalone author page. Public
// data, so it uses the anon data client — no session required.
export async function getAuthor(id: number): Promise<Author | null> {
  const supabase = createDataClient()

  const { data, error } = await supabase
    .from('Authors')
    .select('*, contacts:AuthorContacts(channel, url, sort_order)')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(`Не удалось загрузить автора: ${error.message}`)
  if (!data) return null

  // Order contacts by sort_order before normalizing (normalizeAuthor keeps
  // array order, which drives the icon order on the page).
  const row = data as { contacts?: ContactRow[] }
  if (Array.isArray(row.contacts)) {
    row.contacts = [...row.contacts].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
    )
  }

  return normalizeAuthor(data)
}
