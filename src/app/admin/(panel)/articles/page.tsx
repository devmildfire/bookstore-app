import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getAdminArticles } from '@/api/admin/articles'
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
        <ul className={styles.list}>
          {articles.map((a) => (
            <li key={a.id} className={styles.item}>
              <Link href={`/admin/articles/${a.id}`} className={styles.itemLink}>
                <span className={styles.cover}>
                  {a.coverUrl ? (
                    <Image src={a.coverUrl} alt='' fill sizes='56px' className={styles.coverImg} unoptimized />
                  ) : (
                    <span className={styles.coverPlaceholder} aria-hidden />
                  )}
                </span>
                <span className={styles.info}>
                  <span className={styles.name}>{a.title}</span>
                  <span className={styles.meta}>
                    {a.authorName ?? '—'} · {formatOrderDate(a.publishedAt)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
