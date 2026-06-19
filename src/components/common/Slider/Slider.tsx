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
  coverBlurDataUrl: string | null
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
        {items.map((item, index) => (
          <SwiperSlide key={item.id}>
            <div className={styles.slide}>
              <div className={styles.coverWrap}>
                {item.coverUrl ? (
                  <Image
                    src={item.coverUrl}
                    alt={`Обложка книги: ${item.title}`}
                    width={355}
                    height={533}
                    // Accurate per-breakpoint widths matching .coverWrap (phone 174 / tablet-small
                    // 180 / tablet 220 / desktop 355). The old `45vw` over-stated the cover width —
                    // especially on tablet, where it claimed 355px for a 220px cover — so next/image
                    // served larger files than displayed. PSI "improve image delivery" flagged it.
                    sizes="(max-width: 532px) 174px, (max-width: 767px) 180px, (max-width: 1200px) 220px, 355px"
                    className={styles.cover}
                    // First slide is the LCP. `priority` emits the preload + eager-loads, but in
                    // this Next version it does NOT set fetchpriority — only the explicit
                    // `fetchPriority` prop does (get-img-props → ImagePreload's getDynamicProps).
                    // Without it the preload ships with no fetchpriority=high → PSI "LCP request
                    // discovery" fails. The rest stay lazy/auto.
                    priority={index === 0}
                    fetchPriority={index === 0 ? 'high' : undefined}
                    placeholder={item.coverBlurDataUrl ? 'blur' : 'empty'}
                    blurDataURL={item.coverBlurDataUrl ?? undefined}
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
