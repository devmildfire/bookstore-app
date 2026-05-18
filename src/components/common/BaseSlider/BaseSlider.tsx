'use client'

import React from 'react'
import cn from 'classnames'
import { Swiper } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import type { SwiperModule } from 'swiper/types'
import 'swiper/css'
import styles from './BaseSlider.module.scss'

type Props = {
  children: React.ReactNode
  slideCount: number
  loop?: boolean
  autoplay?: number | false
  className?: string
}

export default function BaseSlider({ children, slideCount, loop, autoplay = false, className }: Props) {
  const showPagination = slideCount > 1

  const modules: SwiperModule[] = autoplay ? [Pagination, Autoplay] : [Pagination]

  return (
    <div className={cn(styles.wrapper, className)}>
      <Swiper
        style={{ width: '100%' }}
        // `autoHeight` makes Swiper measure the active slide and apply that
        // height to the wrapper. Without it, Swiper's internal
        // `.swiper-wrapper { height: 100% }` collapses to 0 in Firefox
        // because the parent has no defined height (Chrome is more lenient
        // about percentage-of-auto). User interaction was triggering a
        // re-measure and "fixing" the height — autoHeight does that on init.
        autoHeight
        modules={modules}
        pagination={
          showPagination
            ? {
                el: `.${styles.pagination}`,
                clickable: true,
                bulletClass: styles.bullet,
                bulletActiveClass: styles.bulletActive,
              }
            : false
        }
        autoplay={autoplay ? { delay: autoplay, disableOnInteraction: false } : false}
        loop={loop ?? slideCount > 2}
      >
        {children}
      </Swiper>
      {showPagination && <div className={styles.pagination} />}
    </div>
  )
}
