import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getAdminPartners } from '@/api/admin/partners'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import Badge from '@/components/common/Badge'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Партнёры' }

export default async function AdminPartnersPage() {
  const partners = await getAdminPartners()

  return (
    <section className={styles.page}>
      <AdminPageHeader
        title='Партнёры'
        count={`${partners.length} всего`}
        createHref='/admin/partners/new'
        createLabel='Добавить партнёра'
      />

      {partners.length === 0 ? (
        <p className={styles.empty}>Партнёры не найдены.</p>
      ) : (
        <ul className={styles.list}>
          {partners.map((p) => (
            <li key={p.id} className={styles.item}>
              <Link href={`/admin/partners/${p.id}`} className={styles.itemLink}>
                <span className={styles.badge}>
                  {p.logoUrl ? (
                    <Image src={p.logoUrl} alt='' fill sizes='48px' className={styles.badgeImg} unoptimized />
                  ) : (
                    <span className={styles.badgePlaceholder} aria-hidden />
                  )}
                </span>
                <span className={styles.info}>
                  <span className={styles.name}>{p.name}</span>
                  {p.websiteUrl && <span className={styles.slug}>{p.websiteUrl}</span>}
                </span>
                <Badge tone={p.logoUrl ? 'positive' : 'neutral'}>
                  {p.logoUrl ? 'С логотипом' : 'Без логотипа'}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
