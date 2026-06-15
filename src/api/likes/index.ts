// NOTE: only browser-safe fetchers belong in this barrel — it's imported by
// client hooks (useLikes/useToggleLike). The server fetchers (getLikesServer)
// pull next/headers, so import them via their direct path in Server Components.
export { getLikedIds, likedIdsQueryKey, allLikesQueryKey } from './getLikes'
export { toggleLike } from './toggleLike'
export type { LikeItemType } from './types'
