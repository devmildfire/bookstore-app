'use client'

import ProgressiveEmblaCarousel from '@/components/common/ProgressiveEmblaCarousel'
import ArticleCard from '@/components/articles/ArticleCard'
import type { ArticleSummary } from '@/entities/article/client'
import styles from './ArticleCarousel.module.scss'

type Props = {
  items: ArticleSummary[]
}

// Full-bleed strip mirroring the subscriptions section's mobile carousel:
// 3 slides visible on desktop, partial slides on the sides, loops if we
// have enough slides to make looping meaningful. Auto-advances every 3s
// and pauses while the user is interacting / hovering.
export default function ArticleCarousel({ items }: Props) {
  if (items.length === 0) return null

  const canLoop = items.length >= 3

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Другите Рассказы</h2>

      <div className={styles.fullBleed}>
        <ProgressiveEmblaCarousel
          items={items}
          getKey={(article) => String(article.id)}
          renderItem={(article) => <ArticleCard article={article} />}
          baselineViewportClassName={styles.carouselViewport}
          baselineContainerClassName={styles.carouselScrollTrack}
          emblaViewportClassName={styles.carouselEmblaViewport}
          emblaContainerClassName={styles.carouselEmblaTrack}
          slideClassName={styles.slide}
          options={{ align: 'center', loop: canLoop }}
          autoplayMs={canLoop ? 3000 : undefined}
        />
      </div>
    </section>
  )
}
