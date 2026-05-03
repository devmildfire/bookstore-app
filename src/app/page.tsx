import type { Metadata } from 'next'
import { getBooks } from '@/api/books'
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
  const catalog = await getBooks({
    search: '',
    category: 'all',
    author: '',
    priceFrom: null,
    priceTo: null,
    sort: 'newest',
    page: 1,
  })

  const sliderItems = catalog.books.map((book) => ({
    id: book.id,
    banner: book.coverUrl ?? '',
    title: book.name,
  }))

  return (
    <div className={styles.page}>
      <Slider items={sliderItems} />
      <NewProducts books={catalog.books} />
    </div>
  )
}
