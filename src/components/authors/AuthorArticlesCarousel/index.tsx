'use client'

import CardCarousel from '@/components/common/CardCarousel'
import ArticleCard from '@/components/articles/ArticleCard'
import type { ArticleSummary } from '@/entities/article/client'
import styles from './AuthorArticlesCarousel.module.scss'

type Props = {
  articles: ArticleSummary[]
}

// "Рассказы и статьи" on the author page. Auto-scrolling, full-bleed strip of article cards. Always
// loops — CardCarousel repeats the items when there are too few, so the slider keeps moving
// regardless of how many the author has (the Figma spec).
export default function AuthorArticlesCarousel({ articles }: Props) {
  if (articles.length === 0) return null

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Рассказы и статьи</h2>

      <div className={styles.fullBleed}>
        <CardCarousel
          items={articles}
          getKey={(article) => String(article.id)}
          renderItem={(article) => <ArticleCard article={article} />}
          viewportClassName={styles.carouselEmblaViewport}
          containerClassName={styles.carouselEmblaTrack}
          slideClassName={styles.slide}
          autoplayMs={3500}
        />
      </div>
    </section>
  )
}
