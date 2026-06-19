'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import cn from 'classnames'
import type { ProgressiveEmblaCarouselProps } from './ProgressiveEmblaCarousel'

type Props<T> = ProgressiveEmblaCarouselProps<T> & {
  initialIndex: number
}

export default function ProgressiveEmblaCarouselEnhanced<T>({
  items,
  getKey,
  renderItem,
  emblaViewportClassName,
  emblaContainerClassName,
  slideClassName,
  activeSlideClassName,
  options,
  initialIndex,
}: Props<T>) {
  const [active, setActive] = useState(initialIndex)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: options?.align ?? 'center',
    containScroll: false,
    loop: options?.loop ?? items.length > 1,
    startIndex: initialIndex,
  })

  const updateActive = useCallback(() => {
    if (!emblaApi) return
    setActive(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', updateActive)
    emblaApi.on('reInit', updateActive)

    return () => {
      emblaApi.off('select', updateActive)
      emblaApi.off('reInit', updateActive)
    }
  }, [emblaApi, updateActive])

  // No own outer wrapper — the parent ProgressiveEmblaCarousel renders the persistent `className`
  // container (it reserves height across the baseline→Embla swap). This renders only the viewport.
  return (
    <div className={emblaViewportClassName} ref={emblaRef}>
      <div className={emblaContainerClassName}>
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
  )
}
