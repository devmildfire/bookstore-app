import BookCard from '@/components/book/BookCard'
import type { Book } from '@/entities/book/client'
import styles from './AuthorBooksRow.module.scss'

type Props = {
  books: Book[]
}

export default function AuthorBooksRow({ books }: Props) {
  if (books.length === 0) return null

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Книги автора</h2>
      <div className={styles.row}>
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  )
}
