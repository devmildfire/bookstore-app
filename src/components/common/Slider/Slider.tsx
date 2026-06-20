'use client'

import { memo, useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import cn from 'classnames'
import SliderSlide from './SliderSlide'
import type { SlideItem } from './types'
import styles from './Slider.module.scss'

export type SliderProps = {
  items: SlideItem[]
}

// memo comparator — bail on a new `items` array with identical content. The hero's slides are static
// for the session, but a Next App Router route re-render (fired when the deferred catalog mounts on
// the first interaction — see docs/perf/hero-carousel-remount.md) hands us a fresh array. Bailing on
// equal-by-id content keeps that route re-render from re-rendering the carousel needlessly. A genuine
// content change still flows through (ids differ).
function slidesEqual(prev: SliderProps, next: SliderProps): boolean {
  const a = prev.items, b = next.items
  if (a === b) return true
  if ((a?.length ?? 0) !== (b?.length ?? 0)) return false
  return a.every((it, i) => it.id === b[i].id)
}

// Home hero carousel. The slides render in the SSR HTML, so the LCP cover (first slide) paints with
// no carousel JS in the way; `embla-carousel-react` then hydrates the SAME nodes to add infinite
// loop + drag + snap. Embla core is ~5 KB gz and the React binding owns the viewport via a ref, so a
// route re-render reconciles cleanly (no orphaned instance, no remount). It does NOT auto-advance.
function Slider({ items }: SliderProps) {
  const count = items?.length ?? 0
  const showPagination = count > 1
  const [active, setActive] = useState(0)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: count > 1,
    align: 'start',
    containScroll: false,
  })

  const onSelect = useCallback(() => {
    if (emblaApi) setActive(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    // `active` starts at 0, matching Embla's initial slide; 'select'/'reInit' keep it in sync after.
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  const goTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi])

  if (!items || items.length === 0) return null

  return (
    <div className={styles.wrapper}>
      <div className={styles.viewport} ref={emblaRef}>
        <div className={styles.container}>
          {items.map((item, index) => (
            <div className={styles.slideOuter} key={item.id}>
              <SliderSlide item={item} priority={index === 0} />
            </div>
          ))}
        </div>
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
}

// memo with a content-aware comparator so a route re-render (new array, same slides) doesn't churn
// the carousel. See slidesEqual.
export default memo(Slider, slidesEqual)
