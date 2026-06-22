'use client'

import { useRef, useState } from 'react'
import cn from '@/utils/cn'
import styles from './HeroVideo.module.scss'

type Props = {
  videoUrl: string
  posterUrl: string
}

export default function HeroVideo({ videoUrl, posterUrl }: Props) {
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
        { }
        <video
          ref={videoRef}
          className={styles.video}
          poster={posterUrl}
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
