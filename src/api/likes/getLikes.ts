import { createClient } from '@/lib/supabase/client'
import type { LikeItemType } from './types'

// ─── Query keys ─────────────────────────────────────────────────────────────
export const likedIdsQueryKey = (type: LikeItemType) => ['likes', 'ids', type] as const
export const allLikesQueryKey = () => ['likes', 'all'] as const

// ─── getLikedIds ────────────────────────────────────────────────────────────
// Returns the set of item_ids the current user has liked for the given
// type. Used by cards / detail pages (LikeButton) to render filled vs outlined
// hearts without N+1 queries. Empty set when the user isn't authed (RLS).
// This one is legitimately client-side: it's reactive to the user toggling
// likes (optimistic updates in useToggleLike). The favorites *page* lists are
// server-rendered instead — see getLikesServer.ts.
export async function getLikedIds(type: LikeItemType): Promise<Set<number>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('Likes')
    .select('item_id')
    .eq('item_type', type)

  if (error) throw new Error(error.message)
  return new Set((data ?? []).map((row) => row.item_id))
}
