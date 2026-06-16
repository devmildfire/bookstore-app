'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import cn from 'classnames'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getOrderHistory, orderHistoryQueryKey } from '@/api/orders'
import { cancelOrderAction, resumeCheckoutAction } from '@/lib/orders/actions'
import { submitPaymentRedirect } from '@/lib/payments/submitRedirect'
import useDigitalDownload from '@/hooks/useDigitalDownload'
import { formatPrice, formatProductPrice } from '@/lib/formatPrice'
import {
  BOOK_CATEGORIES,
  CATEGORY_LABEL,
  formatOrderDate,
  fulfillmentLabel,
  itemLink,
  paymentStatusLabel,
  SHIPPED_BOOK_CATEGORIES,
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

// Outcome of a just-returned payment attempt — distinct messages so a buyer's
// own cancellation is never mislabelled as a bank decline. `declined` reads
// strongest (red); `cancelled`/`failed` are calmer (amber).
type PaymentNoticeKind = 'declined' | 'cancelled' | 'failed'

const PAYMENT_NOTICE: Record<PaymentNoticeKind, string> = {
  declined:
    'Банк отклонил платёж — деньги не списаны. Заказ ждёт оплаты: попробуйте оплатить ещё раз сейчас или позже.',
  cancelled: 'Оплата отменена — заказ не оплачен. Вы можете оплатить его сейчас или позже.',
  failed: 'Оплата не завершена — заказ не оплачен, деньги не списаны. Можно попробовать ещё раз.',
}

type Props = {
  highlightOrderId?: number
  noticeOrderId?: number
  noticeKind?: PaymentNoticeKind
}

export default function OrderHistoryList({ highlightOrderId, noticeOrderId, noticeKind }: Props) {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: orderHistoryQueryKey,
    queryFn: getOrderHistory,
  })

  if (isLoading) return <p className={styles.empty}>Загрузка заказов…</p>
  if (orders.length === 0) return <p className={styles.empty}>У вас пока нет заказов.</p>

  return (
    <div className={styles.orders}>
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          highlighted={order.id === highlightOrderId}
          notice={order.id === noticeOrderId ? noticeKind : undefined}
        />
      ))}
    </div>
  )
}

function OrderCard({
  order,
  highlighted,
  notice,
}: {
  order: Order
  highlighted: boolean
  notice?: PaymentNoticeKind
}) {
  // A just-returned payment attempt (notice) gets its specific message; otherwise
  // the generic unpaid note. notice only ever applies to a still-pending order.
  const showNotice = notice && order.status === 'pending'
  const note = showNotice ? PAYMENT_NOTICE[notice] : PAYMENT_NOTE[order.status]

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
            {/* Per-edition fulfillment (download / shipping state) is shown on each
                item row below, so no order-level fulfillment badge here. */}
          </div>
          <div className={styles.total}>{formatPrice(order.total)}</div>
        </div>
      </header>

      {note && (
        <p className={cn(styles.unpaidNote, showNotice && notice === 'declined' && styles.declinedNote)}>
          {note}
        </p>
      )}

      {order.status === 'pending' && <PendingActions orderId={order.id} />}

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
          <ItemRow key={item.id} item={item} order={order} />
        ))}
      </ul>
    </article>
  )
}

