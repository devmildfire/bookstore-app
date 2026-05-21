'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getOrders, ordersQueryKey } from '@/api/orders'
import { getDownloadUrlAction } from '@/lib/orders/actions'
import { formatPrice } from '@/lib/formatPrice'
import type { Order, OrderItem } from '@/entities/order/client'
import type { ProductCategory } from '@/types/database'
import styles from './OrdersList.module.scss'

const DIGITAL_CATEGORIES = new Set<ProductCategory>(['EBook', 'AudioBook', 'Book2.0'])

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch {
    return iso
  }
}

type Props = {
  highlightOrderId?: number
}

export default function OrdersList({ highlightOrderId }: Props) {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ordersQueryKey,
    queryFn: getOrders,
  })

  if (isLoading) {
    return <p className={styles.empty}>Загрузка заказов…</p>
  }

  if (orders.length === 0) {
    return <p className={styles.empty}>У вас пока нет заказов.</p>
  }

  return (
    <div className={styles.list}>
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          highlighted={order.id === highlightOrderId}
        />
      ))}
    </div>
  )
}

function OrderCard({ order, highlighted }: { order: Order; highlighted: boolean }) {
  return (
    <article className={`${styles.card} ${highlighted ? styles.cardHighlighted : ''}`}>
      <header className={styles.cardHeader}>
        <div>
          <h3 className={styles.cardTitle}>Заказ №{order.id}</h3>
          <p className={styles.cardDate}>{formatDate(order.createdAt)}</p>
        </div>
        <div className={styles.cardTotal}>{formatPrice(order.total)}</div>
      </header>

      {order.promoCode && (
        <p className={styles.cardPromo}>
          Промокод: <strong>{order.promoCode}</strong> ({formatPrice(order.promoDiscount)})
        </p>
      )}

      {order.shipping && (
        <p className={styles.cardShipping}>
          Доставка: {order.shipping.name}, {order.shipping.city}, {order.shipping.street},{' '}
          {order.shipping.building}, {order.shipping.postalCode}
        </p>
      )}

      <ul className={styles.items}>
        {order.items.map((item) => (
          <OrderItemRow key={item.id} item={item} />
        ))}
      </ul>
    </article>
  )
}

function OrderItemRow({ item }: { item: OrderItem }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDigital = DIGITAL_CATEGORIES.has(item.category)
  const isPhysical = item.category === 'PrintBook'
  const isManual = !isDigital && !isPhysical // BoxSet/GiftCard/Subscription/Course

  async function handleDownload() {
    setBusy(true)
    setError(null)
    const result = await getDownloadUrlAction(item.id)
    setBusy(false)
    if (result.status === 'ok') {
      window.open(result.url, '_blank', 'noopener,noreferrer')
      return
    }
    const messages: Record<string, string> = {
      not_authenticated: 'Нужно войти.',
      not_owner: 'Не ваш заказ.',
      not_digital: 'Файл для этого типа товара пока недоступен.',
      no_file: 'Файл ещё не загружен. Мы работаем над этим.',
      sign_failed: 'Не удалось создать ссылку, попробуйте ещё раз.',
    }
    setError(messages[result.reason] ?? 'Ошибка.')
  }

  return (
    <li className={styles.itemRow}>
      <div className={styles.itemMain}>
        <span className={styles.itemName}>{item.name}</span>
        {item.quantity > 1 && (
          <span className={styles.itemQty}>× {item.quantity}</span>
        )}
      </div>

      <div className={styles.itemAction}>
        {isDigital && (
          <>
            <button
              type='button'
              className={styles.downloadBtn}
              onClick={handleDownload}
              disabled={busy}
            >
              {busy ? 'Подготовка…' : 'Скачать'}
            </button>
            {error && <p className={styles.itemError}>{error}</p>}
          </>
        )}
        {isPhysical && (
          <span className={styles.itemStatus}>Ожидает отправки</span>
        )}
        {isManual && (
          <span className={styles.itemStatus}>Ждёт ручной обработки</span>
        )}
      </div>
    </li>
  )
}
