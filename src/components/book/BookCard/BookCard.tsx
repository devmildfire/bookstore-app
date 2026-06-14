'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import cn from 'classnames'
import CartPlusIcon from '@/components/common/icons/CartPlusIcon'
import LikeButton from '@/components/common/LikeButton'
import { formatPrice, formatProductPrice } from '@/lib/formatPrice'
import type { Book } from '@/entities/book/client'
import styles from './BookCard.module.scss'

type Props = {
  book: Book
  className?: string
}

export default function BookCard({ book, className }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  function handleCartClick(e: React.MouseEvent) {
    e.preventDefault()
    if (!book.inStock) return
    setModalOpen(true)
  }

  return (
    <>
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

          <button
            type="button"
            className={styles.cartBtn}
            onClick={handleCartClick}
            disabled={!book.inStock}
            aria-label={`Добавить «${book.name}» в корзину`}
          >
            <CartPlusIcon size={22} />
          </button>
        </div>
      </article>

      {modalOpen && (
        <AddToCartModal
          slug={book.slug}
          titleName={book.name}
          authorNames={book.authorNames}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}

// Lazy import to avoid circular dependency and keep bundle clean
import dynamic from 'next/dynamic'
const AddToCartModal = dynamic(() => import('@/components/book/AddToCartModal'), {
  ssr: false,
})
