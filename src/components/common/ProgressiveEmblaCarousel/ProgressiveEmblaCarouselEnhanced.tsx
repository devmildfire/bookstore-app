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
  className,
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

  return (
    <div className={className}>
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
    </div>
  )
}
