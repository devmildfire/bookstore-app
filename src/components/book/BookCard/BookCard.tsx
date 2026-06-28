import Image from 'next/image'
import Link from 'next/link'
import cn from 'classnames'
import LikeButton from '@/components/common/LikeButton'
import AddToCartTrigger from './AddToCartTrigger'
import { formatPrice, formatProductPrice } from '@/lib/formatPrice'
import type { Book } from '@/entities/book/client'
import styles from './BookCard.module.scss'

type Props = {
  book: Book
  className?: string
  // Load the cover eagerly instead of lazily. Used for the render-ahead batches that sit
  // hidden (display:none) in the catalog feed: a lazy image never loads while hidden, so the
  // prefetched batch must load eagerly to preload its covers before it's revealed.
  eager?: boolean
}

// Server component — the card body (cover, prices, link) renders on the server. The only
// client islands are the leaf <LikeButton> and <AddToCartTrigger> (the cart button + modal).
export default function BookCard({ book, className, eager = false }: Props) {
  return (
    <article className={cn(styles.card, className)}>
      <div className={styles.coverWrap}>
        <Link href={book.periodicalHref ?? `/books/${book.slug}`} className={styles.coverLink} tabIndex={-1} aria-hidden>
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={`Обложка книги: ${book.name}`}
              fill
              sizes='(max-width: 767px) 45vw, (max-width: 1200px) 30vw, 220px'
              className={styles.cover}
              loading={eager ? 'eager' : 'lazy'}
              placeholder={book.coverBlurDataUrl ? 'blur' : 'empty'}
              blurDataURL={book.coverBlurDataUrl ?? undefined}
            />
          ) : (
            <div className={styles.coverPlaceholder} aria-hidden />
          )}
        </Link>
        <LikeButton type='title' itemId={book.titleId} className={styles.likeBtn} />
      </div>

      <div className={styles.footer}>
        <div className={styles.prices}>
          <span className={styles.price}>{formatProductPrice(book.price)}</span>
          {book.originalPrice && (
            <span className={styles.originalPrice}>{formatPrice(book.originalPrice)}</span>
          )}
        </div>

        <AddToCartTrigger
          editions={book.editions}
          name={book.name}
          authorNames={book.authorNames}
          coverUrl={book.coverUrl}
          inStock={book.inStock}
        />
      </div>
    </article>
  )
}
