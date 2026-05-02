import BookCard from '@/components/book/BookCard'
import type { Book } from '@/entities/book/client'
import styles from './BookGrid.module.scss'

type Props = {
  books: Book[]
}

export default function BookGrid({ books }: Props) {
  if (books.length === 0) {
    return (
      <section className={styles.empty} aria-live='polite'>
        <h2>Книги не найдены</h2>
        <p>Измените фильтры или поисковый запрос.</p>
      </section>
    )
  }

  return (
    <section className={styles.grid} aria-label='Список книг'>
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </section>
  )
}
