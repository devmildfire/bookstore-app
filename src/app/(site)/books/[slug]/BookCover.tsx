import Image from 'next/image'
import LikeButton from '@/components/common/LikeButton'
import styles from './BookCover.module.scss'

type Props = {
  coverUrl: string | null
  coverBlurDataUrl: string | null
  bookName: string
  titleId: number
}

/**
 * Hero cover for the book detail page — the book cover only. Printed-book
 * photos live in the PrintBook tab carousel (see `BookEditionTabs`), not here.
 */
export default function BookCover({ coverUrl, coverBlurDataUrl, bookName, titleId }: Props) {
  if (!coverUrl) {
    return <div className={styles.placeholder} aria-hidden />
  }

  return (
    <div className={styles.single}>
      <Image
        src={coverUrl}
        alt={`Обложка книги: ${bookName}`}
        width={500}
        height={750}
        className={styles.image}
        priority
        placeholder={coverBlurDataUrl ? 'blur' : 'empty'}
        blurDataURL={coverBlurDataUrl ?? undefined}
      />
      <LikeButton type='title' itemId={titleId} className={styles.likeBtn} />
    </div>
  )
}
