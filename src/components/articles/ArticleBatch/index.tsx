'use client'

import { useEffect, useMemo, useState } from 'react'
import ArticleCard from '@/components/articles/ArticleCard'
import type { ArticleSummary } from '@/entities/article/client'
import styles from './ArticleBatch.module.scss'

type Props = {
  articles: ArticleSummary[]
  // Each batch lays out its own masonry. The sentinel ref is attached
  // when this is the most recently mounted batch — observed by the
  // parent ArticlesFeed to trigger the next fetch.
  sentinelRef?: React.Ref<HTMLDivElement>
}

const FALLBACK_AR = 3 / 2
const OVERLAY_RESERVE = 0.25
const EXCERPT_RESERVE = 0.18

// Picks the breakpoint-appropriate column count. Matches the SCSS
// breakpoint thresholds. SSR uses the desktop default; the client
// re-measures on mount and re-flows.
function pickColumnCount(width: number): number {
  if (width <= 0) return 3
  if (width <= 532) return 1
  if (width <= 1199) return 2
  return 3
}

// Estimates a card's vertical footprint in units of column-width — used
// by the stacks-shortest distribution. Uses the cover's natural aspect
// ratio when available so a portrait drug-1 doesn't get treated the
// same as a 16:9 borges-8.
function estimateUnitHeight(article: ArticleSummary): number {
  const ar =
    article.coverWidth && article.coverHeight && article.coverWidth > 0
      ? article.coverWidth / article.coverHeight
      : FALLBACK_AR
  const imageUnits = 1 / ar
  return imageUnits + OVERLAY_RESERVE + (article.excerpt ? EXCERPT_RESERVE : 0)
}

// Stacks-shortest column distribution. Deterministic in both render
// passes so SSR markup matches the initial client render exactly.
function distributeIntoColumns(
  articles: ArticleSummary[],
  columnCount: number,
): ArticleSummary[][] {
  if (columnCount <= 1) return [articles]
  const columns: ArticleSummary[][] = Array.from({ length: columnCount }, () => [])
  const heights = new Array(columnCount).fill(0)
  for (const article of articles) {
    let shortest = 0
    for (let i = 1; i < columnCount; i += 1) {
      if (heights[i] < heights[shortest]) shortest = i
    }
    columns[shortest].push(article)
    heights[shortest] += estimateUnitHeight(article)
  }
  return columns
}

export default function ArticleBatch({ articles, sentinelRef }: Props) {
  // Use desktop default for the first render so SSR + initial client
  // render agree. After mount, sync to the actual viewport width.
  const [viewportWidth, setViewportWidth] = useState(0)

  useEffect(() => {
    const update = () => setViewportWidth(window.innerWidth)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const columnCount = pickColumnCount(viewportWidth)
  const columns = useMemo(
    () => distributeIntoColumns(articles, columnCount),
    [articles, columnCount],
  )

  const midpoint = Math.max(0, Math.floor(articles.length / 2) - 1)

  return (
    <section
      className={styles.batch}
      data-columns={columnCount}
      style={{ '--columns': columnCount } as React.CSSProperties}
    >
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className={styles.column}>
          {column.map((article) => {
            // Find this article's index within the batch as a whole so
            // the sentinel lands at the midpoint regardless of column.
            const indexInBatch = articles.indexOf(article)
            return (
              <div key={article.id} className={styles.cell}>
                <ArticleCard article={article} />
                {sentinelRef && indexInBatch === midpoint && (
                  <div ref={sentinelRef} className={styles.sentinel} aria-hidden />
                )}
              </div>
            )
          })}
        </div>
      ))}
    </section>
  )
}
