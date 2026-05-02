import type { Metadata } from 'next'
import BookGrid from '@/components/book/BookGrid'
import FiltersPanel from '@/components/book/FiltersPanel'
import SearchBar from '@/components/book/SearchBar'
import SortingControls from '@/components/book/SortingControls'
import Pagination from '@/components/common/Pagination'
import { getBooks, parseBookFilters } from '@/api/books'
import styles from './page.module.scss'

export const metadata: Metadata = {
  title: 'Каталог книг',
  description: 'Каталог электронных книг с поиском, фильтрами по автору и цене.',
  openGraph: {
    title: 'Каталог книг',
    description: 'Каталог электронных книг с поиском, фильтрами по автору и цене.',
  },
}

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function BooksPage({ searchParams }: Props) {
  const filters = parseBookFilters(await searchParams)
  const catalog = await getBooks(filters)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Каталог книг</h1>
          <p>Найдено: {catalog.total}</p>
        </div>
        <SortingControls value={filters.sort} />
      </header>

      <div className={styles.content}>
        <FiltersPanel filters={filters} categories={catalog.categories} authors={catalog.authors} />

        <div className={styles.results}>
          <SearchBar initialValue={filters.search} />
          <BookGrid books={catalog.books} />
          <Pagination page={catalog.page} totalPages={catalog.totalPages} />
        </div>
      </div>
    </div>
  )
}
