import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminArticle, getAuthorOptions } from '@/api/admin/articles'
import { uploadArticleCoverAction } from '@/lib/admin/articles/actions'
import ImageUploader from '@/components/admin/ImageUploader'
import { ArticleEditForm } from '@/components/admin/articles'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Статья' }

type Props = { params: Promise<{ id: string }> }

export default async function AdminArticleEditPage({ params }: Props) {
  const { id } = await params
  const articleId = Number(id)
  if (!Number.isInteger(articleId) || articleId <= 0) notFound()

  const [article, authorOptions] = await Promise.all([getAdminArticle(articleId), getAuthorOptions()])
  if (!article) notFound()

  return (
    <section className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href='/admin/articles'>← Все статьи</Link>
      </div>
      <h1 className={styles.title}>{article.title}</h1>

      <div className={styles.layout}>
        <aside className={styles.side}>
          <h2 className={styles.sideTitle}>Обложка</h2>
          <ImageUploader
            initialUrl={article.coverUrl}
            action={uploadArticleCoverAction}
            fields={{ articleId: String(article.id) }}
            aspect='cover'
            label={`Обложка: ${article.title}`}
          />
        </aside>
        <div className={styles.main}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Данные</h2>
            <ArticleEditForm article={article} authorOptions={authorOptions} />
          </section>
        </div>
      </div>
    </section>
  )
}
