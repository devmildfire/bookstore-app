import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getBook, getRelatedBooks, getBookPhotoUrls, getBookEditions } from '@/api/books'
import BookCard from '@/components/book/BookCard'
import BookCoverSlider from './BookCoverSlider'
import BookEditionTabs from './BookEditionTabs'
import BookTrailer from './BookTrailer'
import styles from './page.module.scss'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const book = await getBook(slug)

  if (!book) {
    return { title: 'Книга не найдена' }
  }

  return {
    title: book.name,
    description: book.description?.slice(0, 160) ?? `${book.authorName} — ${book.name}`,
    openGraph: {
      title: book.name,
      description: book.description?.slice(0, 160),
      images: book.coverUrl ? [{ url: book.coverUrl }] : [],
    },
  }
}

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params
  const book = await getBook(slug)

  if (!book) {
    notFound()
  }

  const [relatedBooks, bookPhotos, bookEditions] = await Promise.all([
    getRelatedBooks(book),
    getBookPhotoUrls(slug),
    getBookEditions(slug),
  ])

  const bookMeta = [
    book.year,
    book.litForm,
    book.ageRestriction != null ? `${book.ageRestriction}+` : null,
  ]
    .filter(Boolean)
    .join(' | ')

  return (
    <article className={styles.page}>

      <section className={styles.nav}>
        <nav className={styles.breadcrumbs} aria-label='Breadcrumb'>
          <Link href='/books'>Каталог</Link>
          <span className={styles.separator} aria-hidden='true'>/</span>
          <span aria-current='page'>{book.name}</span>
        </nav>
      </section>

      <section className={styles.main}>
        <div className={styles.coverInfo}>

          <BookCoverSlider
            photos={bookPhotos}
            coverUrl={book.coverUrl}
            bookName={book.name}
          />

          <div className={styles.info}>
            <h1 className={styles.title}>{book.name}</h1>
            <p className={styles.author}>{book.authorName}</p>

            {bookMeta && (
              <p className={styles.bookMeta}>{bookMeta}</p>
            )}

            {book.thesis && (
              <p className={styles.thesis}>{book.thesis}</p>
            )}

            {book.description && (
              <p className={styles.description}>{book.description}</p>
            )}

            {book.awards.length > 0 && (
              <ul className={styles.awardsList} aria-label='Награды'>
                {book.awards.map((award) => (
                  <li key={award.id} className={styles.awardItem}>
                    {award.image ? (
                      <Image
                        src={award.image}
                        alt={award.title}
                        width={131}
                        height={120}
                        className={styles.awardImage}
                      />
                    ) : (
                      <span className={styles.awardTitle}>{award.title}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </section>

      <BookEditionTabs books={bookEditions} printBookPhotos={bookPhotos} bookName={book.name} />

      {book.booktrailer && <BookTrailer trailer={book.booktrailer} bookName={book.name} />}

      {relatedBooks.length > 0 && (
        <section className={styles.related}>
          <h2 className={styles.relatedTitle}>Похожие книги</h2>
          <div className={styles.relatedGrid}>
            {relatedBooks.map((related) => (
              <BookCard key={related.id} book={related} />
            ))}
          </div>
        </section>
      )}

    </article>
  )
}
