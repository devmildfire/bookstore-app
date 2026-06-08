import Link from 'next/link'
import BookGrid from '@/components/book/BookGrid'
import { CatalogControlsRouter } from '@/components/book/CatalogControls'
import type { BookCatalog, BookFilters } from '@/entities/book/client'
import styles from './NewProducts.module.scss'

type Props = {
  catalog: BookCatalog
  filters: BookFilters
  searchParams: Record<string, string | string[] | undefined>
}

const BOOKS_LOAD_MORE_INCREMENT = 12

export default function NewProducts({ catalog, filters, searchParams }: Props) {
  const books = catalog.books
  const hasMoreBooks = books.length < catalog.total
  const loadMoreHref = getLoadMoreHref(searchParams, catalog.pageSize + BOOKS_LOAD_MORE_INCREMENT)

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>ИЗДАНИЯ</h2>
      <CatalogControlsRouter
        filters={filters}
        categories={catalog.categories}
        authors={catalog.authors}
        years={catalog.years}
      />

      { books.length > 0
        ? <BookGrid books={books} />
        : <p className={styles.subtitle}>Книги не найдены</p> }

      {hasMoreBooks && (
        <div className={styles.buttonContainer}>
          <Link href={loadMoreHref} className={styles.button} scroll={false}>
            Загрузить больше
          </Link>
        </div>
      )}
    </section>
  )
}

function getLoadMoreHref(searchParams: Props['searchParams'], nextLimit: number): string {
  const params = new URLSearchParams()

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value === undefined) return

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item))
    } else {
      params.set(key, value)
    }
  })

  params.set('limit', String(nextLimit))
  params.delete('page')

  const serialized = params.toString()
  return serialized ? `/?${serialized}` : '/'
}
