'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import cn from 'classnames'
import SliderSlide from './SliderSlide'
import type { SlideItem } from './types'
import styles from './Slider.module.scss'

type Props = {
  items: SlideItem[]
  initialIndex: number
}

export default function SliderEmbla({ items, initialIndex }: Props) {
  const [active, setActive] = useState(initialIndex)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: false,
    loop: items.length > 1,
    startIndex: initialIndex,
  })

  const goTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index)
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    const updateActive = () => {
      setActive(emblaApi.selectedScrollSnap())
    }

    updateActive()
    emblaApi.on('select', updateActive)
    emblaApi.on('reInit', updateActive)

    return () => {
      emblaApi.off('select', updateActive)
      emblaApi.off('reInit', updateActive)
    }
  }, [emblaApi])

  if (items.length === 0) return null

  // No own `.wrapper` — the parent Slider renders the persistent wrapper (it reserves height across
  // the baseline→Embla swap so the dynamic-import null frame can't collapse the hero). This renders
  // only the Embla viewport + dots into it.
  return (
    <>
      <div className={styles.emblaViewport} ref={emblaRef}>
        <div className={styles.emblaContainer}>
          {items.map((item) => (
            <div className={styles.slideOuter} key={item.id}>
              <SliderSlide item={item} />
            </div>
          ))}
        </div>
      </div>

      {items.length > 1 && (
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
  )
}
