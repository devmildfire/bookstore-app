import type { BookTrailer as BookTrailerData } from '@/entities/book/client'
import styles from './BookTrailer.module.scss'

type Props = {
  trailer: BookTrailerData
  bookName: string
}

/**
 * Promotional video section for a book detail page. Renders a native
 * HTML5 `<video>` element with two sources (WebM preferred, MP4 fallback)
 * and the supplied poster image as the splash frame. The browser supplies
 * its own play/pause/seek controls.
 */
export default function BookTrailer({ trailer, bookName }: Props) {
  return (
    <section className={styles.section} aria-labelledby="booktrailer-title">
      <h2 id="booktrailer-title" className={styles.title}>
        Буктрейлер
      </h2>
      <div className={styles.videoWrap}>
        <video
          className={styles.video}
          controls
          preload="metadata"
          playsInline
          poster={trailer.posterUrl ?? undefined}
          aria-label={`Буктрейлер: ${bookName}`}
        >
          <source src={trailer.webmUrl} type="video/webm" />
          <source src={trailer.mp4Url} type="video/mp4" />
          Ваш браузер не поддерживает воспроизведение видео.
        </video>
      </div>
    </section>
  )
}
