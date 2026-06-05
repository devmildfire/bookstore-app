import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminArticles } from '@/api/admin/articles'
import { AdminList, AdminRow } from '@/components/admin/AdminList'
import { formatOrderDate } from '@/lib/orderDisplay'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Статьи' }

export default async function AdminArticlesPage() {
  const articles = await getAdminArticles()

  return (
    <section className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>Статьи</h1>
        <span className={styles.count}>{articles.length} всего</span>
        <Link href='/admin/articles/new' className={styles.create}>
          + Создать статью
        </Link>
      </header>
      <p className={styles.note}>Статьи журнала «Динозавр» — то, что показывается на /dino-magazine.</p>

      {articles.length === 0 ? (
        <p className={styles.empty}>Статей нет.</p>
      ) : (
        <AdminList>
          {articles.map((a) => (
            <AdminRow
              key={a.id}
              href={`/admin/articles/${a.id}`}
              coverUrl={a.coverUrl}
              coverAlt={a.title}
              name={a.title}
              sub={`${a.authorName ?? '—'} · ${formatOrderDate(a.publishedAt)}`}
            />
          ))}
        </AdminList>
      )}
    </section>
  )
}
