import type { Metadata } from 'next'
import { getLatestBooks, getFeaturedBooks } from '@/api/books'
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
  const [latestBooks, featuredBooks] = await Promise.all([
    getLatestBooks(12),
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
      <NewProducts books={latestBooks} />
    </div>
  )
}
