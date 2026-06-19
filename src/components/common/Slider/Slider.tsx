'use client'

import { memo, useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import cn from 'classnames'
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

const AUTOPLAY_MS = 4000

// Native CSS scroll-snap carousel — replaces Swiper (~24 KB gz) on the home hero, the only place it
// sat on the critical path. Every slide renders in the SSR HTML, so the LCP cover paints with zero
// JS dependency (Swiper used to gate the hero on hydration); JS only drives autoplay + the dots.
const Slider = memo(function Slider({ items }: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  const count = items?.length ?? 0
  const showPagination = count > 1

  const goTo = useCallback((index: number) => {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' })
  }, [])

  // Keep the active dot in sync with manual swipes/scrolls.
  const handleScroll = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    setActive(Math.round(track.scrollLeft / track.clientWidth))
  }, [])

  useEffect(() => {
    if (count <= 1) return
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = window.setInterval(() => {
      const track = trackRef.current
      if (!track) return
      const current = Math.round(track.scrollLeft / track.clientWidth)
      const next = (current + 1) % count
      track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' })
    }, AUTOPLAY_MS)

    return () => window.clearInterval(id)
  }, [count])

  if (!items || items.length === 0) return null

  return (
    <div className={styles.wrapper}>
      <div className={styles.track} ref={trackRef} onScroll={handleScroll}>
        {items.map((item, index) => (
          <div className={styles.slideOuter} key={item.id}>
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
          </div>
        ))}
      </div>

      {showPagination && (
        <div className={styles.pagination}>
          {items.map((item, index) => (
            <button
              type='button'
              key={item.id}
              className={cn(styles.bullet, index === active && styles.bulletActive)}
              aria-label={`Перейти к слайду ${index + 1}`}
              aria-current={index === active ? 'true' : undefined}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
})

export default Slider
