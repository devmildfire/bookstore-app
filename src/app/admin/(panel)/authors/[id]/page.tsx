import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminAuthor } from '@/api/admin/authors'
import { uploadAuthorPhotoAction } from '@/lib/admin/authors/actions'
import ImageUploader from '@/components/admin/ImageUploader'
import { AuthorEditForm, ContactsManager } from '@/components/admin/authors'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Автор' }

type Props = { params: Promise<{ id: string }> }

export default async function AdminAuthorEditPage({ params }: Props) {
  const { id } = await params
  const authorId = Number(id)
  if (!Number.isInteger(authorId) || authorId <= 0) notFound()

  const author = await getAdminAuthor(authorId)
  if (!author) notFound()

  return (
    <section className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href='/admin/authors'>← Все авторы</Link>
      </div>

      <header className={styles.head}>
        <h1 className={styles.title}>{author.name}</h1>
        <Link href={`/authors/${author.id}`} className={styles.viewLink} target='_blank' rel='noopener'>
          Открыть на сайте ↗
        </Link>
      </header>

      <div className={styles.layout}>
        <aside className={styles.side}>
          <h2 className={styles.sideTitle}>Фото</h2>
          <ImageUploader
            initialUrl={author.photoUrl}
            action={uploadAuthorPhotoAction}
            fields={{ authorId: String(author.id) }}
            aspect='square'
            label={`Фото: ${author.name}`}
          />
        </aside>

        <div className={styles.main}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Данные автора</h2>
            <AuthorEditForm author={author} />
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Контакты</h2>
            <ContactsManager authorId={author.id} contacts={author.contacts} />
          </section>
        </div>
      </div>
    </section>
  )
}
