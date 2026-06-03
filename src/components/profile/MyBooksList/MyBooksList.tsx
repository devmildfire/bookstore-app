'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import cn from 'classnames'
import { useQuery } from '@tanstack/react-query'
import { getOrders, ordersQueryKey } from '@/api/orders'
import { getDownloadUrlAction } from '@/lib/orders/actions'
import ProductTypeIcon from '@/components/common/icons/ProductTypeIcon'
import { BOOK_CATEGORIES, CATEGORY_LABEL, DIGITAL_CATEGORIES } from '@/lib/orderDisplay'
import type { OrderItem } from '@/entities/order/client'
import styles from './MyBooksList.module.scss'

// The library: every book edition the user owns (digital + physical), pulled
// from their paid orders and de-duplicated by edition. Digital books get a
// download; physical ones are shown as owned with a link to their page.
export default function MyBooksList() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ordersQueryKey,
    queryFn: getOrders,
  })

  if (isLoading) return <p className={styles.empty}>Загрузка…</p>

  const byBookId = new Map<string, OrderItem>()
  for (const order of orders) {
    for (const item of order.items) {
      if (BOOK_CATEGORIES.has(item.category) && !byBookId.has(item.bookId)) {
        byBookId.set(item.bookId, item)
      }
    }
  }
  const books = Array.from(byBookId.values())

  if (books.length === 0) return <p className={styles.empty}>Пока ничего нет</p>

  return (
    <div className={styles.grid}>
      {books.map((item) => (
        <BookCard key={item.bookId} item={item} />
      ))}
    </div>
  )
}

function BookCard({ item }: { item: OrderItem }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDigital = DIGITAL_CATEGORIES.has(item.category)
  const href = item.titleSlug ? `/books/${item.titleSlug}` : null
  const categoryLabel = CATEGORY_LABEL[item.category] ?? item.category

  async function handleDownload() {
    if (busy) return
    setBusy(true)
    setError(null)
    const result = await getDownloadUrlAction(item.id)
    setBusy(false)
    if (result.status === 'ok') {
      const a = document.createElement('a')
      a.href = result.url
      a.rel = 'noopener'
      a.download = ''
      document.body.appendChild(a)
      a.click()
      a.remove()
      return
    }
    const messages: Record<string, string> = {
      not_authenticated: 'Нужно войти.',
      not_owner: 'Не ваш заказ.',
      not_digital: 'Файл недоступен.',
      no_file: 'Файл ещё не загружен.',
      sign_failed: 'Не удалось создать ссылку.',
    }
    setError(messages[result.reason] ?? 'Ошибка.')
  }

  const cover = (
    <div className={styles.cover}>
      {item.coverUrl ? (
        <Image
          src={item.coverUrl}
          alt={`Обложка: ${item.name}`}
          fill
          sizes='(max-width: 532px) 45vw, 200px'
          className={styles.coverImg}
          unoptimized
        />
      ) : (
        <div className={styles.coverPlaceholder} aria-hidden />
      )}
    </div>
  )

  // The category icon doubles as the action: digital → download; physical →
  // open the book page. The icon's strokes turn accent-red on hover/focus.
  const icon = <ProductTypeIcon category={item.category} size={30} className={styles.icon} />

  return (
    <div className={styles.card}>
      {href ? (
        <Link href={href} className={styles.coverLink} aria-label={item.name}>
          {cover}
        </Link>
      ) : (
        cover
      )}

      <div className={styles.body}>
        <span className={styles.name}>{item.name}</span>

        {isDigital ? (
          <button
            type='button'
            className={cn(styles.iconBtn, busy && styles.iconBtnBusy)}
            onClick={handleDownload}
            disabled={busy}
            title={`Скачать · ${categoryLabel}`}
            aria-label={`Скачать «${item.name}» · ${categoryLabel}`}
            aria-busy={busy}
          >
            {icon}
          </button>
        ) : href ? (
          <Link
            href={href}
            className={styles.iconBtn}
            title={categoryLabel}
            aria-label={`${categoryLabel}: открыть страницу «${item.name}»`}
          >
            {icon}
          </Link>
        ) : (
          <span className={styles.iconStatic} title={categoryLabel} aria-label={categoryLabel}>
            {icon}
          </span>
        )}
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
