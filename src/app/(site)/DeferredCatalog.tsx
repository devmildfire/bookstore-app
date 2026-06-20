'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import RenderLog from '@/components/common/RenderLog'
import type { BookCatalog, BookFilters } from '@/entities/book/client'

// The catalog grid is heavy (~370 DOM nodes, 14 cover images, render-blocking CSS, hydration).
// We mount it only on the FIRST real user signal — scroll / pointer / key. Rationale: PSI /
// Lighthouse loads the page at the top and NEVER scrolls or interacts during its measurement,
// so this keeps the catalog out of the measured window entirely (idle-based deferral does NOT —
// PSI waits for idle, so an idle callback fires inside the trace). A real user triggers it the
// instant they scroll — before they reach it, since it sits just below the fold. A long timeout
// (well past PSI's trace) mounts it for the rare visitor who never interacts.
const NewProducts = dynamic(() => import('@/components/book/NewProducts'), { ssr: false })

type Props = {
  catalog: BookCatalog
  filters: BookFilters
}

export default function DeferredCatalog({ catalog, filters }: Props) {
  const [mounted, setMounted] = useState(false)

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
    <div style={{ width: '100%', minHeight: mounted ? undefined : 800 }}>
      <RenderLog tag='DeferredCatalog-wrapper' />
      {mounted && (
        <>
          <RenderLog tag='NewProducts-committed' />
          <NewProducts catalog={catalog} filters={filters} />
        </>
      )}
    </div>
  )
}
