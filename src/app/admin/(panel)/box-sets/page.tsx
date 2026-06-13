import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getAdminBoxSets } from '@/api/admin/boxSets'
import Badge from '@/components/common/Badge'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Бокс-сеты' }

export default async function AdminBoxSetsPage() {
  const boxSets = await getAdminBoxSets()

  return (
    <section className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>Бокс-сеты</h1>
        <span className={styles.count}>{boxSets.length} всего</span>
        <Link href='/admin/box-sets/new' className={styles.create}>
          + Создать бокс-сет
        </Link>
      </header>

      {boxSets.length === 0 ? (
        <p className={styles.empty}>Бокс-сеты не найдены.</p>
      ) : (
        <ul className={styles.list}>
          {boxSets.map((b) => (
            <li key={b.id} className={styles.item}>
              <Link href={`/admin/box-sets/${b.id}`} className={styles.itemLink}>
                <span className={styles.cover}>
                  {b.imageUrl ? (
                    <Image src={b.imageUrl} alt='' fill sizes='48px' className={styles.coverImg} unoptimized />
                  ) : (
                    <span className={styles.coverPlaceholder} aria-hidden />
                  )}
                </span>
                <span className={styles.info}>
                  <span className={styles.name}>{b.name}</span>
                  <span className={styles.slug}>{b.slug}</span>
                </span>
                <Badge tone={b.isPublished ? 'positive' : 'warning'}>
                  {b.isPublished ? 'Опубл.' : 'Черновик'}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
