'use client'

import Image from 'next/image'
import cn from 'classnames'
import { useQuery } from '@tanstack/react-query'
import { getOrders, ordersQueryKey } from '@/api/orders/getOrders'
import useDigitalDownload from '@/hooks/useDigitalDownload'
import ProductTypeIcon from '@/components/common/icons/ProductTypeIcon'
import {
  BOOK_CATEGORIES,
  CATEGORY_LABEL,
  DOWNLOADABLE_BOOK_CATEGORIES,
  SHIPPED_BOOK_CATEGORIES,
  libraryShippingLabel,
} from '@/lib/orderDisplay'
import type { ProductCategory } from '@/types/database'
import type { FulfillmentStatus } from '@/entities/order/client'
import styles from './MyBooksList.module.scss'

// One owned book, merged across editions/orders. A title may have been bought
// as print, card and/or digital; we show a single tile that always offers the
// digital download (print buyers are gifted the digital edition; a card book is
// itself a digital edition on a drive) and, when a physical copy is owned (print
// or card), its shipping state.
type LibraryBook = {
  key: string
  name: string
  coverUrl: string | null
  // Order item the download is issued against. Prefers an edition that carries
  // its own file (so the user gets the exact file they bought); for a print-only
  // purchase the server resolves the title's gifted digital edition from this item.
  downloadItemId: number
  // Category used for the download icon/label — the downloadable edition owned,
  // or EBook for a print-only purchase (the gifted format).
  downloadCategory: ProductCategory
  ownsFile: boolean
  // Physical copy's shipping state + which physical edition it is (print/card),
  // null when the user owns no physical edition.
  shipping: FulfillmentStatus | null
  shippedCategory: ProductCategory | null
}

// The library: every book the user owns, pulled from their paid orders and
// merged by title.
export default function MyBooksList() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ordersQueryKey,
    queryFn: getOrders,
  })

  if (isLoading) return <p className={styles.empty}>Загрузка…</p>

  const byTitle = new Map<string, LibraryBook>()
  // Orders arrive newest-first, so the first physical line seen for a title is
  // its most recent purchase — the shipping state we want to surface.
  for (const order of orders) {
    for (const item of order.items) {
      if (!BOOK_CATEGORIES.has(item.category)) continue
      const key = item.titleSlug ?? item.bookId
      const hasFile = DOWNLOADABLE_BOOK_CATEGORIES.has(item.category)
      const isShipped = SHIPPED_BOOK_CATEGORIES.has(item.category)
      const existing = byTitle.get(key)

      if (!existing) {
        byTitle.set(key, {
          key,
          name: item.name,
          coverUrl: item.coverUrl,
          downloadItemId: item.id,
          downloadCategory: hasFile ? item.category : 'EBook',
          ownsFile: hasFile,
          shipping: isShipped ? order.fulfillmentStatus : null,
          shippedCategory: isShipped ? item.category : null,
        })
        continue
      }

      // Prefer an edition that carries its own file for the download action.
      if (hasFile && !existing.ownsFile) {
        existing.downloadItemId = item.id
        existing.downloadCategory = item.category
        existing.ownsFile = true
      }
      // First physical line wins (most recent order).
      if (isShipped && existing.shipping === null) {
        existing.shipping = order.fulfillmentStatus
        existing.shippedCategory = item.category
      }
      if (!existing.coverUrl && item.coverUrl) existing.coverUrl = item.coverUrl
    }
  }

  const books = Array.from(byTitle.values())
  if (books.length === 0) return <p className={styles.empty}>Пока ничего нет</p>

  return (
    <div className={styles.grid}>
      {books.map((book) => (
        <BookCard key={book.key} book={book} />
      ))}
    </div>
  )
}

function BookCard({ book }: { book: LibraryBook }) {
  const { download, busy, error } = useDigitalDownload()
  const handleDownload = () => download(book.downloadItemId)

  const categoryLabel = CATEGORY_LABEL[book.downloadCategory] ?? book.downloadCategory

  return (
    <div className={styles.card}>
      {/* The cover is the primary download trigger. */}
      <button
        type='button'
        className={cn(styles.cover, busy && styles.coverBusy)}
        onClick={handleDownload}
        disabled={busy}
        aria-label={`Скачать «${book.name}» · ${categoryLabel}`}
        aria-busy={busy}
        title={`Скачать · ${categoryLabel}`}
      >
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={`Обложка: ${book.name}`}
            fill
            sizes='(max-width: 532px) 45vw, 200px'
            className={styles.coverImg}
            unoptimized
          />
        ) : (
          <div className={styles.coverPlaceholder} aria-hidden />
        )}
        <span className={styles.coverOverlay} aria-hidden>
          {busy ? 'Загрузка…' : 'Скачать'}
        </span>
      </button>

      <div className={styles.body}>
        <span className={styles.name}>{book.name}</span>

        <button
          type='button'
          className={cn(styles.iconBtn, busy && styles.iconBtnBusy)}
          onClick={handleDownload}
          disabled={busy}
          title={`Скачать · ${categoryLabel}`}
          aria-label={`Скачать «${book.name}» · ${categoryLabel}`}
          aria-busy={busy}
        >
          <ProductTypeIcon category={book.downloadCategory} size={30} className={styles.icon} />
        </button>
      </div>

      {book.shipping && book.shippedCategory && (
        <p className={styles.shipping}>
          {libraryShippingLabel(book.shipping, book.shippedCategory)}
        </p>
      )}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
