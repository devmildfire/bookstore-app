'use client'

import { useQuery } from '@tanstack/react-query'
import { allLikesQueryKey, getLikedBoxSets, getLikedTitles } from '@/api/likes'
import BookCard from '@/components/book/BookCard'
import BoxSetsGrid from '@/components/boxSets/BoxSetsSection/BoxSetsGrid'
import styles from './page.module.scss'

export default function ProfileFavoritesPage() {
  const titlesQuery = useQuery({
    queryKey: [...allLikesQueryKey(), 'titles'],
    queryFn: getLikedTitles,
    staleTime: 60 * 1000,
  })
  const boxSetsQuery = useQuery({
    queryKey: [...allLikesQueryKey(), 'box_sets'],
    queryFn: getLikedBoxSets,
    staleTime: 60 * 1000,
  })

  const isLoading = titlesQuery.isLoading || boxSetsQuery.isLoading
  const titles = titlesQuery.data ?? []
  const boxSets = boxSetsQuery.data ?? []
  const hasAnything = titles.length > 0 || boxSets.length > 0

  return (
    <section className={styles.page}>
      <h2 className={styles.title}>Избранное</h2>

      {isLoading && <p className={styles.muted}>Загрузка…</p>}

      {!isLoading && !hasAnything && (
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
          <BoxSetsGrid boxSets={boxSets} />
        </section>
      )}
    </section>
  )
}
