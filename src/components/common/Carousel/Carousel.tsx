'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import cn from 'classnames'
import styles from './Carousel.module.scss'

/**
 * Reusable image / slide carousel.
 *
 * Renders an active slot in the centre with prev and next slides peeking from
 * the sides. The carousel has three responsive modes:
 *
 *  - **Wide** (≥1024 px): three slides visible (active + prev/next preview),
 *    nav buttons sit outside the slot area.
 *  - **Medium** (600–1023 px): nav buttons collapse to the carousel's inner
 *    left/right edges and overlay the preview slides.
 *  - **Mobile** (≤599 px): single full-width slide; the carousel breaks out of
 *    parent padding to span the full viewport; nav buttons render as big thin
 *    red chevrons inside the slide edges.
 *
 * Clicking the active slide on viewports ≥600 px opens a fullscreen overlay
 * (black background, image inset) with the same nav controls plus a red X
 * close button. ESC also closes.
 *
 * The carousel is fully accessible: keyboard navigation (← / →), ARIA roles,
 * live region announcing the current slide number.
 */
export type CarouselProps = {
  /**
   * One ReactNode per slide. Consumer renders the slide content (typically a
   * Next.js `<Image>`); the carousel only handles layout, navigation and
   * fullscreen behaviour.
   */
  slides: React.ReactNode[]
  /** Active slot width in px. The slot is a bounding box; content uses object-fit. */
  slotWidth?: number
  /** Active slot height in px. */
  slotHeight?: number
  /** Visible size of the prev/next slides as a fraction of the active slot. Default 0.636 per the Figma spec. */
  sideSlideScale?: number
  /** Wrap from the last slide back to the first (and vice-versa) seamlessly. Default true. */
  loop?: boolean
  /** Accessible label for the carousel `role="region"` wrapper. */
  ariaLabel?: string
  /** Optional override for inner UI labels (Russian by default). */
  labels?: Partial<CarouselLabels>
  className?: string
}

export type CarouselLabels = {
  /** Aria label for the previous nav button. */
  prev: string
  /** Aria label for the next nav button. */
  next: string
  /** Aria label for the fullscreen close button. */
  close: string
  /** Builds the slide-level aria label, e.g. `(2, 4) => '2 из 4'`. */
  slide: (index: number, total: number) => string
  /** Builds the SR-only live-region status, e.g. `(2, 4) => 'Слайд 2 из 4'`. */
  status: (index: number, total: number) => string
}

const DEFAULT_LABELS: CarouselLabels = {
  prev: 'Прокрутить влево',
  next: 'Прокрутить вправо',
  close: 'Закрыть',
  slide: (i, total) => `${i + 1} из ${total}`,
  status: (i, total) => `Слайд ${i + 1} из ${total}`,
}

const DEFAULT_SLOT_WIDTH = 500
const DEFAULT_SLOT_HEIGHT = 500
const DEFAULT_SIDE_SCALE = 0.636
const NAV_WIDTH = 37
const NAV_GAP_DESKTOP = 32
// Triplicate the rendered slides so navigation can always wrap in either
// direction without exposing the seam. When the active index drifts outside
// the middle copy, we silently teleport it back; the previous copy's slide
// shows the same content as the destination, so nothing visible changes.
const LOOP_COPIES = 3
// Must roughly match the slide CSS transition duration so the teleport is
// scheduled for the moment the slide animation finishes.
const TRANSITION_MS = 300
// Pointer movement under this threshold counts as a click (used for opening
// fullscreen) rather than a drag.
const DRAG_THRESHOLD_PX = 40
const CLICK_TOLERANCE_PX = 5
// Hide the fullscreen affordance below this width — at mobile sizes the
// single-slide layout already shows the active image at full width.
const FULLSCREEN_DISABLED_MQ = '(max-width: 599px)'

