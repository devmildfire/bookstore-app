'use client'

import { useState, Fragment } from 'react'
import cn from 'classnames'
import BoxSetCard from './BoxSetCard'
import BoxSetPreview from './BoxSetPreview'
import type { BoxSet, BoxSetBook } from '@/entities/boxSet/client'
import styles from './BoxSetsSection.module.scss'

type Variant = 'page' | 'contained'

type Props = {
  boxSets: BoxSet[]
  booksMap: Record<number, BoxSetBook[]>
  // 'page': gutter padding + 3/2/1 responsive grid (homepage)
  // 'contained': full-width grid inside a padded container (profile/favorites)
  variant?: Variant
}

// Flat grid: cards and expansions are direct children of a single CSS grid.
// grid-auto-flow: row dense backfills gaps above full-width expansions with
// the next card, so the expansion always sits below the entire row of the
// clicked card — correct at every breakpoint (3/2/1 cols). No JS chunking.
export default function BoxSetsGrid({ boxSets, booksMap, variant = 'page' }: Props) {
  const [openId, setOpenId] = useState<number | null>(null)

  return (
    <div className={cn(styles.gridWrap, variant === 'contained' && styles.gridWrapContained)}>
      {boxSets.map((boxSet) => (
        <Fragment key={boxSet.id}>
          <BoxSetCard
            boxSet={boxSet}
            isOpen={boxSet.id === openId}
            onToggle={() => setOpenId((prev) => (prev === boxSet.id ? null : boxSet.id))}
          />
          {boxSet.id === openId && (
            <div className={styles.expansion}>
              <BoxSetPreview books={booksMap[boxSet.id] ?? []} />
            </div>
          )}
        </Fragment>
      ))}
    </div>
  )
}
