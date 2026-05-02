import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getBook, getRelatedBooks } from '@/api/books'
import Badge from '@/components/common/Badge'
import BookCard from '@/components/book/BookCard'
import AddToCartButton from './AddToCartButton'
import styles from './page.module.scss'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const book = await getBook(slug)

  if (!book) {
    return { title: 'Книга не найдена' }
  }

  return {
    title: book.name,
    description: book.description?.slice(0, 160) ?? `${book.authorName} — ${book.name}`,
    openGraph: {
      title: book.name,
      description: book.description?.slice(0, 160),
      images: book.coverUrl ? [{ url: book.coverUrl }] : [],
    },
  }
}

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params
  const book = await getBook(slug)

  if (!book) {
    notFound()
  }

  const relatedBooks = await getRelatedBooks(book)

  const priceFormatted = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(book.price)

  return (
    <article className={styles.page}>
      <nav className={styles.breadcrumbs} aria-label='Breadcrumb'>
        <Link href='/books'>Каталог</Link>
        <span className={styles.separator} aria-hidden='true'>/</span>
        <span aria-current='page'>{book.name}</span>
      </nav>

      <div className={styles.main}>
        <div className={styles.coverSection}>
          <div className={styles.coverWrapper}>
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={`Обложка книги: ${book.name}`}
                fill
                sizes='(max-width: 767px) 100vw, (max-width: 1200px) 40vw, 400px'
                className={styles.coverImage}
                priority
              />
            ) : (
              <div className={styles.coverPlaceholder} aria-hidden />
            )}
          </div>
        </div>

        <div className={styles.infoSection}>
          <Badge variant='default' className={styles.category}>
            {book.category}
          </Badge>

          <h1 className={styles.title}>{book.name}</h1>

          <p className={styles.author}>{book.authorName}</p>

          {book.description && (
            <p className={styles.description}>{book.description}</p>
          )}

          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Цена</span>
              <span className={styles.price}>{priceFormatted}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Наличие</span>
              <Badge variant={book.inStock ? 'success' : 'danger'}>
                {book.inStock ? 'В наличии' : 'Нет в наличии'}
              </Badge>
            </div>
          </div>

          <AddToCartButton bookId={book.id} inStock={book.inStock} bookName={book.name} />
        </div>
      </div>

      {relatedBooks.length > 0 && (
        <section className={styles.related}>
          <h2 className={styles.relatedTitle}>Похожие книги</h2>
          <div className={styles.relatedGrid}>
            {relatedBooks.map((related) => (
              <BookCard key={related.id} book={related} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
