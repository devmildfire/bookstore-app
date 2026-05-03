'use client'

import { memo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import styles from './Slider.module.scss'

type SlideItem = {
  id: string
  coverUrl: string | null
  title: string
  author: string
  subtitle?: string
  slug: string
}

export type SliderProps = {
  items: SlideItem[]
}

const Slider = memo(function Slider({ items }: SliderProps) {
  if (!items || items.length === 0) return null

  return (
    <div className={styles.wrapper}>
      <Swiper
        modules={[Autoplay, Pagination]}
        pagination={{
          el: `.${styles.pagination}`,
          clickable: true,
        }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        loop={items.length > 2}
      >
        {items.map((item) => (
          <SwiperSlide key={item.id}>
            <div className={styles.slide}>
              <div className={styles.coverWrap}>
                {item.coverUrl ? (
                  <Image
                    src={item.coverUrl}
                    alt={item.title}
                    width={280}
                    height={400}
                    className={styles.cover}
                  />
                ) : (
                  <div className={styles.coverPlaceholder} />
                )}
              </div>
              <div className={styles.info}>
                <h2 className={styles.title}>{item.title}</h2>
                <p className={styles.author}>{item.author}</p>
                {item.subtitle && (
                  <p className={styles.subtitle}>{item.subtitle}</p>
                )}
                <Link href={`/books/${item.slug}`} className={styles.button}>
                  Подробнее
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className={styles.pagination} />
    </div>
  )
})

export default Slider
