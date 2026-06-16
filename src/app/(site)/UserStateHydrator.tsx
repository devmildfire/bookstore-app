import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getServerQueryClient } from '@/lib/query/getServerQueryClient'
import { getLikedIdsServer } from '@/api/likes/getLikesServer'
import { likedIdsQueryKey } from '@/api/likes'
import { getCartServer, getCartQuoteServer } from '@/api/cart/cartServer'
import { cartQueryKey, cartQuoteQueryKey } from '@/api/cart'
import { getActivePromoServer } from '@/api/promo/getActivePromoServer'
import { activePromoQueryKey } from '@/api/promo'
import { getUserGiftCardsServer } from '@/api/giftCards/getUserGiftCardsServer'
import { userGiftCardsQueryKey } from '@/api/giftCards/getUserGiftCards'
import { getBoxSetPhysicalFlagsServer } from '@/api/orders/getBoxSetPhysicalFlagsServer'
import { boxSetPhysicalFlagsQueryKey } from '@/api/orders'
import type { CartItem } from '@/entities/cart/client'

// Server-prefetches every user-scoped query the storefront reads on first paint
// (the whole cart context: items, promo, gift-card wallet, server price quote,
// box-set physicality — plus likes for cards) and dehydrates them into the shared
// client QueryClient.
//
// This is rendered inside a <Suspense> in the (site) layout, on purpose. The
// prefetch fns call createClient() -> cookies(), a per-request read. Keeping it in
// a Suspense island means that cookie read does NOT block the static shell: the
// catalog/book HTML streams first, and this per-user state streams in right after
// and hydrates CartProvider / LikeButton via the global QueryClient — no first-load
// client round-trip, no spinner, still reactive to mutations afterwards (queryKeys
// match the browser fetchers). It is also the prerequisite for static/PPR rendering
// of storefront routes (the layout itself no longer reads cookies in its render path).
//
// HydrationBoundary hydrates the shared client regardless of tree position, so this
// component renders no visible children.
export default async function UserStateHydrator() {
  const qc = getServerQueryClient()

  // Cart drives boxSetIds (only fetched when the cart has BoxSet items), so seed
  // the cart first, then prefetch everything else in parallel.
  await qc.prefetchQuery({ queryKey: cartQueryKey, queryFn: getCartServer })
  const cart = qc.getQueryData<CartItem[]>(cartQueryKey) ?? []
  const boxSetIds = cart
    .filter((i) => i.category === 'BoxSet')
    .map((i) => Number(i.id.split('-').slice(1).join('-')))
    .filter((n) => Number.isFinite(n))

  await Promise.all([
    qc.prefetchQuery({ queryKey: likedIdsQueryKey('title'), queryFn: () => getLikedIdsServer('title') }),
    qc.prefetchQuery({ queryKey: likedIdsQueryKey('box_set'), queryFn: () => getLikedIdsServer('box_set') }),
    qc.prefetchQuery({ queryKey: activePromoQueryKey, queryFn: getActivePromoServer }),
    qc.prefetchQuery({ queryKey: userGiftCardsQueryKey, queryFn: getUserGiftCardsServer }),
    qc.prefetchQuery({ queryKey: cartQuoteQueryKey, queryFn: getCartQuoteServer }),
    ...(boxSetIds.length > 0
      ? [
          qc.prefetchQuery({
            queryKey: boxSetPhysicalFlagsQueryKey(boxSetIds),
            queryFn: () => getBoxSetPhysicalFlagsServer(boxSetIds),
          }),
        ]
      : []),
  ])

  return <HydrationBoundary state={dehydrate(qc)} />
}
