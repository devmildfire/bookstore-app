import Skeleton from '@/components/common/Skeleton'
import styles from './CatalogSkeleton.module.scss'

type Props = {
  // How many ghost cards to render. Match page-1 so the skeleton reserves the real grid's height
  // and the swap to <NewProducts> is shift-free.
  cards?: number
}

// Eager, lightweight stand-in for the deferred catalog (<NewProducts>): the ИЗДАНИЯ heading, a ghost
// filter bar, and N ghost cards. Used BOTH as the Suspense fallback (page.tsx) and as the
// DeferredCatalog placeholder, so the catalog is visibly present right under the hero (affordance:
// "there's more below") AND it reserves the real grid's height. Reserving the height keeps the
// sections below it (subscriptions / box-sets) anchored far down, so they never render before the
// catalog ("next section before previous" flash) and the swap to the real grid doesn't jump. Plain
// divs only — no Radix, no images — so it stays off the heavy critical path.
export default function CatalogSkeleton({ cards = 12 }: Props) {
  return (
    <section className={styles.wrapper} aria-busy aria-label='Загрузка каталога'>
      <h2 className={styles.title}>ИЗДАНИЯ</h2>
      <div className={styles.filterBar} aria-hidden>
        <Skeleton variant='rect' className={styles.filterPill} />
        <Skeleton variant='rect' className={styles.sortPill} />
      </div>
      <div className={styles.grid}>
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className={styles.card}>
            <Skeleton variant='rect' className={styles.cover} />
            <Skeleton variant='text' width='80%' height={18} />
            <Skeleton variant='text' width='50%' height={14} />
            <Skeleton variant='text' width='35%' height={20} />
          </div>
        ))}
      </div>
    </section>
  )
}
