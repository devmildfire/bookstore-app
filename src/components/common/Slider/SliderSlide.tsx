import Image from 'next/image'
import Link from 'next/link'
import type { SlideItem } from './types'
import styles from './Slider.module.scss'

type Props = {
  item: SlideItem
  priority?: boolean
}

export default function SliderSlide({ item, priority = false }: Props) {
  return (
    <div className={styles.slide}>
      <div className={styles.coverWrap}>
        {item.coverUrl ? (
          <Image
            src={item.coverUrl}
            alt={`Обложка книги: ${item.title}`}
            width={355}
            height={533}
            // Accurate per-breakpoint widths matching .coverWrap (phone 230 / tablet-small
            // 240 / tablet 260 / desktop 355). The old `45vw` over-stated the cover width —
            // especially on tablet, where it claimed 355px for a 260px cover — so next/image
            // served larger files than displayed. PSI "improve image delivery" flagged it.
            sizes="(max-width: 532px) 230px, (max-width: 767px) 240px, (max-width: 1200px) 260px, 355px"
            className={styles.cover}
            // First baseline slide is the LCP. `priority` emits the preload + eager-loads, but in
            // this Next version it does NOT set fetchpriority — only the explicit
            // `fetchPriority` prop does (get-img-props → ImagePreload's getDynamicProps).
            // The slide renders in SSR HTML, so the cover paints before Embla hydrates.
            priority={priority}
            fetchPriority={priority ? 'high' : undefined}
            placeholder={item.coverBlurDataUrl ? 'blur' : 'empty'}
            blurDataURL={item.coverBlurDataUrl ?? undefined}
          />
        ) : (
          <div className={styles.coverPlaceholder} />
        )}
      </div>
      <div className={styles.info}>
        <h2 className={styles.title}>{item.title}</h2>
        <p className={styles.author}>{item.author}</p>
        {item.thesis && (
          <p className={styles.thesis}>{item.thesis}</p>
        )}
        <Link href={`/books/${item.slug}`} className={styles.button}>
          Познать
        </Link>
      </div>
    </div>
  )
}
