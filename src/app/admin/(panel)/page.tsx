import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminDashboardStats } from '@/api/admin/dashboard'
import { getAuditLog } from '@/api/admin/audit'
import { formatOrderDate } from '@/lib/orderDisplay'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Сводка' }

export default async function AdminDashboardPage() {
  const [stats, audit] = await Promise.all([getAdminDashboardStats(), getAuditLog(8)])

  const cards = [
    { label: 'Заказы к отправке', value: stats.ordersToShip, href: '/admin/orders?status=paid&fulfillment=processing' },
    { label: 'Черновики книг', value: stats.draftBooks, href: '/admin/books?status=draft' },
    { label: 'Новые заявки', value: stats.newSubmissions, href: '/admin/submissions' },
  ]

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Сводка</h1>
      <p className={styles.lede}>Добро пожаловать в админ-панель Чтива.</p>

      <div className={styles.cards}>
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className={styles.card}>
            <span className={styles.cardLabel}>{c.label}</span>
            <span className={styles.cardValue}>{c.value}</span>
          </Link>
        ))}
      </div>

      <div className={styles.activity}>
        <div className={styles.activityHead}>
          <h2 className={styles.activityTitle}>Последние действия</h2>
          <Link href='/admin/audit' className={styles.activityLink}>
            Весь журнал →
          </Link>
        </div>
        {audit.length === 0 ? (
          <p className={styles.empty}>Пока нет записей.</p>
        ) : (
          <ul className={styles.feed}>
            {audit.map((e) => (
              <li key={e.id} className={styles.event}>
                <span className={styles.eventSummary}>{e.summary}</span>
                <span className={styles.eventMeta}>
                  {e.actorEmail ?? 'система'} · {formatOrderDate(e.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
