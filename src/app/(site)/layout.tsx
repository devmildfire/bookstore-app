import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getServerQueryClient } from '@/lib/query/getServerQueryClient'
import { getLikedIdsServer } from '@/api/likes/getLikesServer'
import { likedIdsQueryKey } from '@/api/likes'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import styles from './layout.module.scss'

// Storefront chrome. Lives in the (site) route group so it wraps every public
// page but NOT /admin, which has its own header-free chrome. URLs are
// unchanged by the group. Sits inside the root layout's <Providers>, so it
// still has the TanStack Query / cart / toast contexts.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Prefetch the user's liked ids (both types) so every card's LikeButton has
  // its filled/outlined state at first paint — no per-page Likes round-trip.
  // The client useLikedIds(type) hydrates from this and stays reactive to
  // optimistic toggles.
  const qc = getServerQueryClient()
  await Promise.all([
    qc.prefetchQuery({ queryKey: likedIdsQueryKey('title'), queryFn: () => getLikedIdsServer('title') }),
    qc.prefetchQuery({ queryKey: likedIdsQueryKey('box_set'), queryFn: () => getLikedIdsServer('box_set') }),
  ])

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
    </HydrationBoundary>
  )
}
