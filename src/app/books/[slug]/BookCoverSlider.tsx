'use client'

import Image from 'next/image'
import { SwiperSlide } from 'swiper/react'
import BaseSlider from '@/components/common/BaseSlider'
import styles from './BookCoverSlider.module.scss'

type Props = {
  photos: string[]
  coverUrl: string | null
  bookName: string
}

export default function BookCoverSlider({ photos, coverUrl, bookName }: Props) {
  const slides = photos.length > 0 ? photos : coverUrl ? [coverUrl] : []

  if (slides.length === 0) {
    return <div className={styles.placeholder} aria-hidden />
  }

  if (slides.length === 1) {
    return (
      <div className={styles.single}>
        <Image
          src={slides[0]}
          alt={`Обложка книги: ${bookName}`}
          width={500}
          height={750}
          className={styles.image}
          priority
        />
      </div>
    )
  }

  return (
    <div className={styles.multi}>
      <BaseSlider slideCount={slides.length} loop={slides.length > 2}>
        {slides.map((url, i) => (
          <SwiperSlide key={url}>
            <Image
              src={url}
              alt={`${bookName} — фото ${i + 1}`}
              width={500}
              height={750}
              className={styles.image}
              priority={i === 0}
            />
          </SwiperSlide>
        ))}
      </BaseSlider>
    </div>
  )
}
