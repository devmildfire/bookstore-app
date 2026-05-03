'use client'

import { memo } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import styles from './Slider.module.scss'

type BannerItem = {
  id: string
  banner: string
  title: string
}

export type SliderProps = {
  items: BannerItem[]
}

const Slider = memo(function Slider({ items }: SliderProps) {
  if (!items || items.length === 0) return null

  return (
    <div className={styles.wrapper}>
      <Swiper
        modules={[Autoplay, Pagination]}
        pagination={{
          el: `.${styles.pagination}`,
          clickable: true,
        }}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        loop={items.length > 2}
      >
        {items.map((item) => (
          <SwiperSlide key={item.id} className={styles.slide}>
            <img
              className={styles.image}
              src={item.banner}
              alt={item.title}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className={styles.buttonBlock}>
        <button type="button" className={styles.button}>
          Познать
        </button>
        <button type="button" className={styles.button}>
          Купить
        </button>
      </div>
      <div className={styles.pagination} />
    </div>
  )
})

export default Slider
