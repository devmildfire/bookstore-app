import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ScrollToTopOnNavigate from '@/components/layout/ScrollToTopOnNavigate/ScrollToTopOnNavigate'
import styles from './layout.module.scss'

// Storefront chrome. Reads NO cookies/auth in its render path — per-user state
// (cart / likes / promo / gift-cards / quote) is fetched CLIENT-SIDE by CartProvider
// + LikeButton (TanStack useQuery). That's deliberate: server-prefetch-hydrate requires
// reading cookies during render, which forces dynamic rendering — incompatible with the
// static / PPR goal. Keeping the (site) tree cookie-free is what lets catalog/book routes
// be statically prerendered. (Under PPR, a dedicated cart-badge island can server-render
// the count if we want it in the initial HTML.) See
// docs/plans/frontend-architecture-rendering.md Phase 0.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollToTopOnNavigate />
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
    </>
  )
}
