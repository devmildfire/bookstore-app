'use client'

import { useState } from 'react'
import Image from 'next/image'
import cn from 'classnames'
import { useQuery } from '@tanstack/react-query'
import { getOrders, ordersQueryKey } from '@/api/orders'
import { getDownloadUrlAction } from '@/lib/orders/actions'
import { formatPrice } from '@/lib/formatPrice'
import type { Order, OrderItem } from '@/entities/order/client'
import type { ProductCategory } from '@/types/database'
import styles from './OrdersList.module.scss'

const DIGITAL_CATEGORIES = new Set<ProductCategory>(['EBook', 'AudioBook', 'Book2.0'])

const CATEGORY_LABEL: Partial<Record<ProductCategory, string>> = {
  EBook: 'Электронная книга',
  AudioBook: 'Аудиокнига',
  'Book2.0': 'Карточная книга',
  PrintBook: 'Печатная книга',
  BoxSet: 'Бокс-сет',
  GiftCard: 'Подарочная карта',
  Subscription: 'Подписка',
  Course: 'Курс',
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

type Props = { highlightOrderId?: number }

export default function OrdersList({ highlightOrderId }: Props) {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ordersQueryKey,
    queryFn: getOrders,
  })

  if (isLoading) return <p className={styles.empty}>Загрузка заказов…</p>
  if (orders.length === 0) return <p className={styles.empty}>У вас пока нет заказов.</p>

  return (
    <div className={styles.orders}>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} highlighted={order.id === highlightOrderId} />
      ))}
    </div>
  )
}

function OrderCard({ order, highlighted }: { order: Order; highlighted: boolean }) {
  return (
    <article className={cn(styles.order, highlighted && styles.orderHighlighted)}>
      <header className={styles.orderHeader}>
        <div>
          <h3 className={styles.orderTitle}>Заказ №{order.id}</h3>
          <p className={styles.orderDate}>{formatDate(order.createdAt)}</p>
        </div>
        <div className={styles.orderTotal}>{formatPrice(order.total)}</div>
      </header>

      {order.shipping && (
        <p className={styles.orderShipping}>
          Доставка: {order.shipping.name}, {order.shipping.city}, {order.shipping.street},{' '}
          {order.shipping.building}, {order.shipping.postalCode}
        </p>
      )}

      {order.giftCardTotalApplied > 0 && (
        <p className={styles.orderShipping}>
          Картами даров: {formatPrice(order.giftCardTotalApplied)} · к оплате: {formatPrice(order.amountDue)}
        </p>
      )}

      <div className={styles.grid}>
        {order.items.map((item) => (
          <ItemTile key={item.id} item={item} />
        ))}
      </div>
    </article>
  )
}

