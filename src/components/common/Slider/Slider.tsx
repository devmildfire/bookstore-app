'use client'

import { memo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { SwiperSlide } from 'swiper/react'
import BaseSlider from '@/components/common/BaseSlider'
import styles from './Slider.module.scss'

type SlideItem = {
  id: string
  coverUrl: string | null
  title: string
  author: string
  thesis: string | null
  slug: string
}

export type SliderProps = {
  items: SlideItem[]
}

const Slider = memo(function Slider({ items }: SliderProps) {
  if (!items || items.length === 0) return null

  return (
    <div className={styles.wrapper}>
      <BaseSlider slideCount={items.length} loop={items.length > 2} autoplay={4000}>
        {items.map((item) => (
          <SwiperSlide key={item.id}>
            <div className={styles.slide}>
              <div className={styles.coverWrap}>
                {item.coverUrl ? (
                  <Image
                    src={item.coverUrl}
                    alt={`Обложка книги: ${item.title}`}
                    width={355}
                    height={533}
                    className={styles.cover}
                    priority
                  />
                ) : (
                  <div className={styles.coverPlaceholder} />
                )}
              </div>
              <div className={styles.info}>
                <h2 className={styles.title}>{item.title}</h2>
                <p className={styles.author}>{item.author}</p>
                {item.thesis && (
                  <p className={styles.thesis}>{item.thesis}</p>
                )}
                <Link href={`/books/${item.slug}`} className={styles.button}>
                  Познать
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </BaseSlider>
    </div>
  )
})

export default Slider
