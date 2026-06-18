'use client'

import BoxSetsGrid from './BoxSetsGrid'
import type { BoxSet, BoxSetBook } from '@/entities/boxSet/client'
import styles from './BoxSetsSection.module.scss'

type Props = {
  boxSets: BoxSet[]
  booksMap: Record<number, BoxSetBook[]>
}

// The visual body of the box-sets section. Split out so it can be dynamically
// imported (ssr:false) by DeferredBoxSets and mounted on scroll — keeping its
// JS chunk, images and DOM out of the initial/LCP window.
export default function BoxSetsBody({ boxSets, booksMap }: Props) {
  // The `.section` wrapper lives HERE (the lazy body), not in DeferredBoxSets — so this
  // module's CSS only ships in the lazy chunk, never the eager render-blocking bundle.
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
