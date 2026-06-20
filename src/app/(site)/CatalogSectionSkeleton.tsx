import CatalogFilterBarSkeleton from '@/components/book/CatalogControls/CatalogFilterBarSkeleton'
import styles from './CatalogSection.module.scss'

// Suspense fallback for <HomeCatalog> while it awaits getBooks. Identical to DeferredCatalog's
// pre-mount state (heading + filter-bar replica + reserved height), so the fallback → resolved
// transition is invisible.
export default function CatalogSectionSkeleton() {
  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>ИЗДАНИЯ</h2>
      <CatalogFilterBarSkeleton />
      <div className={styles.reserve} aria-hidden />
    </section>
  )
}
