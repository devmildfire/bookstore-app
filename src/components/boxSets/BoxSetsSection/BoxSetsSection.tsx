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
      </div>
      <BoxSetsGrid boxSets={boxSets} />
    </section>
  )
}
