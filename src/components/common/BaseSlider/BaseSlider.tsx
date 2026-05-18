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
