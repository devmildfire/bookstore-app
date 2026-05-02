'use client'

import Image from 'next/image'
import Link from 'next/link'
import cn from 'classnames'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'
import type { Book } from '@/entities/book/client'
import styles from './BookCard.module.scss'

type Props = {
  book: Book
  onAddToCart?: (bookId: string) => void
  className?: string
}

export default function BookCard({ book, onAddToCart, className }: Props) {
  const priceFormatted = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(book.price)

  return (
    <article className={cn(styles.card, className)}>
      <Link href={`/books/${book.slug}`} className={styles.imageLink} tabIndex={-1} aria-hidden>
        <div className={styles.imageWrapper}>
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={book.name}
              fill
              sizes='(max-width: 767px) 45vw, (max-width: 1200px) 30vw, 220px'
              className={styles.image}
            />
          ) : (
            <div className={styles.imagePlaceholder} aria-hidden />
          )}
        </div>
      </Link>

      <div className={styles.body}>
        <Badge variant='default' className={styles.category}>
          {book.category}
        </Badge>

        <Link href={`/books/${book.slug}`} className={styles.titleLink}>
          <h3 className={styles.title}>{book.name}</h3>
        </Link>

        <p className={styles.author}>{book.authorName}</p>

        <div className={styles.footer}>
          <span className={styles.price}>{priceFormatted}</span>
          <Button
            variant='primary'
            size='sm'
            onClick={() => onAddToCart?.(book.id)}
            disabled={!book.inStock}
            aria-label={`Добавить «${book.name}» в корзину`}
          >
            {book.inStock ? 'В корзину' : 'Нет в наличии'}
          </Button>
        </div>
      </div>
    </article>
  )
}