export default function Carousel({
  slides,
  slotWidth = DEFAULT_SLOT_WIDTH,
  slotHeight = DEFAULT_SLOT_HEIGHT,
  sideSlideScale = DEFAULT_SIDE_SCALE,
  loop = true,
  ariaLabel,
  labels,
  className,
}: CarouselProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isTeleporting, setIsTeleporting] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const dragStartX = useRef<number | null>(null)
  const dragStartedOnActive = useRef(false)

  const looped = loop && slides.length > 1
  const renderedSlides = useMemo(
    () => (looped ? Array.from({ length: LOOP_COPIES }, () => slides).flat() : slides),
    [slides, looped],
  )
  const middleStart = looped ? slides.length : 0
  const middleEnd = looped ? 2 * slides.length - 1 : slides.length - 1
  const [selectedIndex, setSelectedIndex] = useState(middleStart)

  const idealViewportWidth = slotWidth + 2 * slotWidth * sideSlideScale
  const idealTotalWidth = idealViewportWidth + 2 * (NAV_WIDTH + NAV_GAP_DESKTOP)

  // Schedules a silent jump back into the middle triplet copy after the
  // visible animation finishes. Suppresses slide transitions for two frames
  // so the DOM-element swap is invisible.
  const scheduleTeleport = useCallback((toIndex: number) => {
    setTimeout(() => {
      setIsTeleporting(true)
      setSelectedIndex(toIndex)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsTeleporting(false))
      })
    }, TRANSITION_MS)
  }, [])

  const scrollNext = useCallback(() => {
    setSelectedIndex((prev) => {
      const next = prev + 1
      if (looped && next > middleEnd) scheduleTeleport(next - slides.length)
      return next
    })
  }, [looped, middleEnd, slides.length, scheduleTeleport])

  const scrollPrev = useCallback(() => {
    setSelectedIndex((prev) => {
      const next = prev - 1
      if (looped && next < middleStart) scheduleTeleport(next + slides.length)
      return next
    })
  }, [looped, middleStart, slides.length, scheduleTeleport])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    dragStartX.current = e.clientX
    // Was the pointer-down on (or inside) the active slide? Required for
    // treating a non-drag click as "open fullscreen". We can't use closest()
    // with the CSS-module class name because it's mangled at build time;
    // checking the substring is a pragmatic workaround.
    const slideEl = (e.target as HTMLElement).closest('[role="group"]')
    dragStartedOnActive.current = !!(
      slideEl &&
      slideEl.getAttribute('aria-hidden') === 'false' &&
      slideEl.className.includes('Active')
    )
    setIsDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (dragStartX.current === null) return
    setDragOffset(e.clientX - dragStartX.current)
  }, [])

  const finishDrag = useCallback(
    (e: React.PointerEvent) => {
      if (dragStartX.current === null) return
      const distance = e.clientX - dragStartX.current
      const wasOnActive = dragStartedOnActive.current
      dragStartX.current = null
      dragStartedOnActive.current = false
      setIsDragging(false)
      setDragOffset(0)
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        /* pointer was never captured */
      }
      if (Math.abs(distance) > DRAG_THRESHOLD_PX) {
        // Drag direction maps to card-motion direction:
        //   right drag → cards scroll right → previous slide
        //   left drag  → cards scroll left  → next slide
        if (distance > 0) scrollPrev()
        else scrollNext()
        return
      }
      if (
        Math.abs(distance) < CLICK_TOLERANCE_PX &&
        wasOnActive &&
        typeof window !== 'undefined' &&
        !window.matchMedia(FULLSCREEN_DISABLED_MQ).matches
      ) {
        setIsFullscreen(true)
      }
    },
    [scrollPrev, scrollNext],
  )

  // Keyboard navigation when the carousel region has focus.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        scrollNext()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        scrollPrev()
      }
    }
    el.addEventListener('keydown', handler)
    return () => el.removeEventListener('keydown', handler)
  }, [scrollPrev, scrollNext])

  // Fullscreen: ESC closes; lock body scroll while open.
  useEffect(() => {
    if (!isFullscreen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [isFullscreen])

  // Proportional scale-down when the container is narrower than the ideal
  // layout width. Floor at 0.25 to keep the carousel usable at very small
  // sizes — mobile mode (CSS-driven) takes over below the mobile breakpoint.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width
      if (w >= idealTotalWidth) setScale(1)
      else setScale(Math.max(w / idealTotalWidth, 0.25))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [idealTotalWidth])

  if (slides.length === 0) return null

  const viewportWidth = Math.round(idealViewportWidth * scale)
  const effSlotWidth = Math.round(slotWidth * scale)
  const effSlotHeight = Math.round(slotHeight * scale)

  const l: CarouselLabels = { ...DEFAULT_LABELS, ...labels }

  /**
   * 5 visible roles + hidden. Far slides sit off-screen so when they become
   * prev/next they animate IN from the correct side rather than materialising
   * at the centre.
   */
  function roleOf(i: number): 'active' | 'prev' | 'next' | 'farPrev' | 'farNext' | 'hidden' {
    if (i === selectedIndex) return 'active'
    if (i === selectedIndex - 1) return 'prev'
    if (i === selectedIndex + 1) return 'next'
    if (i === selectedIndex - 2) return 'farPrev'
    if (i === selectedIndex + 2) return 'farNext'
    return 'hidden'
  }

  // Map a DOM index in the triplicated array back to the user's logical slide
  // number (0-based), used for the ARIA live-region status.
  const logicalIndex =
    (((selectedIndex - middleStart) % slides.length) + slides.length) % slides.length

  return (
    <div
      ref={rootRef}
      className={cn(
        styles.root,
        isTeleporting && styles.teleporting,
        isFullscreen && styles.rootFullscreen,
        className,
      )}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel ?? 'Изображения'}
      tabIndex={0}
      style={
        {
          '--slot-w': `${effSlotWidth}px`,
          '--slot-h': `${effSlotHeight}px`,
          '--side-scale': `${sideSlideScale}`,
          '--drag-offset': `${dragOffset}px`,
        } as React.CSSProperties
      }
    >
      {/*
        Left button "scrolls cards left", which in our model advances forward
        (next slide comes from the right). Right button does the inverse.
        Drag direction follows the same convention.
       */}
      <NavButton direction="prev" onClick={scrollNext} label={l.prev} />

      <div
        className={cn(styles.viewport, isDragging && styles.viewportDragging)}
        style={{ width: `${viewportWidth}px` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      >
        <div className={styles.container}>
          {renderedSlides.map((slide, i) => {
            const role = roleOf(i)
            return (
              <div
                key={i}
                className={cn(
                  styles.slide,
                  role === 'active' && styles.slideActive,
                  role === 'prev' && styles.slidePrev,
                  role === 'next' && styles.slideNext,
                  role === 'farPrev' && styles.slideFarPrev,
                  role === 'farNext' && styles.slideFarNext,
                )}
                role="group"
                aria-roledescription="slide"
                aria-label={l.slide(i % slides.length, slides.length)}
                aria-hidden={role !== 'active' && role !== 'prev' && role !== 'next'}
              >
                <div className={styles.slot}>
                  <div className={styles.content}>{slide}</div>
                  <div className={styles.overlay} aria-hidden="true" />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <NavButton direction="next" onClick={scrollPrev} label={l.next} />

      <span className={styles.srStatus} aria-live="polite">
        {l.status(logicalIndex, slides.length)}
      </span>

      {isFullscreen && (
        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => setIsFullscreen(false)}
          aria-label={l.close}
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M5 5 L19 19 M5 19 L19 5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  )
}

function NavButton({
  direction,
  onClick,
  label,
}: {
  direction: 'prev' | 'next'
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(styles.nav, direction === 'prev' ? styles.navPrev : styles.navNext)}
      aria-label={label}
    >
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M15 4 L7 12 L15 20"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </button>
  )
}
