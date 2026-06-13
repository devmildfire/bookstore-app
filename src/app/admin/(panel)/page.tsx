import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminDashboardStats } from '@/api/admin/dashboard'
import { getAuditLog } from '@/api/admin/audit'
import { formatOrderDate } from '@/lib/orderDisplay'
import { OrdersIcon, BooksIcon, SubmissionsIcon, AuditIcon } from '@/components/common/icons'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Сводка' }

export default async function AdminDashboardPage() {
  const [stats, audit] = await Promise.all([getAdminDashboardStats(), getAuditLog(8)])

  const cards = [
    {
      label: 'Заказы к отправке',
      value: stats.ordersToShip,
      foot: 'оплачены, ждут обработки',
      Icon: OrdersIcon,
      href: '/admin/orders?status=paid&fulfillment=processing',
    },
    {
      label: 'Черновики книг',
      value: stats.draftBooks,
      foot: 'не опубликованы',
      Icon: BooksIcon,
      href: '/admin/books?status=draft',
    },
    {
      label: 'Новые заявки',
      value: stats.newSubmissions,
      foot: 'на рассмотрении',
      Icon: SubmissionsIcon,
      href: '/admin/submissions',
    },
  ]

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Сводка</h1>
      <p className={styles.lede}>Добро пожаловать в админ-панель Чтива.</p>

      <div className={styles.cards}>
        {cards.map(({ label, value, foot, Icon, href }) => (
          <Link key={label} href={href} className={styles.card}>
            <span className={styles.cardLabel}>{label}</span>
            <span className={styles.cardValue}>{value}</span>
            <span className={styles.cardFoot}>
              <Icon className={styles.cardFootIcon} />
              {foot}
            </span>
          </Link>
        ))}
      </div>

      <section className={styles.activity}>
        <div className={styles.activityHead}>
          <h2 className={styles.activityTitle}>
            <AuditIcon className={styles.activityTitleIcon} />
            Последние действия
          </h2>
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
                <span className={styles.eventDot} aria-hidden />
                <span className={styles.eventSummary}>{e.summary}</span>
                <span className={styles.eventMeta}>
                  {e.actorEmail ?? 'система'} · {formatOrderDate(e.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  )
}
