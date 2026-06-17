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
                    // Without `sizes`, next/image uses 1x/2x density descriptors off the 355px
                    // intrinsic width → serves w=750 on mobile for a ~174px display (4× too big,
                    // and this is the LCP). `sizes` switches it to width-descriptors so mobile
                    // gets ~w=384 instead. ~42vw on a 412px PSI viewport ≈ the 174px display.
                    sizes="(max-width: 767px) 45vw, 355px"
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
