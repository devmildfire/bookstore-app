'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'
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
        <Swiper
          className={styles.swiper}
          modules={[Autoplay]}
          loop
          spaceBetween={0}
          centeredSlides
          slidesPerView={1.4}
          breakpoints={{
            768: { slidesPerView: 2.2 },
            1200: { slidesPerView: 3 },
          }}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
        >
          {slides.map((article, index) => (
            <SwiperSlide key={`${article.id}-${index}`} className={styles.slide}>
              <ArticleCard article={article} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}
