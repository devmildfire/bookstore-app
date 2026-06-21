import { Fragment } from 'react'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getBook, getSimilarBooks, getBookEditions, getAllBookSlugs } from '@/api/books/getBook'
import { getEditionPhotos } from '@/api/books/getBookPhotos'
import { getPeriodical, getPeriodicalIssueRedirect } from '@/api/periodicals/getPeriodical'
import PeriodicalView from './PeriodicalView'
import BookGrid from '@/components/book/BookGrid'
import BoxSetsSection from '@/components/boxSets/BoxSetsSection'
import BookAuthor from './BookAuthor'
import BookAuthorsList, { AUTHORS_ANCHOR } from './BookAuthorsList'
import BookContext from './BookContext'
import BookCover from './BookCover'
import BookEditionTabs from './BookEditionTabs'
import BookTrailer from './BookTrailer'
import { getAbsoluteSiteUrl, getOpenGraphImages, getTwitterImages } from '@/lib/socialCards/cardTypes'
import styles from './page.module.scss'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  const periodical = await getPeriodical(slug)
  if (periodical) {
    const description = periodical.description?.slice(0, 160) ?? periodical.name
    return {
      title: periodical.name,
      description,
      openGraph: {
        type: 'website',
        title: periodical.name,
        description,
        url: getAbsoluteSiteUrl(`/books/${periodical.slug}`),
        siteName: 'Чтиво',
        locale: 'ru_RU',
        images: getOpenGraphImages('book', periodical.slug, periodical.name),
      },
      twitter: {
        card: 'summary_large_image',
        title: periodical.name,
        description,
        images: getTwitterImages('book', periodical.slug),
      },
    }
  }

  const book = await getBook(slug)

  if (!book) {
    return { title: 'Книга не найдена' }
  }

  return {
    title: book.name,
    description: book.description?.slice(0, 160) ?? `${book.authorName} — ${book.name}`,
    openGraph: {
      type: 'website',
      title: book.name,
      description: book.description?.slice(0, 160),
      url: getAbsoluteSiteUrl(`/books/${book.slug}`),
      siteName: 'Чтиво',
      locale: 'ru_RU',
      images: getOpenGraphImages('book', book.slug, `${book.name} — ${book.authorName}`),
    },
    twitter: {
      card: 'summary_large_image',
      title: book.name,
      description: book.description?.slice(0, 160) ?? `${book.authorName} — ${book.name}`,
      images: getTwitterImages('book', book.slug),
    },
  }
}

// Prebuild every published, non-issue book detail page at build (SSG). New/unlisted
// slugs still render on demand (dynamicParams defaults to true); getAllBookSlugs returns
// [] on a Supabase error, so a build never fails on a transient outage.
export async function generateStaticParams() {
  const slugs = await getAllBookSlugs()
  return slugs.map((slug) => ({ slug }))
}

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params

  // A periodical (e.g. «Могучий Русский Динозавр») renders one shared page with a
  // section per issue; an individual issue slug redirects to its anchor there. These
  // three slug lookups are independent — fire them together instead of in series
  // (cache() dedupes getPeriodical/getBook against generateMetadata, so no extra calls).
  const [periodical, issueRedirect, book] = await Promise.all([
    getPeriodical(slug),
    getPeriodicalIssueRedirect(slug),
    getBook(slug),
  ])

  if (periodical) {
    return <PeriodicalView periodical={periodical} />
  }
  if (issueRedirect) {
    redirect(`/books/${issueRedirect.periodicalSlug}#vol-${issueRedirect.volumeNumber}`)
  }
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
          <Link href='/'>Каталог</Link>
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
