import Skeleton from '@/components/common/Skeleton'
import styles from './loading.module.scss'

export default function BooksLoading() {
  return (
    <div className={styles.page} aria-label='Загрузка каталога'>
      <div className={styles.header}>
        <Skeleton width={260} height={44} />
        <Skeleton width={220} height={44} />
      </div>
      <div className={styles.content}>
        <Skeleton height={360} className={styles.filters} />
        <div className={styles.grid}>
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} height={360} />
          ))}
        </div>
      </div>
    </div>
  )
}