// Buyer-facing actions for an abandoned (pending) order: finish paying — which
// re-hands the browser to the gateway for the same order — or cancel it.
function PendingActions({ orderId }: { orderId: number }) {
  const queryClient = useQueryClient()
  const [busy, setBusy] = useState<'resume' | 'cancel' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleResume() {
    setBusy('resume')
    setError(null)
    const result = await resumeCheckoutAction(orderId)
    if (result.status === 'redirect') {
      submitPaymentRedirect(result.redirect) // full-page navigation to the gateway
      return // keep the button disabled while the browser leaves
    }
    if (result.status === 'paid') {
      await queryClient.invalidateQueries({ queryKey: orderHistoryQueryKey })
      return
    }
    setError('Не удалось продолжить оплату. Попробуйте ещё раз.')
    setBusy(null)
  }

  async function handleCancel() {
    setBusy('cancel')
    setError(null)
    const result = await cancelOrderAction(orderId)
    if (result.status === 'ok') {
      await queryClient.invalidateQueries({ queryKey: orderHistoryQueryKey })
      return
    }
    setError('Не удалось отменить заказ. Попробуйте ещё раз.')
    setBusy(null)
  }

  return (
    <div className={styles.actions}>
      <button
        type='button'
        className={styles.payButton}
        onClick={handleResume}
        disabled={busy !== null}
      >
        {busy === 'resume' ? 'Переход к оплате…' : 'Завершить оплату'}
      </button>
      <button
        type='button'
        className={styles.cancelButton}
        onClick={handleCancel}
        disabled={busy !== null}
      >
        {busy === 'cancel' ? 'Отмена…' : 'Отменить заказ'}
      </button>
      {error && <span className={styles.actionError}>{error}</span>}
    </div>
  )
}

function ItemRow({ item, order }: { item: OrderItem; order: Order }) {
  const isBook = BOOK_CATEGORIES.has(item.category)
  const isBoxSet = item.category === 'BoxSet'
  const isShipped = SHIPPED_BOOK_CATEGORIES.has(item.category)
  const paid = order.status === 'paid'

  // Order history must NOT bounce the buyer back to the store. Books and
  // box-sets drop their /books link; gift cards, subscriptions and courses keep
  // their in-cabinet / access links.
  const href = isBook || isBoxSet ? null : itemLink(item)

  const subNote =
    item.category === 'Subscription' && order.subscriptionStatus
      ? SUBSCRIPTION_STATUS_LABEL[order.subscriptionStatus] ?? order.subscriptionStatus
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
        {/* Box-set components are snapshotted at price 0 (the set is priced as a whole),
            so they must show 0₽, not «Бесценно» — only genuinely free products do. */}
        <span className={styles.price}>
          {item.boxSetName
            ? formatPrice(item.price * item.quantity)
            : formatProductPrice(item.price * item.quantity)}
        </span>
      </span>
    </>
  )

  // Once paid: digital editions (incl. the gifted digital of a print purchase)
  // are downloadable; physical editions show where the shipment is.
  const showDownload = paid && isBook
  const showShipping = paid && (isShipped || isBoxSet)

  return (
    <li className={styles.item}>
      {href ? (
        <Link href={href} className={styles.itemLink}>
          {body}
        </Link>
      ) : (
        <div className={styles.itemLink}>{body}</div>
      )}

      {(showDownload || showShipping) && (
        <ItemFulfillment
          item={item}
          order={order}
          showDownload={showDownload}
          showShipping={showShipping}
        />
      )}
    </li>
  )
}

// Per-item footer: a download button for owned digital editions and/or the
// physical edition's shipping state (with tracking when available).
function ItemFulfillment({
  item,
  order,
  showDownload,
  showShipping,
}: {
  item: OrderItem
  order: Order
  showDownload: boolean
  showShipping: boolean
}) {
  const { download, busy, error } = useDigitalDownload()

  const tracking =
    showShipping && order.trackingNumber
      ? `${order.trackingCarrier ? `${order.trackingCarrier} ` : ''}${order.trackingNumber}`
      : null

  return (
    <div className={styles.fulfillment}>
      {showDownload && (
        <button
          type='button'
          className={styles.downloadButton}
          onClick={() => download(item.id)}
          disabled={busy}
          aria-busy={busy}
        >
          {busy ? 'Загрузка…' : 'Скачать цифровое издание'}
        </button>
      )}
      {showShipping && (
        <span className={styles.shipStatus}>
          {fulfillmentLabel(order.fulfillmentStatus)}
          {tracking ? ` · ${tracking}` : ''}
        </span>
      )}
      {error && <span className={styles.actionError}>{error}</span>}
    </div>
  )
}
