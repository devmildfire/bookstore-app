'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import cn from 'classnames'
import styles from './HeroVideo.module.scss'

type Props = {
  videoUrl: string
  posterUrl: string
  posterWidth: number
  posterHeight: number
}

export default function HeroVideo({ videoUrl, posterUrl, posterWidth, posterHeight }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlay = () => {
    const node = videoRef.current
    if (!node) return
    void node.play()
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.frame}>
        {!isPlaying && (
          <Image
            src={posterUrl}
            alt=""
            width={posterWidth}
            height={posterHeight}
            className={styles.poster}
            priority
            sizes="(max-width: 320px) 320px, (max-width: 744px) 648px, (max-width: 1024px) 823px, 1553px"
          />
        )}
        <video
          ref={videoRef}
          className={styles.video}
          preload='none'
          controls={isPlaying}
          playsInline
          onPlay={() => setIsPlaying(true)}
          onEnded={() => setIsPlaying(false)}
        >
          <source src={videoUrl} type='video/mp4' />
        </video>
        {!isPlaying && (
          <button
            type='button'
            className={cn(styles.playOverlay)}
            onClick={handlePlay}
            aria-label='Воспроизвести видео о Чтиве'
          >
            <svg viewBox='0 0 169 169' width='169' height='169' aria-hidden='true'>
              <polygon points='55,32 55,137 142,84' fill='rgba(255,255,255,0.92)' />
            </svg>
          </button>
        )}
      </div>
    </section>
  )
}
