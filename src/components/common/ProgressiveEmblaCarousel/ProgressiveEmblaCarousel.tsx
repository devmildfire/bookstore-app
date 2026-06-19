'use client'

import { useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'
import cn from 'classnames'

type LightweightEmblaOptions = {
  align?: 'start' | 'center'
  loop?: boolean
}

export type ProgressiveEmblaCarouselProps<T> = {
  items: T[]
  getKey: (item: T, index: number) => string
  renderItem: (item: T, index: number) => ReactNode
  className?: string
  baselineViewportClassName: string
  baselineContainerClassName: string
  emblaViewportClassName: string
  emblaContainerClassName: string
  slideClassName: string
  activeSlideClassName?: string
  options?: LightweightEmblaOptions
  autoplayMs?: number
}

const ENHANCE_AFTER_SCROLL_MS = 180

// Load the Embla layer once, on demand, caching the promise (shared by hover-preload + the actual
// enhancement). `import()` keeps Embla out of the eager bundle; we swap to it only after it resolves
// so the baseline stays visible during the fetch — no null render, no black-background blink.
let enhancedModulePromise: Promise<unknown> | null = null
function loadEnhanced(): Promise<unknown> {
  if (!enhancedModulePromise) {
    enhancedModulePromise = import('./ProgressiveEmblaCarouselEnhanced').then((m) => m.default)
  }
  return enhancedModulePromise
}

export default function ProgressiveEmblaCarousel<T>(props: ProgressiveEmblaCarouselProps<T>) {
  const {
    items,
    getKey,
    renderItem,
    className,
    baselineViewportClassName,
    baselineContainerClassName,
    slideClassName,
    activeSlideClassName,
    autoplayMs,
  } = props

  const outerRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const enhanceTimerRef = useRef<number | null>(null)
  const [active, setActive] = useState(0)
  const [autoplayStopped, setAutoplayStopped] = useState(false)
  const [enhanced, setEnhanced] = useState(false)
  const [enhancedInitialIndex, setEnhancedInitialIndex] = useState(0)
  const [reservedHeight, setReservedHeight] = useState<number>()
  const [EnhancedComp, setEnhancedComp] = useState<
    ComponentType<ProgressiveEmblaCarouselProps<T> & { initialIndex: number }> | null
  >(null)

  const count = items.length

  const preloadEnhanced = useCallback(() => {
    void loadEnhanced()
  }, [])

  const stopAutoplay = useCallback(() => {
    setAutoplayStopped(true)
  }, [])

  const startEnhancement = useCallback((index: number) => {
    if (count <= 1) return
    // Reserve current height so the swap can't change layout (no CLS).
    const h = outerRef.current?.offsetHeight
    if (h) setReservedHeight(h)
    stopAutoplay()
    setEnhancedInitialIndex(Math.max(0, Math.min(index, count - 1)))
    // Load the Embla chunk BEFORE swapping: the baseline stays visible during the fetch, then we
    // flip to an already-loaded component — no empty/null frame (no black-background blink).
    loadEnhanced()
      .then((mod) => {
        setEnhancedComp(() => mod as ComponentType<ProgressiveEmblaCarouselProps<T> & { initialIndex: number }>)
        setEnhanced(true)
      })
      .catch(() => {})
  }, [count, stopAutoplay])

  const scheduleEnhancement = useCallback((index: number) => {
    if (enhanced || count <= 1) return
    if (enhanceTimerRef.current) window.clearTimeout(enhanceTimerRef.current)
    enhanceTimerRef.current = window.setTimeout(() => {
      startEnhancement(index)
    }, ENHANCE_AFTER_SCROLL_MS)
  }, [count, enhanced, startEnhancement])

  const readActiveIndex = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return 0
    const container = viewport.firstElementChild
    const slides = Array.from(container?.children ?? []) as HTMLElement[]
    if (slides.length === 0) return 0

    const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2
    let nearestIndex = 0
    let nearestDistance = Number.POSITIVE_INFINITY

    for (const [index, slide] of slides.entries()) {
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2
      const distance = Math.abs(slideCenter - viewportCenter)
      if (distance < nearestDistance) {
        nearestIndex = index
        nearestDistance = distance
      }
    }

    return nearestIndex
  }, [])

  const scrollToBaselineIndex = useCallback((index: number) => {
    const viewport = viewportRef.current
    const container = viewport?.firstElementChild
    const slide = container?.children[index] as HTMLElement | undefined
    if (!viewport || !slide) return

    viewport.scrollTo({
      left: slide.offsetLeft - (viewport.clientWidth - slide.offsetWidth) / 2,
      behavior: 'smooth',
    })
  }, [])

  const handleScroll = useCallback(() => {
    const next = readActiveIndex()
    setActive(next)
    if (autoplayStopped) scheduleEnhancement(next)
  }, [autoplayStopped, readActiveIndex, scheduleEnhancement])

  const handlePointerDown = useCallback(() => {
    stopAutoplay()
    preloadEnhanced()
  }, [preloadEnhanced, stopAutoplay])

  const handlePointerUp = useCallback(() => {
    if (!autoplayStopped) return
    scheduleEnhancement(readActiveIndex())
  }, [autoplayStopped, readActiveIndex, scheduleEnhancement])

  const handleFocus = useCallback(() => {
    preloadEnhanced()
  }, [preloadEnhanced])

  useEffect(() => {
    if (!autoplayMs || count <= 1 || autoplayStopped) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = window.setInterval(() => {
      const current = readActiveIndex()
      const next = (current + 1) % count
      scrollToBaselineIndex(next)
    }, autoplayMs)

    return () => window.clearInterval(id)
  }, [autoplayMs, autoplayStopped, count, readActiveIndex, scrollToBaselineIndex])

  useEffect(() => {
    return () => {
      if (enhanceTimerRef.current) window.clearTimeout(enhanceTimerRef.current)
    }
  }, [])

  if (count === 0) return null

  // Persistent outer wrapper: stays mounted across the baseline→Embla swap and holds the reserved
  // height (no CLS). EnhancedComp is set together with `enhanced` only once its chunk has loaded, so
  // the swap renders an already-loaded component — no null/empty frame.
  return (
    <div
      ref={outerRef}
      className={className}
      style={reservedHeight ? { minHeight: reservedHeight } : undefined}
    >
      {enhanced && EnhancedComp ? (
        <EnhancedComp {...props} initialIndex={enhancedInitialIndex} />
      ) : (
        <div
          className={baselineViewportClassName}
          ref={viewportRef}
          onScroll={handleScroll}
          onPointerEnter={preloadEnhanced}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onFocusCapture={handleFocus}
        >
          <div className={baselineContainerClassName}>
            {items.map((item, index) => (
              <div
                className={cn(slideClassName, index === active && activeSlideClassName)}
                key={getKey(item, index)}
              >
                {renderItem(item, index)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
