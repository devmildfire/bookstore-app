'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import cn from 'classnames'
import CartPlusIcon from '@/components/common/icons/CartPlusIcon'
import { useCart } from '@/contexts/cart'
import type { Book } from '@/entities/book/client'
import styles from './BookCard.module.scss'

type Props = {
  book: Book
  className?: string
}

const fmt = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

export default function BookCard({ book, className }: Props) {
  const { addItem } = useCart()
  const [modalOpen, setModalOpen] = useState(false)

  function handleCartClick(e: React.MouseEvent) {
    e.preventDefault()
    if (!book.inStock) return

    if (book.hasMultipleProducts) {
      setModalOpen(true)
    } else {
      addItem({
        id: book.id,
        name: book.name,
        price: book.price,
        picture: book.coverUrl,
        category: book.category,
      })
    }
  }

  return (
    <>
      <article className={cn(styles.card, className)}>
        <Link href={`/books/${book.slug}`} className={styles.coverLink} tabIndex={-1} aria-hidden>
          <div className={styles.coverWrap}>
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={`Обложка книги: ${book.name}`}
                fill
                sizes='(max-width: 767px) 45vw, (max-width: 1200px) 30vw, 220px'
                className={styles.cover}
              />
            ) : (
              <div className={styles.coverPlaceholder} aria-hidden />
            )}
          </div>
        </Link>

        <div className={styles.footer}>
          <div className={styles.prices}>
            <span className={styles.price}>{fmt.format(book.price)}</span>
            {book.originalPrice && (
              <span className={styles.originalPrice}>{fmt.format(book.originalPrice)}</span>
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
          authorName={book.authorName}
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
