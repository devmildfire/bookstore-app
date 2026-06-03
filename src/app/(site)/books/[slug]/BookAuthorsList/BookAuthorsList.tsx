import Link from 'next/link'
import type { Author } from '@/entities/book/client'
import styles from './BookAuthorsList.module.scss'

type Props = { authors: Author[] }

export const AUTHORS_ANCHOR = 'avtory'

/**
 * Numbered "Авторы" list used on compilation/anthology titles in place of
 * per-author "Об авторе" sections — rendering a full profile block for each
 * of 50+ contributors is impractical, so we list just the names. The list
 * preserves the order delivered by the RPC (Titles_Authors.id ASC), matching
 * the order on chtivo.spb.ru.
 */
export default function BookAuthorsList({ authors }: Props) {
  if (authors.length === 0) return null

  return (
    <section
      id={AUTHORS_ANCHOR}
      className={styles.section}
      aria-labelledby='avtory-title'
    >
      <h2 id='avtory-title' className={styles.sectionTitle}>
        Авторы
      </h2>

      <ol className={styles.list}>
        {authors.map((author) => (
          <li key={author.id} className={styles.item}>
            <Link href={`/authors/${author.id}`} className={styles.itemLink}>
              {author.name}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
