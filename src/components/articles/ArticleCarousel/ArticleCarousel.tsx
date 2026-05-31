'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'
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
        <Swiper
          className={styles.swiper}
          modules={[Autoplay]}
          loop={canLoop}
          spaceBetween={0}
          centeredSlides
          slidesPerView={1.4}
          breakpoints={{
            768: { slidesPerView: 2.2 },
            1200: { slidesPerView: 3 },
          }}
          autoplay={
            canLoop
              ? {
                  delay: 3000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              : false
          }
        >
          {items.map((article) => (
            <SwiperSlide key={article.id} className={styles.slide}>
              <ArticleCard article={article} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}
