'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react'
import { OverlayScrollbarsComponent, type OverlayScrollbarsComponentRef } from 'overlayscrollbars-react'
import cn from 'classnames'
import 'overlayscrollbars/overlayscrollbars.css'
import styles from './Scroller.module.scss'

// The one custom scrollbar for the site. Wraps a scrollable container so it shows
// our thin grey track + rounded grey thumb consistently across browsers, only
// when the content overflows. Put the size constraint (max-height / max-width)
// on it via `className`. Native touch scrolling is preserved; the bar is hidden
// on touch devices (see the os-theme-chtivo theme in globals.scss).
//
// Exposes the scroll viewport element via `ref` (useful for IntersectionObserver
// or programmatic scrollTo). Access via `ref.current` — it's the actual DOM
// element that scrolls.
type Axis = 'both' | 'vertical' | 'horizontal'

type Props = {
  children: React.ReactNode
  className?: string
  axis?: Axis
}

const OVERFLOW: Record<Axis, { x: 'scroll' | 'hidden'; y: 'scroll' | 'hidden' }> = {
  both: { x: 'scroll', y: 'scroll' },
  vertical: { x: 'hidden', y: 'scroll' },
  horizontal: { x: 'scroll', y: 'hidden' },
}

const Scroller = forwardRef<HTMLElement, Props>(function Scroller(
  { children, className, axis = 'both' },
  ref,
) {
  const osRef = useRef<OverlayScrollbarsComponentRef>(null)

  useImperativeHandle(ref, () => {
    const viewport = osRef.current?.osInstance()?.elements().viewport
    return viewport ?? document.createElement('div') // fallback satisfies NonNullable
  }, [])

  return (
    <OverlayScrollbarsComponent
      ref={osRef}
      className={cn(styles.scroller, className)}
      options={{
        scrollbars: { theme: 'os-theme-chtivo', autoHide: 'never', clickScroll: true },
        overflow: OVERFLOW[axis],
      }}
      defer
    >
      {children}
    </OverlayScrollbarsComponent>
  )
})

export default Scroller
