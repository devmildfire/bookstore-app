'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import cn from '@/utils/cn'

type Props<T> = {
  items: T[]
  getKey: (item: T, index: number) => string
  renderItem: (item: T, index: number) => ReactNode
  viewportClassName: string
  containerClassName: string
  slideClassName: string
  activeSlideClassName?: string
  align?: 'start' | 'center'
  // When set, auto-advances every N ms; stops permanently once the user drags. Respects
  // prefers-reduced-motion.
  autoplayMs?: number
}

// Below this, items are repeated so the loop is always seamless (a centred slider with side-peeks
// needs a few slides). Keeps every carousel looping regardless of item count — the Figma spec.
const MIN_LOOP_SLIDES = 6

// The one shared, eager card carousel for the whole site (subscriptions, articles, author articles,
// gift cards). Always loops, optionally autoplays. Embla initialises on mount — no baseline→Embla
// handoff (only the home hero is allowed any deferral). Slide content + classNames are supplied by
// the caller so each section keeps its own look.
export default function CardCarousel<T>({
  items,
  getKey,
  renderItem,
  viewportClassName,
  containerClassName,
  slideClassName,
  activeSlideClassName,
  align = 'center',
  autoplayMs,
}: Props<T>) {
  // Repeat items up to MIN_LOOP_SLIDES so there are always enough slides to loop smoothly.
  const slides =
    items.length === 0 || items.length >= 3
      ? items
      : Array.from({ length: Math.ceil(MIN_LOOP_SLIDES / items.length) }, () => items).flat()

  const [active, setActive] = useState(0)
  const [autoplayStopped, setAutoplayStopped] = useState(false)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align,
    containScroll: false,
    loop: slides.length > 1,
  })

  const onSelect = useCallback(() => {
    if (emblaApi) setActive(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  useEffect(() => {
    if (!emblaApi || !autoplayMs || autoplayStopped) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const stop = () => setAutoplayStopped(true)
    emblaApi.on('pointerDown', stop)
    const id = window.setInterval(() => emblaApi.scrollNext(), autoplayMs)
    return () => {
      window.clearInterval(id)
      emblaApi.off('pointerDown', stop)
    }
  }, [emblaApi, autoplayMs, autoplayStopped])

  if (items.length === 0) return null

  return (
    <div className={viewportClassName} ref={emblaRef}>
      <div className={containerClassName}>
        {slides.map((item, index) => (
          <div
            className={cn(slideClassName, index === active && activeSlideClassName)}
            key={`${getKey(item, index)}-${index}`}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  )
}
