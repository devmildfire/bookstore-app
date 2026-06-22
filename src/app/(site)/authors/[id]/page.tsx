import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BookAuthor from '@/app/(site)/books/[slug]/BookAuthor'
import BookCard from '@/components/book/BookCard/BookCard'
import AuthorArticlesCarousel from '@/components/authors/AuthorArticlesCarousel'
import { getAuthor } from '@/api/authors/getAuthor'
import { getAuthorBooks } from '@/api/articles/getAuthorBooks'
import { getMoreArticlesForAuthor } from '@/api/articles/getMoreArticlesForAuthor'
import styles from './page.module.scss'
import { getAbsoluteSiteUrl, socialMeta } from '@/lib/socialCards/cardTypes'

type Params = { id: string }

function parseId(raw: string): number | null {
  const id = Number(raw)
  return Number.isInteger(id) && id > 0 ? id : null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { id } = await params
  const authorId = parseId(id)
  const author = authorId ? await getAuthor(authorId) : null
  const title = author ? `${author.name} — автор` : 'Страница автора'
  const description = author?.bio?.slice(0, 160) ?? undefined
  return {
    title,
    description,
    ...socialMeta({
      kind: 'author',
      target: id,
      type: 'profile',
      url: getAbsoluteSiteUrl(`/authors/${id}`),
      title,
      description,
      imageAlt: author ? `${author.name} — автор Чтиво` : 'Автор Чтиво',
    }),
  }
}

export default async function AuthorPage({ params }: { params: Promise<Params> }) {
  const { id } = await params
  const authorId = parseId(id)
  if (!authorId) notFound()

  const author = await getAuthor(authorId)
  if (!author) notFound()

  // Author's own articles only (excludeId -1 excludes nothing, minCount 0
  // skips the cross-author top-up); the carousel duplicates slides if < 3.
  const [books, articles] = await Promise.all([
    getAuthorBooks(authorId),
    getMoreArticlesForAuthor(authorId, -1, 0),
  ])

  return (
    <div className={styles.page}>
      <BookAuthor author={author} heading='Страница автора' />

      {books.length > 0 && (
        <section className={styles.works}>
          <h2 className={styles.worksHeading}>Издания</h2>
          <div className={styles.worksGrid}>
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}

      <AuthorArticlesCarousel articles={articles} />
    </div>
  )
}
