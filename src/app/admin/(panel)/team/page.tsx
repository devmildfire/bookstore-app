import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getAdminTeam } from '@/api/admin/team'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import Badge from '@/components/common/Badge'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Команда' }

export default async function AdminTeamPage() {
  const team = await getAdminTeam()

  return (
    <section className={styles.page}>
      <AdminPageHeader
        title='Команда'
        count={`${team.length} всего`}
        createHref='/admin/team/new'
        createLabel='Добавить участника'
      />

      {team.length === 0 ? (
        <p className={styles.empty}>Участники не найдены.</p>
      ) : (
        <ul className={styles.list}>
          {team.map((m) => (
            <li key={m.id} className={styles.item}>
              <Link href={`/admin/team/${m.id}`} className={styles.itemLink}>
                <span className={styles.badge}>
                  {m.photoUrl ? (
                    <Image src={m.photoUrl} alt='' fill sizes='48px' className={styles.badgeImg} unoptimized />
                  ) : (
                    <span className={styles.badgePlaceholder} aria-hidden />
                  )}
                </span>
                <span className={styles.info}>
                  <span className={styles.name}>{m.name}</span>
                  <span className={styles.slug}>
                    {m.job}
                    {m.city ? ` · ${m.city}` : ''}
                  </span>
                </span>
                <Badge tone={m.photoUrl ? 'positive' : 'neutral'}>
                  {m.photoUrl ? 'С фото' : 'Без фото'}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
