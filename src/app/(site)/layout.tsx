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
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import styles from './layout.module.scss'

// Storefront chrome. Lives in the (site) route group so it wraps every public
// page but NOT /admin, which has its own header-free chrome. URLs are
// unchanged by the group. Sits inside the root layout's <Providers>, so it
// still has the TanStack Query / cart / toast contexts.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Server-prefetch every user-scoped query the storefront reads on first paint
  // (likes for cards, and the whole cart context: items, promo, gift-card
  // wallet, server price quote, box-set physicality) into a HydrationBoundary.
  // The client useQuery hooks (LikeButton, CartProvider) hydrate from this — no
  // first-load round-trips, no spinners — and stay reactive to mutations /
  // optimistic updates afterwards (queryKeys match the browser fetchers).
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

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
    </HydrationBoundary>
  )
}
