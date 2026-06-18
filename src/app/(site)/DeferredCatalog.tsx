'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import type { BookCatalog, BookFilters } from '@/entities/book/client'

// The catalog grid is heavy (~370 DOM nodes, 14 cover images, render-blocking CSS, hydration)
// but its top (the «ИЗДАНИЯ» heading) sits just at/above the mobile fold — so an
// IntersectionObserver would fire on load and never actually defer it. Instead we defer by
// TIME: mount after the main thread goes idle (requestIdleCallback), i.e. after the LCP /
// initial hydration window. ssr:false keeps its JS chunk, CSS, images and DOM out of the
// initial document entirely; the placeholder reserves space (inline min-height, no SCSS import).
const NewProducts = dynamic(() => import('@/components/book/NewProducts'), { ssr: false })

type Props = {
  catalog: BookCatalog
  filters: BookFilters
}

export default function DeferredCatalog({ catalog, filters }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const ric = window.requestIdleCallback
    if (ric) {
      const id = ric(() => setMounted(true), { timeout: 2500 })
      return () => window.cancelIdleCallback(id)
    }
    const t = setTimeout(() => setMounted(true), 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ width: '100%', minHeight: mounted ? undefined : 800 }}>
      {mounted && <NewProducts catalog={catalog} filters={filters} />}
    </div>
  )
}
