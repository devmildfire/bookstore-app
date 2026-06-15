import { createClient } from '@/lib/supabase/server'
import { getBookEditions } from '@/api/books'
import { normalizeBoxSet } from '@/entities/boxSet/normalize'
import type { Book } from '@/entities/book/client'
import type { BoxSet } from '@/entities/boxSet/client'
import type { BoxSetRow } from '@/entities/boxSet/server'
import type { LikeItemType } from './types'

// Server counterpart of getLikedIds, for prefetch + hydrate in the (site)
// layout so every card's LikeButton has its filled/outlined state at first
// paint (no per-page Likes round-trip). Same queryKey as the browser version.
export async function getLikedIdsServer(type: LikeItemType): Promise<Set<number>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('Likes')
    .select('item_id')
    .eq('item_type', type)

  if (error) throw new Error(error.message)
  return new Set((data ?? []).map((row) => row.item_id))
}

// Server-side counterparts of getLikedTitles / getLikedBoxSets (the favorites
// page renders server-side now — no client useQuery on mount). They use the
// cookie-based server client so RLS resolves the current user (anon or real)
// from the session, same as the browser versions.

export async function getLikedTitlesServer(): Promise<Book[]> {
  const supabase = await createClient()

  const { data: likes, error } = await supabase
    .from('Likes')
    .select('item_id, created_at')
    .eq('item_type', 'title')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  if (!likes || likes.length === 0) return []

  const ids = likes.map((l) => l.item_id)
  const { data: titles, error: titlesError } = await supabase
    .from('Titles')
    .select('id, slug')
    .in('id', ids)

  if (titlesError) throw new Error(titlesError.message)

  const slugById = new Map<number, string>()
  for (const t of titles ?? []) {
    if (t.slug) slugById.set(t.id, t.slug)
  }
  const orderedSlugs = ids
    .map((id) => slugById.get(id))
    .filter((s): s is string => !!s)

  const results = await Promise.all(orderedSlugs.map((slug) => getBookEditions(slug)))
  return results.map((books) => books[0]).filter((b): b is Book => Boolean(b))
}

export async function getLikedBoxSetsServer(): Promise<BoxSet[]> {
  const supabase = await createClient()

  const { data: likes, error } = await supabase
    .from('Likes')
    .select('item_id, created_at')
    .eq('item_type', 'box_set')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  if (!likes || likes.length === 0) return []

  const ids = likes.map((l) => l.item_id)
  const { data, error: boxSetsError } = await supabase
    .from('BoxSets')
    .select('*')
    .in('id', ids)

  if (boxSetsError) throw new Error(boxSetsError.message)

  const byId = new Map<number, BoxSetRow>()
  for (const row of (data as unknown as BoxSetRow[]) ?? []) {
    byId.set(row.id, row)
  }
  return ids
    .map((id) => byId.get(id))
    .filter((row): row is BoxSetRow => row !== undefined)
    .map(normalizeBoxSet)
}
