'use client'

import { memo, useRef, useState, useEffect, useCallback, type ComponentType } from 'react'
import cn from 'classnames'
import SliderSlide from './SliderSlide'
import type { SlideItem } from './types'
import styles from './Slider.module.scss'

export type SliderProps = {
  items: SlideItem[]
}

const ENHANCE_AFTER_SCROLL_MS = 180

type EmblaComponent = ComponentType<{ items: SlideItem[]; initialIndex: number }>

// Load the Embla layer once, on demand, caching the promise so hover-preload and the actual
// enhancement share a single chunk fetch. `import()` keeps Embla out of the eager bundle (its own
// chunk, fetched only on carousel intent) — same guarantee next/dynamic gave. The difference: we
// swap to it only AFTER it resolves (see startEnhancement), so the baseline stays visible the whole
// time and there's no null render — no black-background blink.
let emblaModulePromise: Promise<EmblaComponent> | null = null
function loadEmbla(): Promise<EmblaComponent> {
  if (!emblaModulePromise) emblaModulePromise = import('./SliderEmbla').then((m) => m.default)
  return emblaModulePromise
}

// Native CSS scroll-snap carousel — replaces Swiper (~24 KB gz) on the home hero, the only place it
// sat on the critical path. Every slide renders in the SSR HTML, so the LCP cover paints with zero
// carousel-library dependency. The baseline does NOT auto-advance — it stays on the first slide
// until the user interacts (swipe / dot), at which point Embla is dynamically loaded for looping +
// controlled drag. JS only tracks the active dot until then.
const Slider = memo(function Slider({ items }: SliderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const enhanceTimerRef = useRef<number | null>(null)
  const [active, setActive] = useState(0)
  const [enhanced, setEnhanced] = useState(false)
  const [enhancedInitialIndex, setEnhancedInitialIndex] = useState(0)
  const [reservedHeight, setReservedHeight] = useState<number>()
  const [EmblaComp, setEmblaComp] = useState<EmblaComponent | null>(null)

  const count = items?.length ?? 0
  const showPagination = count > 1

  const preloadEnhanced = useCallback(() => {
    void loadEmbla()
  }, [])

  const startEnhancement = useCallback((index: number) => {
    // Reserve the current rendered height so the swap can't change layout (no CLS).
    const h = wrapperRef.current?.offsetHeight
    if (h) setReservedHeight(h)
    setEnhancedInitialIndex(Math.max(0, Math.min(index, count - 1)))
    // Load the Embla chunk BEFORE flipping to it. The baseline (showing the target slide) stays on
    // screen during the fetch, then we swap atomically to an already-loaded component — so there's
    // never an empty/null frame (the black-background blink the user saw).
    loadEmbla()
      .then((Comp) => {
        setEmblaComp(() => Comp)
        setEnhanced(true)
      })
      .catch(() => {})
  }, [count])

  const scheduleEnhancement = useCallback((index: number) => {
    if (enhanced || count <= 1) return
    if (enhanceTimerRef.current) window.clearTimeout(enhanceTimerRef.current)
    enhanceTimerRef.current = window.setTimeout(() => {
      startEnhancement(index)
    }, ENHANCE_AFTER_SCROLL_MS)
  }, [count, enhanced, startEnhancement])

  const goTo = useCallback((index: number) => {
    startEnhancement(index)
    setActive(index)
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' })
  }, [startEnhancement])

  // Keep the active dot in sync with manual swipes/scrolls.
  const handleScroll = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const next = Math.max(0, Math.min(Math.round(track.scrollLeft / track.clientWidth), count - 1))
    setActive(next)
    // A scroll means a user swipe (the baseline doesn't auto-advance) → enhance once it settles.
    scheduleEnhancement(next)
  }, [count, scheduleEnhancement])

  const handlePointerEnter = useCallback(() => {
    preloadEnhanced()
  }, [preloadEnhanced])

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (isInteractiveTarget(event.target)) return
    preloadEnhanced()
  }, [preloadEnhanced])

  const handlePointerUp = useCallback(() => {
    scheduleEnhancement(active)
  }, [active, scheduleEnhancement])

  const handleFocus = useCallback(() => {
    preloadEnhanced()
  }, [preloadEnhanced])

  useEffect(() => {
    return () => {
      if (enhanceTimerRef.current) window.clearTimeout(enhanceTimerRef.current)
    }
  }, [])

  if (!items || items.length === 0) return null

  // Persistent wrapper: it stays mounted across the baseline→Embla swap and holds the reserved
  // height, so the dynamic import's null frame can't collapse the hero (no layout jump / CLS).
  return (
    <div
      ref={wrapperRef}
      className={styles.wrapper}
      style={reservedHeight ? { minHeight: reservedHeight } : undefined}
    >
      {enhanced && EmblaComp ? (
        <EmblaComp items={items} initialIndex={enhancedInitialIndex} />
      ) : (
        <>
          <div
            className={styles.track}
            ref={trackRef}
            onScroll={handleScroll}
            onPointerEnter={handlePointerEnter}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onFocusCapture={handleFocus}
          >
            {items.map((item, index) => (
              <div className={styles.slideOuter} key={item.id}>
                <SliderSlide item={item} priority={index === 0} />
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
        </>
      )}
    </div>
  )
})

function isInteractiveTarget(target: EventTarget): boolean {
  return target instanceof Element && Boolean(target.closest('a, button'))
}

export default Slider
