'use client'

import Image from 'next/image'
import { SwiperSlide } from 'swiper/react'
import type { BookPhoto } from '@/api/books/getBookPhotos'
import BaseSlider from '@/components/common/BaseSlider'
import styles from './BookCoverSlider.module.scss'

type Props = {
  photos: BookPhoto[]
  coverUrl: string | null
  coverBlurDataUrl: string | null
  bookName: string
}

export default function BookCoverSlider({ photos, coverUrl, coverBlurDataUrl, bookName }: Props) {
  const slides: BookPhoto[] =
    photos.length > 0
      ? photos
      : coverUrl
        ? [{ url: coverUrl, blurDataURL: coverBlurDataUrl }]
        : []

  if (slides.length === 0) {
    return <div className={styles.placeholder} aria-hidden />
  }

  if (slides.length === 1) {
    return (
      <div className={styles.single}>
        <Image
          src={slides[0].url}
          alt={`Обложка книги: ${bookName}`}
          width={500}
          height={750}
          className={styles.image}
          priority
          placeholder={slides[0].blurDataURL ? 'blur' : 'empty'}
          blurDataURL={slides[0].blurDataURL ?? undefined}
        />
      </div>
    )
  }

  return (
    <div className={styles.multi}>
      <BaseSlider slideCount={slides.length} loop={slides.length > 2}>
        {slides.map((slide, i) => (
          <SwiperSlide key={slide.url}>
            <Image
              src={slide.url}
              alt={`${bookName} — фото ${i + 1}`}
              width={500}
              height={750}
              className={styles.image}
              priority={i === 0}
              placeholder={slide.blurDataURL ? 'blur' : 'empty'}
              blurDataURL={slide.blurDataURL ?? undefined}
            />
          </SwiperSlide>
        ))}
      </BaseSlider>
    </div>
  )
}
