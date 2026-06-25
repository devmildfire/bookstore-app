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
  // 'page': gutter columns + 3/2/1 responsive grid (homepage)
  // 'contained': full-width grid inside a padded container (profile/favorites)
  variant?: Variant
}

// Chunk at max column count (3). CSS grid handles responsive column
// count via `auto-fill` — no JS column measuring needed.
const COLS = 3

function chunk<T>(arr: T[], size: number): T[][] {
  const r: T[][] = []
  for (let i = 0; i < arr.length; i += size) r.push(arr.slice(i, i + size))
  return r
}

export default function BoxSetsGrid({ boxSets, booksMap, variant = 'page' }: Props) {
  const [openId, setOpenId] = useState<number | null>(null)

  return (
    <div className={cn(styles.gridWrap, variant === 'contained' && styles.gridWrapContained)}>
      {chunk(boxSets, COLS).map((row, rowIdx) => {
        const openBoxSet = row.find((bs) => bs.id === openId) ?? null
        return (
          <Fragment key={rowIdx}>
            <div className={cn(styles.cardRow, variant === 'contained' && styles.cardRowContained)}>
              {row.map((boxSet) => (
                <BoxSetCard
                  key={boxSet.id}
                  boxSet={boxSet}
                  isOpen={boxSet.id === openId}
                  onToggle={() => setOpenId((prev) => (prev === boxSet.id ? null : boxSet.id))}
                />
              ))}
            </div>
            {openBoxSet && (
              <div className={styles.expansion}>
                <BoxSetPreview books={booksMap[openBoxSet.id] ?? []} />
              </div>
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
