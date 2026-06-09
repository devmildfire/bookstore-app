import { Fragment } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getBook, getSimilarBooks, getEditionPhotos, getBookEditions } from '@/api/books'
import BookGrid from '@/components/book/BookGrid'
import BoxSetsSection from '@/components/boxSets/BoxSetsSection'
import BookAuthor from './BookAuthor'
import BookAuthorsList, { AUTHORS_ANCHOR } from './BookAuthorsList'
import BookContext from './BookContext'
import BookCover from './BookCover'
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

  const [similarBooks, editionPhotos, bookEditions] = await Promise.all([
    getSimilarBooks(book.titleId),
    getEditionPhotos(slug),
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

          <BookCover
            coverUrl={book.coverUrl}
            coverBlurDataUrl={book.coverBlurDataUrl}
            bookName={book.name}
            titleId={book.titleId}
          />

          <div className={styles.info}>
            <h1 className={styles.title}>{book.name}</h1>
            {book.isCompilation ? (
              <a href={`#${AUTHORS_ANCHOR}`} className={styles.authorsAnchor}>
                Авторы
              </a>
            ) : book.authors.length > 0 ? (
              <p className={styles.author}>
                {[...book.authors]
                  .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
                  .map((author, i) => (
                    <Fragment key={author.id}>
                      {i > 0 && ', '}
                      <Link href={`/authors/${author.id}`} className={styles.authorLink}>
                        {author.name}
                      </Link>
                    </Fragment>
                  ))}
              </p>
            ) : (
              <p className={styles.author}>{book.authorName}</p>
            )}

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
                        unoptimized
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

      <BookEditionTabs books={bookEditions} editionPhotos={editionPhotos} bookName={book.name} />

      {book.booktrailer && <BookTrailer trailer={book.booktrailer} bookName={book.name} />}

      {book.isCompilation ? (
        <BookAuthorsList authors={book.authors} />
      ) : (
        book.authors
          .filter((a) => a.bio || a.photoUrl || a.contacts.length > 0)
          .map((author) => (
            <BookAuthor key={author.id} author={author} />
          ))
      )}

      <BookContext contexts={book.contexts} />

      <BoxSetsSection titleId={book.titleId} />

      {similarBooks.length > 0 && (
        <section className={styles.similar}>
          <h2 className={styles.similarTitle}>ПОЗНАЙТЕ ТАКЖЕ</h2>
          <BookGrid books={similarBooks} center />
        </section>
      )}

    </article>
  )
}
