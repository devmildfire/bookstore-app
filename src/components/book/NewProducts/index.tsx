import BookCard from '@/components/book/BookCard'
import BooksFeed from '@/components/book/BooksFeed'
import { CatalogControlsRouter } from '@/components/book/CatalogControls'
import type { BookCatalog, BookFilters } from '@/entities/book/client'
import styles from './NewProducts.module.scss'

type Props = {
  catalog: BookCatalog
  filters: BookFilters
}

// The catalog body (filter bar + grid). The ИЗДАНИЯ heading + section wrapper live in DeferredCatalog
// (rendered eagerly + permanently there, so the heading never re-mounts/blinks). This is the heavy
// part that's deferred to interaction.
export default function NewProducts({ catalog, filters }: Props) {
  const books = catalog.books

  return (
    <>
      <CatalogControlsRouter
        filters={filters}
        categories={catalog.categories}
        authors={catalog.authors}
        years={catalog.years}
      />

      {books.length > 0 ? (
        // First page = server-rendered BookCards passed as children. BooksFeed appends later
        // pages client-side with anticipatory prefetch — instant "load more", no navigation,
        // no whole-page reload. Keyed by filters so a filter/sort change remounts + resets it.
        <BooksFeed
          key={JSON.stringify(filters)}
          filters={filters}
          initialCount={books.length}
          total={catalog.total}
        >
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </BooksFeed>
      ) : (
        <p className={styles.subtitle}>Книги не найдены</p>
      )}
    </>
  )
}
