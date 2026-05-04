import type { Metadata } from 'next'
import { getBooks } from '@/api/books'
import { getFeaturedBooks } from '@/api/books'
import Slider from '@/components/common/Slider'
import NewProducts from '@/components/book/NewProducts'
import styles from './page.module.scss'

export const metadata: Metadata = {
  title: 'Чтиво — независимое издательство',
  description: 'Книги, которые меняют взгляд на мир.',
  openGraph: {
    title: 'Чтиво — независимое издательство',
    description: 'Книги, которые меняют взгляд на мир.',
  },
}

export default async function HomePage() {
  const [catalog, featuredBooks] = await Promise.all([
    getBooks({
      search: '',
      category: 'all',
      author: '',
      priceFrom: null,
      priceTo: null,
      sort: 'newest',
      page: 1,
    }),
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
      <NewProducts books={catalog.books} />
    </div>
  )
}
