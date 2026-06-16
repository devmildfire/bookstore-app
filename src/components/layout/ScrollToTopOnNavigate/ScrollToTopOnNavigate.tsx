'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Next App Router doesn't reliably reset window scroll on forward navigation to
// routes that have a loading.tsx (e.g. /books/[slug]) — the new page can open
// scrolled to wherever the previous page was. Force scroll-to-top on PUSH
// navigations, but:
//   - leave back/forward (popstate) alone, so Next's scroll restoration still
//     returns you to where you were in the catalog;
//   - skip when the URL has a hash, so anchor links (periodical #vol-N) work.
export default function ScrollToTopOnNavigate() {
  const pathname = usePathname()
  const isPopNavigation = useRef(false)

  useEffect(() => {
    const onPopState = () => {
      isPopNavigation.current = true
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (isPopNavigation.current) {
      // Back/forward — let Next restore the previous scroll position.
      isPopNavigation.current = false
      return
    }
    if (window.location.hash) return // anchor navigation owns the scroll
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
