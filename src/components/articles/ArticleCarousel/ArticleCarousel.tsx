'use client'

import CardCarousel from '@/components/common/CardCarousel'
import ArticleCard from '@/components/articles/ArticleCard'
import type { ArticleSummary } from '@/entities/article/client'
import styles from './ArticleCarousel.module.scss'

type Props = {
  items: ArticleSummary[]
}

// Full-bleed strip: 3 slides visible, partial slides on the sides. Always loops (CardCarousel repeats
// items when there are too few) and auto-advances every 3s, pausing once the user drags.
export default function ArticleCarousel({ items }: Props) {
  if (items.length === 0) return null

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Другите Рассказы</h2>

      <div className={styles.fullBleed}>
        <CardCarousel
          items={items}
          getKey={(article) => String(article.id)}
          renderItem={(article) => <ArticleCard article={article} />}
          viewportClassName={styles.carouselEmblaViewport}
          containerClassName={styles.carouselEmblaTrack}
          slideClassName={styles.slide}
          autoplayMs={3000}
        />
      </div>
    </section>
  )
}
