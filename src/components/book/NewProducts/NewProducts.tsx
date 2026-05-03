'use client'

import Link from 'next/link'
import BookCard from '@/components/book/BookCard'
import type { Book } from '@/entities/book/client'
import styles from './NewProducts.module.scss'

type Props = {
  books: Book[]
}

export default function NewProducts({ books }: Props) {
  if (!books || books.length === 0) return null

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>НОВИНКИ</h2>
      <div className={styles.grid}>
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
      <div className={styles.buttonContainer}>
        <Link href="/books">
          <button type="button" className={styles.button}>
            Перейти в книжную лавку
          </button>
        </Link>
      </div>
    </section>
  )
}
