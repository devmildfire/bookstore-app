'use client'

import ProgressiveEmblaCarousel from '@/components/common/ProgressiveEmblaCarousel'
import ArticleCard from '@/components/articles/ArticleCard'
import type { ArticleSummary } from '@/entities/article/client'
import styles from './AuthorArticlesCarousel.module.scss'

type Props = {
  articles: ArticleSummary[]
}

// "Рассказы и статьи" on the author page. Auto-scrolling, full-bleed strip of
// article cards. With fewer than three real articles we repeat the slides so
// the loop still has enough to scroll through smoothly (the Figma slider keeps
// moving regardless of how many the author has).
export default function AuthorArticlesCarousel({ articles }: Props) {
  if (articles.length === 0) return null

  const slides =
    articles.length >= 3
      ? articles
      : Array.from({ length: Math.ceil(6 / articles.length) }, () => articles).flat()

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Рассказы и статьи</h2>

      <div className={styles.fullBleed}>
        <ProgressiveEmblaCarousel
          items={slides}
          getKey={(article, index) => `${article.id}-${index}`}
          renderItem={(article) => <ArticleCard article={article} />}
          baselineViewportClassName={styles.carouselViewport}
          baselineContainerClassName={styles.carouselScrollTrack}
          emblaViewportClassName={styles.carouselEmblaViewport}
          emblaContainerClassName={styles.carouselEmblaTrack}
          slideClassName={styles.slide}
          options={{ align: 'center', loop: slides.length > 1 }}
          autoplayMs={3500}
        />
      </div>
    </section>
  )
}
