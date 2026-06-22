import Image from 'next/image'
import Link from 'next/link'
import type { ArticleSummary } from '@/entities/article/client'
import styles from './ArticleCard.module.scss'

type Props = {
  article: ArticleSummary
}

// Fallback aspect ratio when the cover dimensions are missing (no cover
// uploaded yet, or older row before the cover_width/_height columns).
const FALLBACK_ASPECT_RATIO = 3 / 2

export default function ArticleCard({ article }: Props) {
  const aspectRatio =
    article.coverWidth && article.coverHeight && article.coverHeight > 0
      ? article.coverWidth / article.coverHeight
      : FALLBACK_ASPECT_RATIO

  return (
    <Link href={`/dino-magazine/${article.slug}`} className={styles.card}>
      <div
        className={styles.cover}
        style={{ aspectRatio: aspectRatio.toString() }}
      >
        {article.coverUrl ? (
          <Image
            src={article.coverUrl}
            alt={article.title}
            fill
            className={styles.image}
            sizes='(max-width: 532px) 100vw, (max-width: 1199px) 50vw, 33vw'
            placeholder={article.coverBlurDataUrl ? 'blur' : 'empty'}
            blurDataURL={article.coverBlurDataUrl ?? undefined}
          />
        ) : (
          <div className={styles.coverPlaceholder} aria-hidden />
        )}

        <div className={styles.overlay}>
          <p className={styles.title}>
            {article.title}
            <span className={styles.separator}> | </span>
            <span className={styles.author}>{article.author.name}</span>
          </p>
          {article.excerpt && <p className={styles.excerpt}>{article.excerpt}</p>}
        </div>
      </div>
    </Link>
  )
}
