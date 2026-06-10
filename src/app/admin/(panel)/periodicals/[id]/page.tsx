import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminPeriodical } from '@/api/admin/periodicals'
import { PeriodicalEditForm } from '@/components/admin/periodicals'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Серия' }

type Props = { params: Promise<{ id: string }> }

export default async function AdminPeriodicalEditPage({ params }: Props) {
  const { id } = await params
  const periodicalId = Number(id)
  if (!Number.isInteger(periodicalId) || periodicalId <= 0) notFound()

  const periodical = await getAdminPeriodical(periodicalId)
  if (!periodical) notFound()

  return (
    <section className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href='/admin/periodicals'>← Вся периодика</Link>
      </div>

      <h1 className={styles.title}>{periodical.name}</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Серия</h2>
        <PeriodicalEditForm periodical={periodical} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Выпуски</h2>
        <p className={styles.sectionNote}>
          Выпуски привязываются к серии в карточке книги (раздел «Периодика»). Порядок на странице —
          по номеру тома, от нового к старому.
        </p>
        {periodical.issues.length === 0 ? (
          <p className={styles.sectionNote}>Пока нет выпусков.</p>
        ) : (
          <ul className={styles.issues}>
            {periodical.issues.map((issue) => (
              <li key={issue.id}>
                <Link href={`/admin/books/${issue.id}`} className={styles.issueLink}>
                  <span className={styles.issueVol}>
                    Том №{issue.volumeNumber ?? '—'}
                    {issue.volumeYear ? ` · ${issue.volumeYear}` : ''}
                  </span>
                  <span className={styles.issueName}>{issue.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  )
}
