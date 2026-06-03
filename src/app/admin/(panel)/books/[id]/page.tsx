import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminBook } from '@/api/admin/books'
import { uploadBookCoverAction } from '@/lib/admin/books/actions'
import ImageUploader from '@/components/admin/ImageUploader'
import { BookEditForm } from '@/components/admin/books'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Книга' }

type Props = { params: Promise<{ id: string }> }

export default async function AdminBookEditPage({ params }: Props) {
  const { id } = await params
  const bookId = Number(id)
  if (!Number.isInteger(bookId) || bookId <= 0) notFound()

  const book = await getAdminBook(bookId)
  if (!book) notFound()

  return (
    <section className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href='/admin/books'>← Все книги</Link>
      </div>

      <header className={styles.head}>
        <h1 className={styles.title}>{book.name}</h1>
        {book.slug && (
          <Link href={`/books/${book.slug}`} className={styles.viewLink} target='_blank' rel='noopener'>
            Открыть на сайте ↗
          </Link>
        )}
      </header>

      {book.authors.length > 0 && (
        <p className={styles.authors}>Авторы: {book.authors.map((a) => a.name).join(', ')}</p>
      )}

      <div className={styles.layout}>
        <aside className={styles.side}>
          <h2 className={styles.sideTitle}>Обложка</h2>
          <ImageUploader
            initialUrl={book.coverUrl}
            action={uploadBookCoverAction}
            fields={{ titleId: String(book.id) }}
            aspect='cover'
            label={`Обложка: ${book.name}`}
          />
        </aside>

        <div className={styles.main}>
          <BookEditForm book={book} />
        </div>
      </div>
    </section>
  )
}
