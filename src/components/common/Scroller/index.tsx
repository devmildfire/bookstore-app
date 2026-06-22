'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import cn from '@/utils/cn'
// Only the (tiny) theme CSS is eager; the ~13 KB overlayscrollbars JS is lazy-loaded below.
import 'overlayscrollbars/overlayscrollbars.css'
import styles from './Scroller.module.scss'

// The one custom scrollbar for the site. Wraps a scrollable container so it shows our thin grey
// track + rounded grey thumb when content overflows. Put the size constraint (max-height /
// max-width) on it via `className`. Exposes the scroll viewport element via `ref`.
//
// PERF: overlayscrollbars (~13 KB gz) is NOT shipped in the eager bundle. We render a NATIVE
// scroll element immediately (fully functional, native bar), then lazy-load overlayscrollbars
// on the FIRST interaction with this scroller (scroll / hover / focus) and enhance it to the
// custom bar. Initializing OS with `elements: { viewport: host }` keeps the host element as the
// scroll viewport, so the exposed ref (and any IntersectionObserver root pointed at it) stays
// valid both before and after the enhance. On touch the custom bar is hidden anyway.
type Axis = 'both' | 'vertical' | 'horizontal'

type Props = {
  children: React.ReactNode
  className?: string
  axis?: Axis
}

const OS_OVERFLOW: Record<Axis, { x: 'scroll' | 'hidden'; y: 'scroll' | 'hidden' }> = {
  both: { x: 'scroll', y: 'scroll' },
  vertical: { x: 'hidden', y: 'scroll' },
  horizontal: { x: 'scroll', y: 'hidden' },
}

const NATIVE_OVERFLOW: Record<Axis, React.CSSProperties> = {
  both: { overflow: 'auto' },
  vertical: { overflowX: 'hidden', overflowY: 'auto' },
  horizontal: { overflowX: 'auto', overflowY: 'hidden' },
}

const Scroller = forwardRef<HTMLElement, Props>(function Scroller(
  { children, className, axis = 'both' },
  ref,
) {
  const hostRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => hostRef.current ?? document.createElement('div'), [])

  useEffect(() => {
    const host = hostRef.current
    if (host == null) return

    let instance: { destroy: () => void } | undefined
    let cancelled = false

    const enhance = () => {
      if (instance != null || cancelled) return
      void import('overlayscrollbars').then(({ OverlayScrollbars }) => {
        if (cancelled || hostRef.current == null) return
        instance = OverlayScrollbars(
          { target: hostRef.current, elements: { viewport: hostRef.current } },
          {
            scrollbars: { theme: 'os-theme-chtivo', autoHide: 'never', clickScroll: true },
            overflow: OS_OVERFLOW[axis],
          },
        )
      })
    }

    const opts = { once: true, passive: true } as const
    host.addEventListener('scroll', enhance, opts)
    host.addEventListener('pointerenter', enhance, opts)
    host.addEventListener('focusin', enhance, opts)

    return () => {
      cancelled = true
      host.removeEventListener('scroll', enhance)
      host.removeEventListener('pointerenter', enhance)
      host.removeEventListener('focusin', enhance)
      instance?.destroy()
    }
  }, [axis])

  return (
    <div ref={hostRef} className={cn(styles.scroller, className)} style={NATIVE_OVERFLOW[axis]}>
      {children}
    </div>
  )
})

export default Scroller
