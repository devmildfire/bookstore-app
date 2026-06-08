import cn from 'classnames'
import BookCard from '@/components/book/BookCard'
import type { Book } from '@/entities/book/client'
import styles from './BookGrid.module.scss'

type Props = {
  books: Book[]
  /**
   * Center a partial row instead of stretching it edge-to-edge. Use for short
   * related-book strips (e.g. "Познайте также") where 1–2 cards would otherwise
   * left-align in wide tracks. The full catalog/homepage leaves this off.
   */
  center?: boolean
  className?: string
}

// Shared book-card grid used by the catalog/homepage and the related-books
// strip. One implementation, one set of breakpoints — `center` is the only knob.
// Callers handle their own empty state (they vary), so an empty list renders nothing.
export default function BookGrid({ books, center = false, className }: Props) {
  if (books.length === 0) return null

  return (
    <div className={cn(styles.grid, center && styles.center, className)}>
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  )
}
