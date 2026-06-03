import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import styles from './layout.module.scss'

// Storefront chrome. Lives in the (site) route group so it wraps every public
// page but NOT /admin, which has its own header-free chrome. URLs are
// unchanged by the group. Sits inside the root layout's <Providers>, so it
// still has the TanStack Query / cart / toast contexts.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
    </>
  )
}
