import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getFeaturedBooks } from '@/api/books'
import Slider from '@/components/common/Slider'
import HomeCatalog from './HomeCatalog'
import CatalogSectionSkeleton from './CatalogSectionSkeleton'
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

// Does NOT await searchParams — that read is isolated in <HomeCatalog> behind <Suspense>,
// so the hero (featured) + subscriptions + box-sets stream immediately and the filtered
// catalog grid streams in behind the skeleton. The hero only needs the anon featured-books
// query. (Prerequisite for the home route going static/PPR once cacheComponents is on.)
export default async function HomePage({ searchParams }: Props) {
  const featuredBooks = await getFeaturedBooks()

  const slides = featuredBooks.map((book) => ({
    id: book.id,
    coverUrl: book.coverUrl,
    coverBlurDataUrl: book.coverBlurDataUrl,
    title: book.name,
    author: book.authorName,
    thesis: book.thesis,
    slug: book.slug,
  }))

  return (
    <div className={styles.page}>
      <Slider items={slides} />
      <Suspense fallback={<CatalogSectionSkeleton />}>
        <HomeCatalog searchParams={searchParams} />
      </Suspense>
      <SubscriptionsSection />
      <BoxSetsSection />
    </div>
  )
}
