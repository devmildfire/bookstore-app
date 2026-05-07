'use client'

import { useState, useEffect, Fragment } from 'react'
import BoxSetCard from './BoxSetCard'
import BoxSetPreview from './BoxSetPreview'
import type { BoxSet } from '@/entities/boxSet/client'
import styles from './BoxSetsSection.module.scss'

type Props = {
  boxSets: BoxSet[]
}

function getColumns(): number {
  if (window.matchMedia('(max-width: 532px)').matches) return 1
  if (window.matchMedia('(max-width: 1200px)').matches) return 2
  return 3
}

export default function BoxSetsGrid({ boxSets }: Props) {
  const [openId, setOpenId] = useState<number | null>(null)
  const [columns, setColumns] = useState(3)

  useEffect(() => {
    function update() { setColumns(getColumns()) }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  function handleToggle(id: number) {
    setOpenId((prev) => (prev === id ? null : id))
  }

  const rows: BoxSet[][] = []
  for (let i = 0; i < boxSets.length; i += columns) {
    rows.push(boxSets.slice(i, i + columns))
  }

  return (
    <div className={styles.gridWrap}>
      {rows.map((row, rowIdx) => {
        const openBoxSet = row.find((bs) => bs.id === openId) ?? null
        return (
          <Fragment key={rowIdx}>
            {/* center column — cards respect page padding */}
            <div className={styles.cardRow}>
              {row.map((boxSet) => (
                <BoxSetCard
                  key={boxSet.id}
                  boxSet={boxSet}
                  isOpen={boxSet.id === openId}
                  onToggle={() => handleToggle(boxSet.id)}
                />
              ))}
            </div>
            {/* spans all 3 outer columns = full wrapper width, zero overflow */}
            {openBoxSet && (
              <div className={styles.expansion}>
                <BoxSetPreview boxSetId={openBoxSet.id} />
              </div>
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
