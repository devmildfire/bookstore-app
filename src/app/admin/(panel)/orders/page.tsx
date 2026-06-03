import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminOrders } from '@/api/admin/orders'
import { formatPrice } from '@/lib/formatPrice'
import { fulfillmentLabel, formatOrderDate, paymentStatusLabel } from '@/lib/orderDisplay'
import StatusBadge, { type BadgeTone } from '@/components/admin/StatusBadge'
import type { OrderStatus, FulfillmentStatus } from '@/entities/order/client'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Заказы' }

const PAYMENT_TONE: Record<OrderStatus, BadgeTone> = {
  paid: 'positive',
  pending: 'warning',
  failed: 'danger',
  cancelled: 'neutral',
}
const FULFILLMENT_TONE: Record<FulfillmentStatus, BadgeTone> = {
  processing: 'warning',
  shipped: 'accent',
  delivered: 'positive',
  completed: 'positive',
}

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'paid', label: 'Оплачен' },
  { value: 'pending', label: 'Ожидает оплаты' },
  { value: 'failed', label: 'Ошибка оплаты' },
  { value: 'cancelled', label: 'Отменён' },
]
const FULFILLMENT_OPTIONS: { value: FulfillmentStatus; label: string }[] = [
  { value: 'processing', label: 'В обработке' },
  { value: 'shipped', label: 'В пути' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'completed', label: 'Выполнен' },
]

type Props = {
  searchParams: Promise<{ status?: string; fulfillment?: string; q?: string; page?: string }>
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = sp.page ? Math.max(1, Number(sp.page) || 1) : 1
  const { orders, total, pageSize } = await getAdminOrders({
    status: sp.status,
    fulfillment: sp.fulfillment,
    q: sp.q,
    page,
  })

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const buildHref = (overrides: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams()
    const merged = { status: sp.status, fulfillment: sp.fulfillment, q: sp.q, page, ...overrides }
    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined && v !== '' && !(k === 'page' && v === 1)) params.set(k, String(v))
    }
    const qs = params.toString()
    return qs ? `/admin/orders?${qs}` : '/admin/orders'
  }

  return (
    <section className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>Заказы</h1>
        <span className={styles.count}>{total} всего</span>
      </header>

      <form className={styles.filters} method='get'>
        <input
          type='search'
          name='q'
          defaultValue={sp.q ?? ''}
          placeholder='№ заказа или email'
          className={styles.search}
          aria-label='Поиск заказов'
        />
        <select name='status' defaultValue={sp.status ?? ''} className={styles.select} aria-label='Статус оплаты'>
          <option value=''>Оплата: все</option>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          name='fulfillment'
          defaultValue={sp.fulfillment ?? ''}
          className={styles.select}
          aria-label='Статус доставки'
        >
          <option value=''>Доставка: все</option>
          {FULFILLMENT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button type='submit' className={styles.apply}>
          Применить
        </button>
        <Link href='/admin/orders' className={styles.reset}>
          Сбросить
        </Link>
      </form>

      {orders.length === 0 ? (
        <p className={styles.empty}>Заказы не найдены.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>№</th>
                <th>Дата</th>
                <th>Покупатель</th>
                <th>Оплата</th>
                <th>Доставка</th>
                <th className={styles.right}>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className={styles.row}>
                  <td>
                    <Link href={`/admin/orders/${o.id}`} className={styles.idLink}>
                      №{o.id}
                    </Link>
                  </td>
                  <td className={styles.muted}>{formatOrderDate(o.createdAt)}</td>
                  <td className={styles.muted}>{o.deliveryEmail ?? '—'}</td>
                  <td>
                    <StatusBadge tone={PAYMENT_TONE[o.status]}>{paymentStatusLabel(o.status)}</StatusBadge>
                  </td>
                  <td>
                    <StatusBadge tone={FULFILLMENT_TONE[o.fulfillmentStatus]}>
                      {fulfillmentLabel(o.fulfillmentStatus)}
                    </StatusBadge>
                  </td>
                  <td className={styles.right}>{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav className={styles.pager} aria-label='Страницы'>
          {page > 1 && <Link href={buildHref({ page: page - 1 })}>← Назад</Link>}
          <span className={styles.pageInfo}>
            {page} / {totalPages}
          </span>
          {page < totalPages && <Link href={buildHref({ page: page + 1 })}>Вперёд →</Link>}
        </nav>
      )}
    </section>
  )
}
