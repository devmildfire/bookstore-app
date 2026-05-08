import { getBoxSets } from '@/api/boxSets/getBoxSets'
import BoxSetsGrid from './BoxSetsGrid'
import styles from './BoxSetsSection.module.scss'

export default async function BoxSetsSection() {
  const boxSets = await getBoxSets()
  if (boxSets.length === 0) return null

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>Бокс-сеты</h2>
        <p className={styles.subtitle}>Когда одной книги мало, а останавливаться жалко — бокс-сет как раз для таких случаев. Несколько томов, один мир, и никаких мучительных ожиданий между частями.</p>
      </div>
      {/* BoxSetsGrid sits outside .inner so its expansion panel can span the full section width
          via a 3-column outer grid (side columns = padding) without causing overflow */}
      <BoxSetsGrid boxSets={boxSets} />
    </section>
  )
}
