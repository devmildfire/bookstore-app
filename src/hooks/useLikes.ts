'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  allLikesQueryKey,
  getLikedIds,
  likedIdsQueryKey,
  toggleLike,
  type LikeItemType,
} from '@/api/likes'
import useSessionActive from '@/hooks/useSessionActive'

// Returns the set of liked item_ids for the current user for one type.
// Cached client-side; cards consume this to decide filled-vs-outlined.
// Gated like the cart: a cookieless, no-interaction visitor has no likes to show, so we don't run
// it (and thus don't load Supabase) until a session exists or the user interacts. Card hearts
// render outlined until then — correct for a visitor who has liked nothing.
export function useLikedIds(type: LikeItemType) {
  const enabled = useSessionActive()
  return useQuery({
    queryKey: likedIdsQueryKey(type),
    queryFn: () => getLikedIds(type),
    staleTime: 60 * 1000,
    enabled,
  })
}

// Mutation hook for toggling. Performs an optimistic update on the cached
// liked-ids set so the heart flips immediately; rolls back if the RPC
// fails. Also invalidates the favorites-page caches.
export function useToggleLike(type: LikeItemType) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (itemId: number) => toggleLike(type, itemId),
    onMutate: async (itemId) => {
      await qc.cancelQueries({ queryKey: likedIdsQueryKey(type) })
      const previous = qc.getQueryData<Set<number>>(likedIdsQueryKey(type))
      qc.setQueryData<Set<number>>(likedIdsQueryKey(type), (old) => {
        const next = new Set(old ?? [])
        if (next.has(itemId)) next.delete(itemId)
        else next.add(itemId)
        return next
      })
      return { previous }
    },
    onError: (_err, _itemId, ctx) => {
      if (ctx?.previous !== undefined) {
        qc.setQueryData(likedIdsQueryKey(type), ctx.previous)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: likedIdsQueryKey(type) })
      qc.invalidateQueries({ queryKey: allLikesQueryKey() })
    },
  })
}
