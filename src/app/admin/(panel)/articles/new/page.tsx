import type { Metadata } from 'next'
import Link from 'next/link'
import { getAuthorOptions } from '@/api/admin/articles'
import { ArticleCreateForm } from '@/components/admin/articles'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Новая статья' }

export default async function AdminArticleCreatePage() {
  const authorOptions = await getAuthorOptions()
  return (
    <section className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href='/admin/articles'>← Все статьи</Link>
      </div>
      <h1 className={styles.title}>Новая статья</h1>
      <ArticleCreateForm authorOptions={authorOptions} />
    </section>
  )
}
