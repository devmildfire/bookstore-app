import { getBoxSets, getBoxSetsByTitleId } from '@/api/boxSets/getBoxSets'
import { getBoxSetBooksMap } from '@/api/boxSets/getBoxSetBooksMap'
import BoxSetsGrid from './BoxSetsGrid'
import styles from './BoxSetsSection.module.scss'

type Props = {
  // When supplied, the section renders only the box sets that contain this
  // title — used on the book detail page so each book lists the sets it
  // belongs to. Omit on the main page to list every active set.
  titleId?: number
}

export default async function BoxSetsSection({ titleId }: Props = {}) {
  const boxSets = titleId !== undefined ? await getBoxSetsByTitleId(titleId) : await getBoxSets()
  if (boxSets.length === 0) return null

  const booksMap = await getBoxSetBooksMap(boxSets.map((b) => b.id))

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>Бокс-сеты</h2>
        <p className={styles.subtitle}>Когда одной книги мало, а останавливаться жалко — бокс-сет как раз для таких случаев. Несколько томов, один мир, и никаких мучительных ожиданий между частями.</p>
      </div>
      {/* BoxSetsGrid sits outside .inner so its expansion panel can span the full section width
          via a 3-column outer grid (side columns = padding) without causing overflow */}
      <BoxSetsGrid boxSets={boxSets} booksMap={booksMap} />
    </section>
  )
}
