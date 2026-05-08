import type { Metadata } from 'next'
import { getBooks, getFeaturedBooks, parseBookFilters } from '@/api/books'
import Slider from '@/components/common/Slider'
import NewProducts from '@/components/book/NewProducts'
import SubscriptionsSection from '@/components/subscriptions/SubscriptionsSection/SubscriptionsSection'
import BoxSetsSection from '@/components/boxSets/BoxSetsSection'
import styles from './page.module.scss'

export const metadata: Metadata = {
  title: 'Чтиво — независимое издательство',
  description: 'Книги, которые меняют взгляд на мир.',
  openGraph: {
    title: 'Чтиво — независимое издательство',
    description: 'Книги, которые меняют взгляд на мир.',
  },
}

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function HomePage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams
  const filters = parseBookFilters(resolvedSearchParams)
  const [catalog, featuredBooks] = await Promise.all([
    getBooks(filters),
    getFeaturedBooks(),
  ])

  const slides = featuredBooks.map((book) => ({
    id: book.id,
    coverUrl: book.coverUrl,
    title: book.name,
    author: book.authorName,
    thesis: book.thesis,
    slug: book.slug,
  }))

  return (
    <div className={styles.page}>
      <Slider items={slides} />
      <NewProducts catalog={catalog} filters={filters} searchParams={resolvedSearchParams} />
      <SubscriptionsSection />
      <BoxSetsSection />
    </div>
  )
}
