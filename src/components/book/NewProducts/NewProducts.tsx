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
  // HomeCatalog fetches two batches' worth of books (filters.limit * 2). Batch 1 renders
  // visible; batch 2 is handed to BooksFeed as the hidden, eager-preloading "ahead" batch so
  // the first "load more" is an instant CSS reveal. Batches 3+ are fetched client-side.
  const batch1 = catalog.books.slice(0, filters.limit)
  const batch2 = catalog.books.slice(filters.limit)

  return (
    <>
      <CatalogControlsRouter
        filters={filters}
        categories={catalog.categories}
        authors={catalog.authors}
        years={catalog.years}
      />

      {batch1.length > 0 ? (
        <BooksFeed
          key={JSON.stringify(filters)}
          filters={filters}
          initialCount={batch1.length}
          prefetchedCount={batch2.length}
          total={catalog.total}
          prefetched={batch2.map((book) => (
            <BookCard key={book.id} book={book} eager />
          ))}
        >
          {batch1.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </BooksFeed>
      ) : (
        <p className={styles.subtitle}>Книги не найдены</p>
      )}
    </>
  )
}
