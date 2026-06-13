import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminOrder } from '@/api/admin/orders'
import { formatPrice } from '@/lib/formatPrice'
import { CATEGORY_LABEL, fulfillmentLabel, formatOrderDate, paymentStatusLabel } from '@/lib/orderDisplay'
import Badge from '@/components/common/Badge'
import { FulfillmentForm } from '@/components/admin/orders'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Заказ' }

type Props = { params: Promise<{ id: string }> }

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params
  const orderId = Number(id)
  if (!Number.isInteger(orderId) || orderId <= 0) notFound()

  const detail = await getAdminOrder(orderId)
  if (!detail) notFound()
  const { order, customerEmail, audit } = detail

  return (
    <section className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href='/admin/orders'>← Все заказы</Link>
      </div>

      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>Заказ №{order.id}</h1>
          <p className={styles.date}>{formatOrderDate(order.createdAt)}</p>
        </div>
        <div className={styles.badges}>
          <Badge>{paymentStatusLabel(order.status)}</Badge>
          <Badge tone='accent'>{fulfillmentLabel(order.fulfillmentStatus)}</Badge>
        </div>
      </header>

      <div className={styles.grid}>
        <div className={styles.col}>
          <Panel title='Покупатель'>
            <dl className={styles.meta}>
              <Row label='Аккаунт' value={customerEmail ?? '—'} />
              <Row label='Email для доставки' value={order.deliveryEmail ?? '—'} />
              <Row label='Способ' value={order.deliveryMethod ?? '—'} />
            </dl>
          </Panel>

          {order.shipping && (
            <Panel title='Адрес доставки'>
              <dl className={styles.meta}>
                <Row label='Получатель' value={order.shipping.name} />
                <Row label='Телефон' value={order.shipping.phone || '—'} />
                <Row
                  label='Адрес'
                  value={`${order.shipping.city}, ${order.shipping.street}, ${order.shipping.building}, ${order.shipping.postalCode}`}
                />
              </dl>
            </Panel>
          )}

          <Panel title='Состав заказа'>
            <ul className={styles.items}>
              {order.items.map((item) => (
                <li key={item.id} className={styles.item}>
                  <span className={styles.itemName}>
                    {item.name}
                    <span className={styles.itemCat}>
                      {CATEGORY_LABEL[item.category] ?? item.category}
                      {item.boxSetName ? ` · из «${item.boxSetName}»` : ''}
                      {item.quantity > 1 ? ` · ×${item.quantity}` : ''}
                    </span>
                  </span>
                  <span className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className={styles.totals}>
              {order.promoDiscount > 0 && (
                <Row label={`Скидка${order.promoCode ? ` (${order.promoCode})` : ''}`} value={`−${formatPrice(order.promoDiscount)}`} />
              )}
              {order.giftCardTotalApplied > 0 && (
                <Row label='Картами даров' value={`−${formatPrice(order.giftCardTotalApplied)}`} />
              )}
              <Row label='Итого' value={formatPrice(order.total)} strong />
              {order.amountDue !== order.total && (
                <Row label='К оплате' value={formatPrice(order.amountDue)} />
              )}
            </dl>
          </Panel>
        </div>

        <div className={styles.col}>
          <Panel title='Доставка и обработка'>
            <FulfillmentForm
              orderId={order.id}
              current={order.fulfillmentStatus}
              trackingNumber={order.trackingNumber}
              trackingCarrier={order.trackingCarrier}
              adminNote={order.adminNote}
            />
          </Panel>

          <Panel title='История изменений'>
            {audit.length === 0 ? (
              <p className={styles.muted}>Пока нет записей.</p>
            ) : (
              <ul className={styles.timeline}>
                {audit.map((entry) => (
                  <li key={entry.id} className={styles.event}>
                    <span className={styles.eventSummary}>{entry.summary}</span>
                    <span className={styles.eventDate}>{formatOrderDate(entry.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </section>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>{title}</h2>
      {children}
    </section>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={styles.metaRow}>
      <dt className={styles.metaLabel}>{label}</dt>
      <dd className={strong ? styles.metaValueStrong : styles.metaValue}>{value}</dd>
    </div>
  )
}
