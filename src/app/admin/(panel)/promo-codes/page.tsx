import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminPromoCodes } from '@/api/admin/promoCodes'
import { formatOrderDate } from '@/lib/orderDisplay'
import StatusBadge from '@/components/admin/StatusBadge'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Промокоды' }

export default async function AdminPromoCodesPage() {
  const codes = await getAdminPromoCodes()

  return (
    <section className={styles.page}>
      <AdminPageHeader
        title='Промокоды'
        count={`${codes.length} всего`}
        createHref='/admin/promo-codes/new'
        createLabel='Создать промокод'
      />

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