function ItemTile({ item }: { item: OrderItem }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDigital = DIGITAL_CATEGORIES.has(item.category)
  const isPhysical = item.category === 'PrintBook'
  const isManual = !isDigital && !isPhysical

  async function handleDownload() {
    if (!isDigital || busy) return
    setBusy(true)
    setError(null)
    const result = await getDownloadUrlAction(item.id)
    setBusy(false)
    if (result.status === 'ok') {
      // Trigger a real save via a transient <a download>. The URL
      // already carries Content-Disposition: attachment from
      // createSignedUrl({ download: true }) so the browser saves
      // instead of opening a new tab.
      const a = document.createElement('a')
      a.href = result.url
      a.rel = 'noopener'
      a.download = '' // hint to the browser; server header takes precedence
      document.body.appendChild(a)
      a.click()
      a.remove()
      return
    }
    const messages: Record<string, string> = {
      not_authenticated: 'Нужно войти.',
      not_owner: 'Не ваш заказ.',
      not_digital: 'Файл для этого типа товара пока недоступен.',
      no_file: 'Файл ещё не загружен.',
      sign_failed: 'Не удалось создать ссылку.',
    }
    setError(messages[result.reason] ?? 'Ошибка.')
  }

  const status = isPhysical
    ? 'Ожидает отправки'
    : isManual
      ? 'Ждёт ручной обработки'
      : null

  const Tag = isDigital ? 'button' : 'div'

  return (
    <div className={styles.tileWrap}>
      <Tag
        {...(isDigital
          ? {
              type: 'button' as const,
              onClick: handleDownload,
              disabled: busy,
              'aria-label': `Скачать «${item.name}»`,
            }
          : {})}
        className={cn(styles.tile, isDigital && styles.tileClickable, busy && styles.tileBusy)}
      >
        <div className={styles.cover}>
          {item.coverUrl ? (
            <Image
              src={item.coverUrl}
              alt={`Обложка: ${item.name}`}
              fill
              sizes='(max-width: 532px) 45vw, 220px'
              className={styles.coverImg}
              unoptimized
            />
          ) : (
            <div className={styles.coverPlaceholder} aria-hidden />
          )}

          {isDigital && (
            <div className={styles.hoverOverlay} aria-hidden>
              <DownloadIcon />
            </div>
          )}
          {busy && <div className={styles.busyOverlay} aria-hidden>…</div>}
        </div>

        <div className={styles.label}>
          <MediaIcon category={item.category} />
          <span className={styles.labelText}>{item.name}</span>
        </div>
      </Tag>

      {item.boxSetName && (
        <p className={styles.boxSetTag}>Из бокс-сета «{item.boxSetName}»</p>
      )}
      {item.quantity > 1 && <p className={styles.qty}>× {item.quantity}</p>}
      {status && <p className={styles.status}>{status}</p>}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}

// ─── Icons (currentColor stroke; SCSS picks the colour) ──────────────────────

function MediaIcon({ category }: { category: ProductCategory }) {
  const label = CATEGORY_LABEL[category]
  return (
    <span className={styles.mediaIcon} title={label} aria-label={label}>
      {category === 'EBook' ? (
        // Phone outline (ebook on a device)
        <svg width='20' height='22' viewBox='0 0 20 22' fill='none'>
          <rect x='3' y='1.5' width='14' height='19' rx='2' stroke='currentColor' strokeWidth='1.4' />
          <line x1='8' y1='17.5' x2='12' y2='17.5' stroke='currentColor' strokeWidth='1.4' strokeLinecap='round' />
        </svg>
      ) : category === 'AudioBook' ? (
        // Headphones
        <svg width='22' height='20' viewBox='0 0 22 20' fill='none' stroke='currentColor' strokeWidth='1.4' strokeLinecap='round' strokeLinejoin='round'>
          <path d='M3 12V11a8 8 0 0 1 16 0v1' />
          <rect x='2' y='12' width='4' height='6' rx='1' />
          <rect x='16' y='12' width='4' height='6' rx='1' />
        </svg>
      ) : category === 'Book2.0' ? (
        // Stacked / card-book shape
        <svg width='22' height='20' viewBox='0 0 22 20' fill='none' stroke='currentColor' strokeWidth='1.4' strokeLinejoin='round'>
          <path d='M3 4l8 4 8-4v12l-8 4-8-4z' />
        </svg>
      ) : category === 'PrintBook' ? (
        // Parcel/box
        <svg width='22' height='20' viewBox='0 0 22 20' fill='none' stroke='currentColor' strokeWidth='1.4' strokeLinejoin='round'>
          <path d='M3 6l8-4 8 4v8l-8 4-8-4z' />
          <line x1='3' y1='6' x2='19' y2='6' />
          <line x1='11' y1='10' x2='11' y2='18' />
        </svg>
      ) : (
        // Generic doc fallback for BoxSet / GiftCard / Subscription / Course
        <svg width='18' height='22' viewBox='0 0 18 22' fill='none' stroke='currentColor' strokeWidth='1.4' strokeLinejoin='round'>
          <path d='M3 2h8l4 4v14H3z' />
          <path d='M11 2v4h4' />
        </svg>
      )}
    </span>
  )
}

function DownloadIcon() {
  return (
    <svg width='40' height='40' viewBox='0 0 40 40' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
      <circle cx='20' cy='20' r='18' />
      <path d='M20 11v14M14 19l6 6 6-6' />
    </svg>
  )
}
