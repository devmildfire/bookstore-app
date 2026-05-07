import { getBoxSets } from '@/api/boxSets/getBoxSets'
import BoxSetCard from './BoxSetCard'
import styles from './BoxSetsSection.module.scss'

export default async function BoxSetsSection() {
  const boxSets = await getBoxSets()
  if (boxSets.length === 0) return null

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>Бокс-сеты</h2>
        <div className={styles.grid}>
          {boxSets.map((boxSet) => (
            <BoxSetCard key={boxSet.id} boxSet={boxSet} />
          ))}
        </div>
      </div>
    </section>
  )
}
