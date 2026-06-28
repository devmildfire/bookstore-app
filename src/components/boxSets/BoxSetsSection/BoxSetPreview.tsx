import Image from 'next/image'
import Link from 'next/link'
import cn from 'classnames'
import Scroller from '@/components/common/Scroller'
import type { BoxSetBook } from '@/entities/boxSet/client'
import styles from './BoxSetsSection.module.scss'

type Props = {
  // Books are fetched server-side (BoxSetsSection) and passed down, so the
  // preview renders instantly on expand with no client round-trip.
  books: BoxSetBook[]
}

export default function BoxSetPreview({ books }: Props) {
  // The box set exists but has no BoxSetBooks rows yet (the seed file
  // only fills five named slugs; the rest were left empty). Render a
  // clear empty state so the expand-on-click doesn't look broken.
  if (books.length === 0) {
    return (
      <div className={styles.previewInner}>
        <p className={styles.previewLoading}>Состав появится позже.</p>
      </div>
    )
  }

  return (
    <Scroller className={styles.previewInner} axis='horizontal'>
      <div className={styles.previewGrid}>
        {books.map((book) => (
          <Link key={book.titleId} href={`/books/${book.slug}`} className={styles.previewBook}>
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={book.name}
                width={98}
                height={137}
                className={styles.previewCover}
              />
            ) : (
              <div className={cn(styles.previewCover, styles.previewCoverEmpty)} />
            )}
            <div className={styles.previewBookInfo}>
              <p className={styles.previewBookTitle}>{book.name}</p>
              <p className={styles.previewBookAuthor}>{book.authorName}</p>
            </div>
          </Link>
        ))}
      </div>
    </Scroller>
  )
}
