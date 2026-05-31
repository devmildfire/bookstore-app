import Image from 'next/image'
import Link from 'next/link'
import type { ArticleAuthor } from '@/entities/article/client'
import styles from './ArticleAuthorCard.module.scss'

type Props = {
  author: ArticleAuthor
}

function buildMeta(author: ArticleAuthor): string | null {
  const parts = [author.birthDate, author.city].filter((part): part is string => Boolean(part))
  return parts.length > 0 ? parts.join(' | ') : null
}

export default function ArticleAuthorCard({ author }: Props) {
  const meta = buildMeta(author)
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Об авторе</h2>
      <div className={styles.card}>
        <Link
          href={`/authors/${author.id}`}
          className={styles.photoWrap}
          aria-label={`Страница автора: ${author.name}`}
        >
          {author.photoUrl ? (
            <Image
              src={author.photoUrl}
              alt={author.name}
              fill
              className={styles.photo}
              sizes='(max-width: 532px) 200px, 343px'
              placeholder={author.photoBlurDataUrl ? 'blur' : 'empty'}
              blurDataURL={author.photoBlurDataUrl ?? undefined}
            />
          ) : (
            <div className={styles.photoPlaceholder} aria-hidden />
          )}
        </Link>
        <div className={styles.text}>
          <h3 className={styles.name}>
            <Link href={`/authors/${author.id}`} className={styles.nameLink}>
              {author.name}
            </Link>
          </h3>
          {meta && <p className={styles.meta}>{meta}</p>}
          {author.bio && <p className={styles.bio}>{author.bio}</p>}
        </div>
      </div>
    </section>
  )
}
