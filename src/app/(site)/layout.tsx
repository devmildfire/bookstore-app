import { Suspense } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ScrollToTopOnNavigate from '@/components/layout/ScrollToTopOnNavigate/ScrollToTopOnNavigate'
import UserStateHydrator from './UserStateHydrator'
import styles from './layout.module.scss'

// Storefront chrome. Lives in the (site) route group so it wraps every public
// page but NOT /admin, which has its own header-free chrome. URLs are unchanged
// by the group. Sits inside the root layout's <Providers>, so it still has the
// TanStack Query / cart / toast contexts.
//
// This layout deliberately does NOT read cookies in its render path. The per-user
// state prefetch (cart / promo / gift-cards / quote / box-set flags / likes) is
// isolated in <UserStateHydrator/> behind <Suspense>, so the shell + page content
// stream immediately instead of waiting on those per-user queries, and the data
// hydrates the client a beat later. This is also the prerequisite for static / PPR
// rendering of storefront routes (Phase 0 of docs/plans/frontend-architecture-rendering.md).
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollToTopOnNavigate />
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
      <Suspense fallback={null}>
        <UserStateHydrator />
      </Suspense>
    </>
  )
}
