'use client'

import Image from 'next/image'
import Link from 'next/link'
import cn from 'classnames'
import { useQuery } from '@tanstack/react-query'
import { getOrderHistory, orderHistoryQueryKey } from '@/api/orders'
import { formatPrice } from '@/lib/formatPrice'
import {
  CATEGORY_LABEL,
  formatOrderDate,
  fulfillmentLabel,
  itemLink,
  paymentStatusLabel,
} from '@/lib/orderDisplay'
import type { Order, OrderItem, OrderStatus } from '@/entities/order/client'
import styles from './OrderHistoryList.module.scss'

const SUBSCRIPTION_STATUS_LABEL: Record<string, string> = {
  active: 'Активна',
  cancelled: 'Отменена',
  past_due: 'Просрочена',
}

// Payment-status badge tone — paid reads positive, an unpaid/abandoned order
// reads as a warning so it can't be mistaken for a completed purchase.
const PAYMENT_BADGE_CLASS: Record<OrderStatus, string> = {
  paid: styles.badgePaid,
  pending: styles.badgePending,
  failed: styles.badgeFailed,
  cancelled: styles.badgeCancelled,
}

// A short reassurance/clarification shown under unpaid orders.
const PAYMENT_NOTE: Partial<Record<OrderStatus, string>> = {
  pending: 'Оплата не завершена — заказ ещё не оплачен, деньги не списаны.',
  failed: 'Оплата не прошла — заказ не оплачен, деньги не списаны.',
}

type Props = { highlightOrderId?: number }

export default function OrderHistoryList({ highlightOrderId }: Props) {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: orderHistoryQueryKey,
    queryFn: getOrderHistory,
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
      <header className={styles.header}>
        <div className={styles.headLeft}>
          <h3 className={styles.orderTitle}>Заказ №{order.id}</h3>
          <p className={styles.orderDate}>{formatOrderDate(order.createdAt)}</p>
        </div>
        <div className={styles.headRight}>
          <div className={styles.badges}>
            <span className={cn(styles.badge, PAYMENT_BADGE_CLASS[order.status])}>
              {paymentStatusLabel(order.status)}
            </span>
            {/* Fulfillment only means something once the order is paid. */}
            {order.status === 'paid' && (
              <span className={styles.badge}>{fulfillmentLabel(order.fulfillmentStatus)}</span>
            )}
          </div>
          <div className={styles.total}>{formatPrice(order.total)}</div>
        </div>
      </header>

      {PAYMENT_NOTE[order.status] && (
        <p className={styles.unpaidNote}>{PAYMENT_NOTE[order.status]}</p>
      )}

      {order.shipping && (
        <p className={styles.meta}>
          Доставка: {order.shipping.name}, {order.shipping.city}, {order.shipping.street},{' '}
          {order.shipping.building}, {order.shipping.postalCode}
        </p>
      )}

      {order.giftCardTotalApplied > 0 && (
        <p className={styles.meta}>
          Картами даров: {formatPrice(order.giftCardTotalApplied)} · к оплате:{' '}
          {formatPrice(order.amountDue)}
        </p>
      )}

      <ul className={styles.items}>
        {order.items.map((item) => (
          <ItemRow key={item.id} item={item} subscriptionStatus={order.subscriptionStatus} />
        ))}
      </ul>
    </article>
  )
}

function ItemRow({
  item,
  subscriptionStatus,
}: {
  item: OrderItem
  subscriptionStatus: string | null
}) {
  const href = itemLink(item)
  const subNote =
    item.category === 'Subscription' && subscriptionStatus
      ? SUBSCRIPTION_STATUS_LABEL[subscriptionStatus] ?? subscriptionStatus
      : null

  const body = (
    <>
      <span className={styles.thumb}>
        {item.coverUrl ? (
          <Image
            src={item.coverUrl}
            alt=''
            fill
            sizes='48px'
            className={styles.thumbImg}
            unoptimized
          />
        ) : (
          <span className={styles.thumbPlaceholder} aria-hidden />
        )}
      </span>
      <span className={styles.itemBody}>
        <span className={styles.itemName}>{item.name}</span>
        <span className={styles.itemMeta}>
          {CATEGORY_LABEL[item.category] ?? item.category}
          {item.boxSetName ? ` · из бокс-сета «${item.boxSetName}»` : ''}
          {subNote ? ` · ${subNote}` : ''}
        </span>
      </span>
      <span className={styles.itemRight}>
        {item.quantity > 1 && <span className={styles.qty}>× {item.quantity}</span>}
        <span className={styles.price}>{formatPrice(item.price * item.quantity)}</span>
      </span>
    </>
  )

  return (
    <li className={styles.item}>
      {href ? (
        <Link href={href} className={styles.itemLink}>
          {body}
        </Link>
      ) : (
        <div className={styles.itemLink}>{body}</div>
      )}
    </li>
  )
}
