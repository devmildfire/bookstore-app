import Skeleton from '@/components/common/Skeleton'
import styles from './loading.module.scss'

export default function BookDetailLoading() {
  return (
    <div className={styles.page} aria-label='Загрузка книги'>
      <Skeleton width={200} height={20} />

      <div className={styles.main}>
        <div className={styles.coverSection}>
          <Skeleton className={styles.coverSkeleton} />
        </div>

        <div className={styles.infoSection}>
          <Skeleton width={120} height={24} />
          <Skeleton width='80%' height={36} />
          <Skeleton width='50%' height={24} />
          <Skeleton width='100%' height={80} />
          <Skeleton width='100%' height={100} />
          <Skeleton width={320} height={48} />
        </div>
      </div>

      <div className={styles.related}>
        <Skeleton width={200} height={28} />
        <div className={styles.relatedGrid}>
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} height={360} />
          ))}
        </div>
      </div>
    </div>
  )
}
