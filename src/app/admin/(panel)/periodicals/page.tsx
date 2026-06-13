import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminPeriodicals } from '@/api/admin/periodicals'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import Badge from '@/components/common/Badge'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Периодика' }

export default async function AdminPeriodicalsPage() {
  const periodicals = await getAdminPeriodicals()

  return (
    <section className={styles.page}>
      <AdminPageHeader
        title='Периодика'
        count={`${periodicals.length} всего`}
        createHref='/admin/periodicals/new'
        createLabel='Создать серию'
      />

      {periodicals.length === 0 ? (
        <p className={styles.empty}>Серии не найдены.</p>
      ) : (
        <ul className={styles.list}>
          {periodicals.map((p) => (
            <li key={p.id} className={styles.item}>
              <Link href={`/admin/periodicals/${p.id}`} className={styles.itemLink}>
                <span className={styles.info}>
                  <span className={styles.name}>{p.name}</span>
                  {p.slug && <span className={styles.slug}>{p.slug}</span>}
                </span>
                <Badge tone={p.issueCount > 0 ? 'positive' : 'neutral'}>
                  {p.issueCount} вып.
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
