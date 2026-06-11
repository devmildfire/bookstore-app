'use client'

import { useRef, useLayoutEffect, useState } from 'react'
import Link from 'next/link'
import cn from 'classnames'
import BookCover from './BookCover'
import type { PeriodicalIssue } from '@/api/periodicals'
import styles from './PeriodicalView.module.scss'

// Cover + «Содержание» side-by-side. On desktop/tablet the story list (often 12
// items) runs taller than the cover, leaving dead space — so we cap the list to
// the cover's rendered height and let it scroll internally (heading stays fixed).
// On mobile the cap is removed and the full list shows stacked under the cover.
export default function PeriodicalIssueMain({ issue }: { issue: PeriodicalIssue }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [scrolling, setScrolling] = useState(false)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const cover = root.querySelector<HTMLElement>('[data-cover]')
    const list = root.querySelector<HTMLElement>('[data-toc-list]')
    const toc = root.querySelector<HTMLElement>('[data-toc]')
    if (!cover || !list || !toc) return

    const sync = () => {
      if (window.matchMedia('(max-width: 767px)').matches) {
        list.style.maxHeight = ''
        setScrolling(false)
        return
      }
      list.style.maxHeight = 'none'
      const headerSpace = toc.offsetHeight - list.offsetHeight // «Содержание» heading + margins
      const target = Math.max(160, cover.offsetHeight - headerSpace)
      list.style.maxHeight = `${target}px`
      setScrolling(list.scrollHeight > target + 1)
    }

    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(cover)
    const imgs = Array.from(cover.querySelectorAll('img'))
    imgs.forEach((im) => im.addEventListener('load', sync))
    window.addEventListener('resize', sync)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', sync)
      imgs.forEach((im) => im.removeEventListener('load', sync))
    }
  }, [issue])

  return (
    <div className={styles.issueMain} ref={rootRef}>
      <div className={styles.cover} data-cover>
        <BookCover
          coverUrl={issue.book.coverUrl}
          coverBlurDataUrl={issue.book.coverBlurDataUrl}
          bookName={issue.book.name}
          titleId={issue.book.titleId}
        />
      </div>

      {issue.stories.length > 0 && (
        <div className={cn(styles.toc, scrolling && styles.tocScroll)} data-toc>
          <h3 className={styles.tocHeading}>Содержание</h3>
          <ol className={styles.tocList} data-toc-list>
            {issue.stories.map((s, i) => (
              <li key={s.slug} className={styles.tocItem}>
                <span className={styles.tocNum}>{String(i + 1).padStart(2, '0')}</span>
                <Link href={`/dino-magazine/${s.slug}`} className={styles.tocTitle}>
                  {s.title}
                </Link>
                {s.authorName && <span className={styles.tocAuthor}>{s.authorName}</span>}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
