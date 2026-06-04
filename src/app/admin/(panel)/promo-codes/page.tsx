import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminPromoCodes } from '@/api/admin/promoCodes'
import { formatOrderDate } from '@/lib/orderDisplay'
import StatusBadge from '@/components/admin/StatusBadge'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Промокоды' }

export default async function AdminPromoCodesPage() {
  const codes = await getAdminPromoCodes()

  return (
    <section className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>Промокоды</h1>
        <span className={styles.count}>{codes.length} всего</span>
        <Link href='/admin/promo-codes/new' className={styles.create}>
          + Создать промокод
        </Link>
      </header>

      {codes.length === 0 ? (
        <p className={styles.empty}>Промокоды не найдены.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Код</th>
                <th>Тип</th>
                <th>Скидка</th>
                <th>Период</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id} className={styles.row}>
                  <td>
                    <Link href={`/admin/promo-codes/${c.id}`} className={styles.codeLink}>
                      {c.code}
                    </Link>
                  </td>
                  <td className={styles.muted}>{c.kind === 'cart' ? 'Корзина' : 'Товар'}</td>
                  <td>{c.discountPct}%</td>
                  <td className={styles.muted}>
                    {formatOrderDate(c.startsAt)} — {formatOrderDate(c.endsAt)}
                  </td>
                  <td>
                    <StatusBadge tone={c.isActive ? 'positive' : 'neutral'}>
                      {c.isActive ? 'Активен' : 'Неактивен'}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
