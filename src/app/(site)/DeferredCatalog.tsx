'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import CatalogFilterBarSkeleton from '@/components/book/CatalogControls/CatalogFilterBarSkeleton'
import styles from './CatalogSection.module.scss'
import type { BookCatalog, BookFilters } from '@/entities/book/client'

// The catalog grid is heavy (~370 DOM nodes, 14 cover images, render-blocking CSS, hydration). We
// mount it only on the FIRST real user signal — scroll / pointer / key — so it stays out of the
// measured PSI window (PSI loads at the top and never scrolls/interacts). A long timeout mounts it
// for the rare visitor who never interacts.
//
// The ИЗДАНИЯ heading is rendered HERE, permanently, OUTSIDE the mount swap — so it never re-mounts
// (no title blink when the grid swaps in). Until interaction we show the real heading + a static
// replica of the filter bar + a reserved-height spacer: the catalog reads as "present, loading"
// (affordance) and the reserved height keeps the sections below anchored far down, so they can't
// render before the catalog and the swap to the real grid is shift-free.
//
// CLS fix: the reserve div stays as a height floor AFTER mount too, until NewProducts has actually
// rendered content. The ssr:false dynamic import renders nothing until its chunk downloads (seconds
// on slow connections) — without the floor the section collapses to ~0px, yanking the footer up
// into the viewport (catastrophic CLS = 0.99 mobile). Once NewProducts renders, a ref callback
// removes the floor so there's no dead space.
const NewProducts = dynamic(() => import('@/components/book/NewProducts'), { ssr: false })

type Props = {
  catalog: BookCatalog
  filters: BookFilters
}

export default function DeferredCatalog({ catalog, filters }: Props) {
  const [mounted, setMounted] = useState(false)
  const [contentReady, setContentReady] = useState(false)

  useEffect(() => {
    if (mounted) return
    const mount = () => setMounted(true)
    const opts: AddEventListenerOptions = { once: true, passive: true }
    window.addEventListener('scroll', mount, opts)
    window.addEventListener('pointerdown', mount, opts)
    window.addEventListener('keydown', mount, opts)
    // Fallback for a visitor who never interacts — fires long after PSI's trace has ended.
    const t = window.setTimeout(mount, 10000)
    return () => {
      window.removeEventListener('scroll', mount)
      window.removeEventListener('pointerdown', mount)
      window.removeEventListener('keydown', mount)
      window.clearTimeout(t)
    }
  }, [mounted])

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>ИЗДАНИЯ</h2>
      {mounted ? (
        <div ref={(el) => { if (el && el.children.length > 0 && !contentReady) setContentReady(true) }}>
          <NewProducts catalog={catalog} filters={filters} />
        </div>
      ) : (
        <>
          <CatalogFilterBarSkeleton />
          <div className={styles.reserve} aria-hidden />
        </>
      )}
      {/* Height floor that prevents the page from shrinking while NewProducts' chunk
          downloads. Removed once NewProducts has rendered content (contentReady), so
          there's no dead space after the catalog loads. */}
      {mounted && !contentReady && <div className={styles.reserve} aria-hidden />}
    </section>
  )
}
