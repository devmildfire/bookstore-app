'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import cn from 'classnames'
import type { SliderProps } from '../Slider/Slider'
// Reuse the exact hero-slide layout so this is 1:1 with the Swiper version (no drift).
import slideStyles from '../Slider/Slider.module.scss'
import styles from './HeroScrollSlider.module.scss'

const AUTOPLAY_MS = 4000

/**
 * EXPERIMENTAL SSR-friendly hero carousel — native CSS scroll-snap, no Swiper.
 *
 * The slides (and the LCP cover) lay out and paint straight from the server-rendered HTML/CSS with
 * ZERO JavaScript, so LCP ≈ FCP (the Swiper version render-blocked the cover behind hydration).
 * Horizontal swipe is native scroll. The active dot, dot-clicks, and autoplay are progressive
 * enhancements that run only after hydration and never gate the paint.
 *
 * No seamless loop yet: autoplay rewinds to the first slide at the end.
 */
export default function HeroScrollSlider({ items }: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const showDots = items.length > 1

  const scrollToIndex = (i: number) => {
    const track = trackRef.current
    if (track) track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' })
  }

  // Active dot follows scroll position (post-hydration; SSR renders the first dot active).
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setActive(Math.round(track.scrollLeft / track.clientWidth)))
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      track.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Autoplay: advance every 4s, rewind to first at the end (no seamless loop). Pauses on hover and
  // is disabled for users who prefer reduced motion.
  useEffect(() => {
    const track = trackRef.current
    if (!track || items.length <= 1) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let paused = false
    const enter = () => { paused = true }
    const leave = () => { paused = false }
    track.addEventListener('pointerenter', enter)
    track.addEventListener('pointerleave', leave)
    const id = setInterval(() => {
      if (paused) return
      const cur = Math.round(track.scrollLeft / track.clientWidth)
      const next = (cur + 1) % items.length
      track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' })
    }, AUTOPLAY_MS)
    return () => {
      clearInterval(id)
      track.removeEventListener('pointerenter', enter)
      track.removeEventListener('pointerleave', leave)
    }
  }, [items.length])

  if (!items || items.length === 0) return null

  return (
    <div className={styles.wrapper}>
      <div className={styles.track} ref={trackRef}>
        {items.map((item, index) => (
          <div key={item.id} className={styles.slideOuter}>
            <div className={slideStyles.slide}>
              <div className={slideStyles.coverWrap}>
                {item.coverUrl ? (
                  <Image
                    src={item.coverUrl}
                    alt={`Обложка книги: ${item.title}`}
                    width={355}
                    height={533}
                    sizes="(max-width: 767px) 45vw, 355px"
                    className={slideStyles.cover}
                    priority={index === 0}
                    fetchPriority={index === 0 ? 'high' : undefined}
                    placeholder={item.coverBlurDataUrl ? 'blur' : 'empty'}
                    blurDataURL={item.coverBlurDataUrl ?? undefined}
                  />
                ) : (
                  <div className={slideStyles.coverPlaceholder} />
                )}
              </div>
              <div className={slideStyles.info}>
                <h2 className={slideStyles.title}>{item.title}</h2>
                <p className={slideStyles.author}>{item.author}</p>
                {item.thesis && <p className={slideStyles.thesis}>{item.thesis}</p>}
                <Link href={`/books/${item.slug}`} className={slideStyles.button}>
                  Познать
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showDots && (
        <div className={styles.pagination} role="tablist" aria-label="Слайды">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={cn(styles.bullet, index === active && styles.bulletActive)}
              aria-label={`Перейти к слайду ${index + 1}`}
              aria-current={index === active}
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
