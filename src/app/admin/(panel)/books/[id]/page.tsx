import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminBook, getAdminBookPhotos, getAwardsCatalog } from '@/api/admin/books'
import { uploadBookCoverAction } from '@/lib/admin/books/actions'
import { getBooktrailerUrls } from '@/lib/storage'
import ImageUploader from '@/components/admin/ImageUploader'
import {
  BookEditForm,
  BookPhotosManager,
  ProductsManager,
  BookStatusBar,
  AwardsManager,
  TrailerManager,
} from '@/components/admin/books'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Книга' }

type Props = { params: Promise<{ id: string }> }

export default async function AdminBookEditPage({ params }: Props) {
  const { id } = await params
  const bookId = Number(id)
  if (!Number.isInteger(bookId) || bookId <= 0) notFound()

  const book = await getAdminBook(bookId)
  if (!book) notFound()

  const [photos, awardsCatalog] = await Promise.all([
    book.slug ? getAdminBookPhotos(book.slug) : Promise.resolve([]),
    getAwardsCatalog(),
  ])
  const trailerUrls = book.slug ? getBooktrailerUrls(book.slug, book.trailer.hasPoster) : null

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

      <BookStatusBar bookId={book.id} status={book.status} name={book.name} />

      <div className={styles.layout}>
        <aside className={styles.side}>
          <div className={styles.mediaBlock}>
            <h2 className={styles.sideTitle}>Обложка</h2>
            <ImageUploader
              initialUrl={book.coverUrl}
              action={uploadBookCoverAction}
              fields={{ titleId: String(book.id) }}
              aspect='cover'
              label={`Обложка: ${book.name}`}
            />
          </div>

          <div className={styles.mediaBlock}>
            <h2 className={styles.sideTitle}>Фотографии</h2>
            <p className={styles.sideNote}>Карусель на странице книги</p>
            <BookPhotosManager titleId={book.id} hasSlug={!!book.slug} initialPhotos={photos} />
          </div>
        </aside>

        <div className={styles.main}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Тайтл</h2>
            <BookEditForm book={book} />
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Продукты</h2>
            <p className={styles.sectionNote}>
              Издания этого тайтла. У тайтла может быть по одному продукту каждого типа.
            </p>
            <ProductsManager titleId={book.id} editions={book.editions} />
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Награды</h2>
            <AwardsManager titleId={book.id} attached={book.awards} catalog={awardsCatalog} />
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Трейлер</h2>
            <TrailerManager titleId={book.id} hasSlug={!!book.slug} trailer={book.trailer} urls={trailerUrls} />
          </section>
        </div>
      </div>
    </section>
  )
}
