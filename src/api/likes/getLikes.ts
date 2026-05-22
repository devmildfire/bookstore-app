import { createClient } from '@/lib/supabase/client'
import { getBookProducts } from '@/api/books/getBookProducts'
import { normalizeBoxSet } from '@/entities/boxSet/normalize'
import type { Book } from '@/entities/book/client'
import type { BoxSet } from '@/entities/boxSet/client'
import type { BoxSetRow } from '@/entities/boxSet/server'
import type { LikeItemType } from './types'

// ─── Query keys ─────────────────────────────────────────────────────────────
export const likedIdsQueryKey = (type: LikeItemType) => ['likes', 'ids', type] as const
export const allLikesQueryKey = () => ['likes', 'all'] as const

// ─── getLikedIds ────────────────────────────────────────────────────────────
// Returns the set of item_ids the current user has liked for the given
// type. Used by cards / detail pages to render filled vs outlined hearts
// without N+1 queries. Empty set when the user isn't authed (RLS).
export async function getLikedIds(type: LikeItemType): Promise<Set<number>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('Likes')
    .select('item_id')
    .eq('item_type', type)

  if (error) throw new Error(error.message)
  return new Set((data ?? []).map((row) => row.item_id))
}

// ─── getLikedTitles ─────────────────────────────────────────────────────────
// For the /profile/favorites page. The catalog RPCs are filter/paginate
// shaped, not id-shaped, so we resolve ids → slugs and fan out to the
// existing get_catalog_book_by_slug RPC. N+1 in absolute terms but N is
// small (a user's favorites set), and reusing the existing RPC avoids
// cloning ~150 lines of SQL. Pick the first Book per title as the card.
export async function getLikedTitles(): Promise<Book[]> {
  const supabase = createClient()

  const { data: likes, error: likesError } = await supabase
    .from('Likes')
    .select('item_id, created_at')
    .eq('item_type', 'title')
    .order('created_at', { ascending: false })

  if (likesError) throw new Error(likesError.message)
  if (!likes || likes.length === 0) return []

  const ids = likes.map((l) => l.item_id)
  const { data: titles, error: titlesError } = await supabase
    .from('Titles')
    .select('id, slug')
    .in('id', ids)

  if (titlesError) throw new Error(titlesError.message)
  if (!titles || titles.length === 0) return []

  const slugById = new Map<number, string>()
  for (const t of titles) {
    if (t.slug) slugById.set(t.id, t.slug)
  }
  const orderedSlugs = ids
    .map((id) => slugById.get(id))
    .filter((s): s is string => !!s)

  const results = await Promise.all(orderedSlugs.map((slug) => getBookProducts(slug)))
  return results.map((books) => books[0]).filter((b): b is Book => Boolean(b))
}

// ─── getLikedBoxSets ────────────────────────────────────────────────────────
// Box-sets have a much simpler shape — direct table select is fine.
export async function getLikedBoxSets(): Promise<BoxSet[]> {
  const supabase = createClient()

  const { data: likes, error: likesError } = await supabase
    .from('Likes')
    .select('item_id, created_at')
    .eq('item_type', 'box_set')
    .order('created_at', { ascending: false })

  if (likesError) throw new Error(likesError.message)
  if (!likes || likes.length === 0) return []

  const ids = likes.map((l) => l.item_id)
  const { data, error } = await supabase
    .from('BoxSets')
    .select('*')
    .in('id', ids)

  if (error) throw new Error(error.message)

  const byId = new Map<number, BoxSetRow>()
  for (const row of (data as unknown as BoxSetRow[]) ?? []) {
    byId.set(row.id, row)
  }
  return ids
    .map((id) => byId.get(id))
    .filter((row): row is BoxSetRow => row !== undefined)
    .map(normalizeBoxSet)
}
