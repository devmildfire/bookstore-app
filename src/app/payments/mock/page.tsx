import { notFound } from 'next/navigation'
import { isMockProvider, getPaymentConfig } from '@/lib/payments/config'
import { createAdminClient } from '@/lib/supabase/server'
import { formatOutSum } from '@/lib/payments/robokassa/signature'
import styles from './page.module.scss'

// Interactive stand-in for the Robokassa hosted payment form. Dev-only (404 in
// production). Shows the amount/description and lets you drive every outcome —
// pay, simulated decline, or cancel — each posting to the mock /pay endpoint
// which behaves exactly like Robokassa (fires our ResultURL, then redirects to
// Success/Fail). The order amount is read from the DB, never trusted from the
// client.

export const dynamic = 'force-dynamic'

export default async function MockGatewayPage({
  searchParams,
}: {
  searchParams: Promise<{ invId?: string }>
}) {
  if (!isMockProvider()) notFound()

  const { invId } = await searchParams
  const id = Number(invId)
  if (!Number.isInteger(id) || id <= 0) notFound()

  const cfg = getPaymentConfig()
  const supabase = createAdminClient()

  const { data: order } = await supabase
    .from('Orders')
    .select('amount_due, status, recurring')
    .eq('id', id)
    .single()

  if (!order) notFound()

  const { data: items } = await supabase
    .from('OrderItems')
    .select('name, quantity')
    .eq('order_id', id)

  const description =
    items && items.length > 0
      ? items.map((i) => i.name).slice(0, 3).join(', ') + (items.length > 3 ? '…' : '')
      : `Заказ №${id}`

  const outSum = formatOutSum(order.amount_due)
  const alreadySettled = order.status !== 'pending'

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>R</span>
          Robokassa
          <span className={styles.sandbox}>Тестовый шлюз</span>
        </div>

        <p className={styles.merchant}>{cfg.merchantLogin}</p>
        <p className={styles.desc}>{description}</p>

        <div className={styles.amountRow}>
          <span>К оплате</span>
          <span className={styles.amount}>{outSum}&nbsp;₽</span>
        </div>
        <p className={styles.invoice}>
          Счёт №{id}
          {order.recurring ? ' · регулярный платёж' : ''}
        </p>

        {alreadySettled ? (
          <p className={styles.settled}>
            Этот счёт уже обработан (статус: {order.status}).
          </p>
        ) : (
          <div className={styles.actions}>
            <form action='/api/payments/mock/pay' method='post'>
              <input type='hidden' name='invId' value={id} />
              <input type='hidden' name='action' value='pay' />
              <button type='submit' className={styles.payBtn}>
                Оплатить {outSum} ₽
              </button>
            </form>

            <form action='/api/payments/mock/pay' method='post'>
              <input type='hidden' name='invId' value={id} />
              <input type='hidden' name='action' value='decline' />
              <button type='submit' className={styles.secondaryBtn}>
                Симулировать отказ банка
              </button>
            </form>

            <form action='/api/payments/mock/pay' method='post'>
              <input type='hidden' name='invId' value={id} />
              <input type='hidden' name='action' value='fail' />
              <button type='submit' className={styles.cancelBtn}>
                Отменить
              </button>
            </form>
          </div>
        )}

        <p className={styles.note}>
          Платёжный шлюз-заглушка. В продакшене эта страница — настоящая форма
          Robokassa; обработчики и подписи не меняются.
        </p>
      </div>
    </main>
  )
}
