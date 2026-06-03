import Skeleton from '@/components/common/Skeleton'
import styles from './loading.module.scss'

export default function BookDetailLoading() {
  return (
    <div className={styles.page} aria-label='Загрузка книги'>

      <section className={styles.nav}>
        <Skeleton width={220} height={14} />
      </section>

      <section className={styles.main}>
        <div className={styles.coverInfo}>
          <Skeleton variant='rect' className={styles.cover} />

          <div className={styles.info}>
            <Skeleton className={styles.title} width='70%' />
            <Skeleton className={styles.author} width='40%' />
            <Skeleton className={styles.meta} width='25%' />
            <Skeleton className={styles.thesis} width='80%' />
            <Skeleton className={styles.descLine} width='100%' />
            <Skeleton className={styles.descLine} width='95%' />
            <Skeleton className={styles.descLineLast} width='60%' />
            <div className={styles.awards}>
              <Skeleton variant='rect' className={styles.award} />
              <Skeleton variant='rect' className={styles.award} />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.editionTabs}>
        <div className={styles.tabBar}>
          <Skeleton variant='rect' className={styles.tab} />
          <Skeleton variant='rect' className={styles.tab} />
          <Skeleton variant='rect' className={styles.tab} />
          <Skeleton variant='rect' className={styles.tab} />
        </div>
        <Skeleton variant='rect' className={styles.panel} />
      </section>

      <section className={styles.context}>
        <Skeleton className={styles.sectionTitle} width='40%' />
        <div className={styles.contextList}>
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className={styles.contextItem}>
              <Skeleton width='45%' height={26} />
              <Skeleton width='90%' height={16} />
              <Skeleton width='80%' height={16} />
            </div>
          ))}
        </div>
      </section>

      <section className={styles.boxSets}>
        <Skeleton className={styles.sectionTitle} width='35%' />
        <div className={styles.boxSetsGrid}>
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} variant='rect' className={styles.boxSetCard} />
          ))}
        </div>
      </section>

      <section className={styles.similar}>
        <Skeleton className={styles.similarTitle} width='35%' />
        <div className={styles.similarGrid}>
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} variant='rect' className={styles.similarCard} />
          ))}
        </div>
      </section>

    </div>
  )
}
