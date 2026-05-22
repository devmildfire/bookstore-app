'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  allLikesQueryKey,
  getLikedIds,
  likedIdsQueryKey,
  toggleLike,
  type LikeItemType,
} from '@/api/likes'

// Returns the set of liked item_ids for the current user for one type.
// Cached client-side; cards consume this to decide filled-vs-outlined.
export function useLikedIds(type: LikeItemType) {
  return useQuery({
    queryKey: likedIdsQueryKey(type),
    queryFn: () => getLikedIds(type),
    staleTime: 60 * 1000,
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
