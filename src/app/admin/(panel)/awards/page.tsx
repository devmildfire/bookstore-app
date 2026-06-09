import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getAdminAwards } from '@/api/admin/awards'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import StatusBadge from '@/components/admin/StatusBadge'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Награды' }

export default async function AdminAwardsPage() {
  const awards = await getAdminAwards()

  return (
    <section className={styles.page}>
      <AdminPageHeader
        title='Награды'
        count={`${awards.length} всего`}
        createHref='/admin/awards/new'
        createLabel='Создать награду'
      />

      {awards.length === 0 ? (
        <p className={styles.empty}>Награды не найдены.</p>
      ) : (
        <ul className={styles.list}>
          {awards.map((a) => (
            <li key={a.id} className={styles.item}>
              <Link href={`/admin/awards/${a.id}`} className={styles.itemLink}>
                <span className={styles.badge}>
                  {a.imageUrl ? (
                    <Image src={a.imageUrl} alt='' fill sizes='48px' className={styles.badgeImg} unoptimized />
                  ) : (
                    <span className={styles.badgePlaceholder} aria-hidden />
                  )}
                </span>
                <span className={styles.info}>
                  <span className={styles.name}>{a.title}</span>
                  <span className={styles.slug}>{a.slug}</span>
                </span>
                <span className={styles.usage}>{a.usageCount} кн.</span>
                <StatusBadge tone={a.isActive ? 'positive' : 'neutral'}>
                  {a.isActive ? 'Активна' : 'Скрыта'}
                </StatusBadge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
