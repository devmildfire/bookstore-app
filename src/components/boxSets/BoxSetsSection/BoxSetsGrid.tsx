'use client'

import { useState, useEffect, useRef, Fragment } from 'react'
import cn from 'classnames'
import BoxSetCard from './BoxSetCard'
import BoxSetPreview from './BoxSetPreview'
import type { BoxSet } from '@/entities/boxSet/client'
import { BREAKPOINTS } from '@/consts/breakpoints'
import styles from './BoxSetsSection.module.scss'

type Variant = 'page' | 'contained'

type Props = {
  boxSets: BoxSet[]
  // 'page' (default): rigid 3/2/1 columns based on viewport, with page-
  // gutter side columns. Used on the homepage and the book detail page.
  // 'contained': fits the wrapper width, ResizeObserver-driven column
  // count with a ~300 px min card width — used on /profile/favorites
  // where the grid lives inside a narrower right column. No outer
  // gutter columns.
  variant?: Variant
}

const CONTAINED_MIN_CARD = 300
const CONTAINED_GAP = 24

function getViewportColumns(): number {
  if (window.matchMedia(`(max-width: ${BREAKPOINTS.phoneMax}px)`).matches) return 1
  if (window.matchMedia(`(max-width: ${BREAKPOINTS.tabletMax}px)`).matches) return 2
  return 3
}

export default function BoxSetsGrid({ boxSets, variant = 'page' }: Props) {
  const [openId, setOpenId] = useState<number | null>(null)
  const [columns, setColumns] = useState(variant === 'contained' ? 1 : 3)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (variant === 'page') {
      function update() { setColumns(getViewportColumns()) }
      update()
      window.addEventListener('resize', update)
      return () => window.removeEventListener('resize', update)
    }

    // contained: observe the actual wrapper width and recompute on resize.
    const el = wrapRef.current
    if (!el) return
    function update(width: number) {
      const cols = Math.max(
        1,
        Math.floor((width + CONTAINED_GAP) / (CONTAINED_MIN_CARD + CONTAINED_GAP))
      )
      setColumns(cols)
    }
    update(el.getBoundingClientRect().width)
    const ro = new ResizeObserver((entries) => {
      update(entries[0].contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [variant])

  function handleToggle(id: number) {
    setOpenId((prev) => (prev === id ? null : id))
  }

  const rows: BoxSet[][] = []
  for (let i = 0; i < boxSets.length; i += columns) {
    rows.push(boxSets.slice(i, i + columns))
  }

  return (
    <div
      ref={wrapRef}
      className={cn(styles.gridWrap, variant === 'contained' && styles.gridWrapContained)}
    >
      {rows.map((row, rowIdx) => {
        const openBoxSet = row.find((bs) => bs.id === openId) ?? null
        return (
          <Fragment key={rowIdx}>
            {/* center column — cards respect page padding. Modifier class
                shrinks the grid + centers it when the row has fewer items
                than the breakpoint's default column count, so a partial last
                row doesn't sit left-aligned against empty slots. */}
            <div
              className={cn(
                styles.cardRow,
                variant === 'page' && styles[`cols${row.length}`],
                variant === 'contained' && styles.cardRowContained
              )}
              style={variant === 'contained'
                ? {
                    // Use the full column count (not row.length) so the
                    // partial last row leaves empty slots instead of
                    // stretching its single card to row width.
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  }
                : undefined}
            >
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
