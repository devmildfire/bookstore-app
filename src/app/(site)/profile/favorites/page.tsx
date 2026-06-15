import { getLikedTitlesServer, getLikedBoxSetsServer } from '@/api/likes/getLikesServer'
import { getBoxSetBooksMap } from '@/api/boxSets/getBoxSetBooksMap'
import BookCard from '@/components/book/BookCard'
import BoxSetsGrid from '@/components/boxSets/BoxSetsSection/BoxSetsGrid'
import styles from './page.module.scss'

export default async function ProfileFavoritesPage() {
  // Server-rendered: the user's liked titles + box sets (RLS-scoped to the
  // session) and the box sets' contents are fetched in one server pass, so the
  // page arrives populated with no client round-trip / spinner.
  const [titles, boxSets] = await Promise.all([
    getLikedTitlesServer(),
    getLikedBoxSetsServer(),
  ])
  const booksMap = await getBoxSetBooksMap(boxSets.map((b) => b.id))
  const hasAnything = titles.length > 0 || boxSets.length > 0

  return (
    <section className={styles.page}>
      <h2 className={styles.title}>Избранное</h2>

      {!hasAnything && (
        <p className={styles.empty}>
          Пока ничего нет. Жмите на сердечко рядом с книгой или бокс-сетом,
          чтобы добавить его сюда.
        </p>
      )}

      {titles.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Книги</h3>
          <div className={styles.grid}>
            {titles.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}

      {boxSets.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Бокс-сеты</h3>
          <BoxSetsGrid boxSets={boxSets} booksMap={booksMap} variant='contained' />
        </section>
      )}
    </section>
  )
}
