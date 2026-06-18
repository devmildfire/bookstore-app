'use client'

import { useEffect, useRef, useState } from 'react'

// Fires once when the observed element gets within `rootMargin` of the viewport.
// Used to defer mounting below-the-fold sections (their JS/images/DOM) out of the
// initial/LCP window — they mount just before the user scrolls to them. Falls back
// to immediately "in view" where IntersectionObserver is unavailable (SSR-safe: the
// effect only runs client-side, so server render is always the not-yet-in-view state).
export default function useInView<T extends Element = HTMLDivElement>(rootMargin = '600px') {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || inView) return

    if (typeof IntersectionObserver === 'undefined') {
      // No IO (very old browser): reveal on the next frame so the content is never
      // stranded. Deferred (not a synchronous setState in the effect body).
      const id = requestAnimationFrame(() => setInView(true))
      return () => cancelAnimationFrame(id)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin, inView])

  return { ref, inView }
}
