import Skeleton from '@/components/common/Skeleton'
import RenderLog from '@/components/common/RenderLog'
import styles from './HomeCatalogFallback.module.scss'

// Streaming fallback for <HomeCatalog>. Mirrors the NewProducts heading + BookGrid layout
// so the catalog grid streams in without shifting the surrounding sections.
export default function HomeCatalogFallback() {
  return (
    <section className={styles.wrapper} aria-busy aria-label='Загрузка каталога'>
      <RenderLog tag='suspense-FALLBACK' />
      <h2 className={styles.title}>ИЗДАНИЯ</h2>
      <div className={styles.grid}>
        {Array.from({ length: 8 }).map((_, i) => (
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
