'use client'

import { useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
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

const ProgressiveEmblaCarouselEnhanced = dynamic(() => import('./ProgressiveEmblaCarouselEnhanced'), { ssr: false })

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

  const viewportRef = useRef<HTMLDivElement>(null)
  const enhanceTimerRef = useRef<number | null>(null)
  const [active, setActive] = useState(0)
  const [autoplayStopped, setAutoplayStopped] = useState(false)
  const [enhanced, setEnhanced] = useState(false)
  const [enhancedInitialIndex, setEnhancedInitialIndex] = useState(0)

  const count = items.length

  const preloadEnhanced = useCallback(() => {
    void import('./ProgressiveEmblaCarouselEnhanced')
  }, [])

  const stopAutoplay = useCallback(() => {
    setAutoplayStopped(true)
  }, [])

  const startEnhancement = useCallback((index: number) => {
    if (count <= 1) return
    stopAutoplay()
    preloadEnhanced()
    setEnhancedInitialIndex(Math.max(0, Math.min(index, count - 1)))
    setEnhanced(true)
  }, [count, preloadEnhanced, stopAutoplay])

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

  if (enhanced) {
    const Enhanced = ProgressiveEmblaCarouselEnhanced as ComponentType<
      ProgressiveEmblaCarouselProps<T> & { initialIndex: number }
    >
    return <Enhanced {...props} initialIndex={enhancedInitialIndex} />
  }

  return (
    <div className={className}>
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
    </div>
  )
}
