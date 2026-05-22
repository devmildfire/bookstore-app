'use client'

import Image from 'next/image'
import cn from 'classnames'
import { useBoxSetBooks } from '@/hooks/useBoxSetBooks'
import styles from './BoxSetsSection.module.scss'

type Props = {
  boxSetId: number
}

export default function BoxSetPreview({ boxSetId }: Props) {
  const { data: books = [], isLoading } = useBoxSetBooks(boxSetId)

  if (isLoading) {
    return (
      <div className={styles.previewInner}>
        <p className={styles.previewLoading}>Загрузка...</p>
      </div>
    )
  }

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
    <div className={styles.previewInner}>
      <div className={styles.previewGrid}>
        {books.map((book) => (
          <div key={book.titleId} className={styles.previewBook}>
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
          </div>
        ))}
      </div>
    </div>
  )
}
