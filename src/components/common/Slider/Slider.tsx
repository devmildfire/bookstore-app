'use client'

import { memo, useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react'
import cn from 'classnames'
import type { EmblaCarouselType } from 'embla-carousel'
import SliderSlide from './SliderSlide'
import type { SlideItem } from './types'
import styles from './Slider.module.scss'

export type SliderProps = {
  items: SlideItem[]
}

const ATTACH_AFTER_SCROLL_MS = 180

// embla-carousel CORE (framework-agnostic). Its default export attaches imperatively to an existing
// DOM node — so we enhance the SSR'd carousel IN PLACE rather than swapping to a second React
// component. `import()` keeps it out of the eager bundle (its own chunk, fetched only on carousel
// interaction — never on a passive/PSI load). The promise is cached so hover-preload and the actual
// attach share one fetch.
let emblaCorePromise: Promise<typeof import('embla-carousel')['default']> | null = null
function loadEmbla() {
  if (!emblaCorePromise) emblaCorePromise = import('embla-carousel').then((m) => m.default)
  return emblaCorePromise
}

// `scrollend` fires exactly when a scroll (incl. touch momentum + scroll-snap) finishes settling —
// the only reliable signal for "which slide did the swipe land on". A fixed timer after pointerup
// fires mid-settle and reads a transient position → Embla would init on the wrong slide. We use a
// debounced-scroll fallback only where scrollend is unsupported.
const SCROLLEND_SUPPORTED = typeof window !== 'undefined' && 'onscrollend' in window

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

// Survives a remount. The slide the carousel was last on + when it was set. The Next.js App Router
// re-renders the home route on the first interaction (its own internal history sync); in Firefox
// that commit unmounts + remounts this Slider as the zero-JS SSR baseline — which starts at slide 0,
// i.e. the "spring back to the first slide". A freshly-mounted instance reads this and, if the
// remount is recent, restores the slide it was on so the swap is invisible. Never mutated during SSR
// (only client event handlers/effects write it), so the server always renders slide 0 → hydration
// matches.
let lastSlide = { index: 0, at: 0 }
const REMOUNT_RESTORE_MS = 2500

function nowMs() {
  return typeof performance !== 'undefined' ? performance.now() : 0
}

// [TEMP] mount counter — a second instance means the component was remounted (the springback).
let sliderMountSeq = 0

// The hero's slides are static for the session. A Next App Router route re-render (which fires on the
// first interaction — see docs/perf/hero-carousel-remount.md) hands us a NEW `items` array with the
// SAME content; without this, React would re-render the Slider and, in Firefox, reconcile the
// Embla-mutated viewport into a fresh one (the remount → spring back to slide 1). Bailing on
// equal-by-id content keeps React from ever touching the live viewport, while still allowing a real
// content change to flow through.
function slidesEqual(prev: SliderProps, next: SliderProps): boolean {
  const a = prev.items, b = next.items
  if (a === b) return true
  if ((a?.length ?? 0) !== (b?.length ?? 0)) return false
  return a.every((it, i) => it.id === b[i].id)
}

// Native CSS scroll-snap carousel for the home hero — replaces Swiper (~24 KB gz) on the critical
// path. Every slide renders in the SSR HTML (LCP cover paints with no carousel-library dependency)
// and the baseline is swipeable with zero JS. It does NOT auto-advance. On the first carousel
// interaction, Embla is attached to the SAME viewport node (no swap, no DOM recreation) to add
// looping + controlled drag — preserving the current scroll position, so there's no blink, no
// layout jump, and no slide-index reset.
function Slider({ items }: SliderProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const emblaApiRef = useRef<EmblaCarouselType | null>(null)
  const attachingRef = useRef(false)
  const attachTimerRef = useRef<number | null>(null)
  const pendingScrollToRef = useRef<number | null>(null)
  // Seed from the last-known slide on a quick remount (see lastSlide above), else slide 0. SSR and
  // the first client mount both see at=0 → slide 0, so hydration matches.
  const [active, setActive] = useState(() =>
    nowMs() - lastSlide.at < REMOUNT_RESTORE_MS ? lastSlide.index : 0,
  )

  const count = items?.length ?? 0
  const showPagination = count > 1

  // [TEMP] confirm whether the remount still happens with the memo guard in place.
  useEffect(() => {
    console.log(`[hero] Slider MOUNT #${++sliderMountSeq}`)
  }, [])

  // Single source for the active slide: updates React state AND the remount-surviving record.
  const setActiveIndex = useCallback((index: number) => {
    lastSlide = { index, at: nowMs() }
    setActive(index)
  }, [])

  const preload = useCallback(() => {
    void loadEmbla()
  }, [])

  // The slide the baseline is actually on right now, read straight from the DOM (source of truth —
  // React state can lag a fast swipe).
  const currentBaselineIndex = useCallback(() => {
    const vp = viewportRef.current
    if (!vp || vp.clientWidth === 0) return 0
    return Math.max(0, Math.min(Math.round(vp.scrollLeft / vp.clientWidth), count - 1))
  }, [count])

  // Attach Embla to the existing viewport node. Switches it from native scroll-snap to
  // Embla-controlled and inits at `startIndex` — all synchronous in one block before the next paint,
  // so the on-screen slide never changes during the handoff (no blink / jump / index reset).
  const attachEmbla = useCallback((startIndex: number) => {
    if (attachingRef.current || emblaApiRef.current || count <= 1) return
    attachingRef.current = true
    if (attachTimerRef.current) window.clearTimeout(attachTimerRef.current)
    loadEmbla()
      .then((EmblaCarousel) => {
        const vp = viewportRef.current
        if (!vp) {
          attachingRef.current = false
          return
        }
        const idx = Math.max(0, Math.min(startIndex, count - 1))
        // Hand off from native scroll → Embla. Drop native scroll (overflow hidden + scrollLeft 0)
        // and let Embla measure the UN-transformed DOM, then position itself via startIndex. We must
        // NOT pre-set a transform on the container: it poisons Embla's slide measurement — it would
        // measure the shifted slides, conclude "slide idx lives at offset 0", and settle the track to
        // tx=0 (showing slide 0) while reporting selectedScrollSnap=idx. Clean DOM → correct position.
        vp.scrollLeft = 0
        vp.style.overflowX = 'hidden'
        vp.style.scrollSnapType = 'none'
        const api = EmblaCarousel(vp, { loop: true, startIndex: idx, align: 'start', containScroll: false })
        const onSelect = () => setActiveIndex(api.selectedScrollSnap())
        api.on('select', onSelect)
        api.on('reInit', onSelect)
        emblaApiRef.current = api
        setActiveIndex(idx)
        if (pendingScrollToRef.current != null) {
          api.scrollTo(pendingScrollToRef.current)
          pendingScrollToRef.current = null
        }
      })
      .catch(() => {
        attachingRef.current = false
      })
  }, [count, setActiveIndex])

  // Fallback only (browsers without `scrollend`): attach a short debounce after the last scroll
  // event. Reads the index at fire time, not when scheduled.
  const scheduleAttachFallback = useCallback(() => {
    if (attachingRef.current || emblaApiRef.current || count <= 1) return
    if (attachTimerRef.current) window.clearTimeout(attachTimerRef.current)
    attachTimerRef.current = window.setTimeout(() => {
      attachEmbla(currentBaselineIndex())
    }, ATTACH_AFTER_SCROLL_MS)
  }, [count, currentBaselineIndex, attachEmbla])

  const goTo = useCallback((index: number) => {
    setActiveIndex(index)
    const api = emblaApiRef.current
    if (api) {
      api.scrollTo(index)
      return
    }
    // Not attached yet: attach at the current position (seamless), then let Embla animate to the
    // clicked slide once it's live.
    pendingScrollToRef.current = index
    attachEmbla(currentBaselineIndex())
  }, [attachEmbla, currentBaselineIndex, setActiveIndex])

  const handleScroll = useCallback(() => {
    if (emblaApiRef.current) return // Embla owns the viewport now (native scroll is off)
    setActiveIndex(currentBaselineIndex()) // keep the active dot live during the drag
    if (!SCROLLEND_SUPPORTED) scheduleAttachFallback()
  }, [currentBaselineIndex, scheduleAttachFallback, setActiveIndex])

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (isInteractiveTarget(event.target)) return
    preload()
  }, [preload])

  // On (re)mount, if a recent instance had advanced past the first slide, restore the native scroll
  // to that slide BEFORE paint — so a route-commit remount lands on the slide the user was on, not
  // slide 0. No-op on the initial load (lastSlide.at is 0) and on stale state.
  useIsomorphicLayoutEffect(() => {
    if (lastSlide.index <= 0 || nowMs() - lastSlide.at >= REMOUNT_RESTORE_MS) return
    const vp = viewportRef.current
    if (vp && vp.clientWidth) vp.scrollLeft = lastSlide.index * vp.clientWidth
  }, [])

  // Attach Embla once the swipe has truly settled (scrollend), at the final landed slide.
  useEffect(() => {
    const vp = viewportRef.current
    if (!vp || !SCROLLEND_SUPPORTED) return
    const onScrollEnd = () => {
      if (emblaApiRef.current) return
      attachEmbla(currentBaselineIndex())
    }
    vp.addEventListener('scrollend', onScrollEnd)
    return () => vp.removeEventListener('scrollend', onScrollEnd)
  }, [attachEmbla, currentBaselineIndex])

  useEffect(() => {
    return () => {
      if (attachTimerRef.current) window.clearTimeout(attachTimerRef.current)
      emblaApiRef.current?.destroy()
    }
  }, [])

  if (!items || items.length === 0) return null

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.viewport}
        ref={viewportRef}
        onScroll={handleScroll}
        onPointerEnter={preload}
        onPointerDown={handlePointerDown}
        onFocusCapture={preload}
      >
        <div className={styles.container}>
          {items.map((item, index) => (
            <div className={styles.slideOuter} key={item.id}>
              <SliderSlide item={item} priority={index === 0} />
            </div>
          ))}
        </div>
      </div>

      {showPagination && (
        <div className={styles.pagination}>
          {items.map((item, index) => (
            <button
              type='button'
              key={item.id}
              className={cn(styles.bullet, index === active && styles.bulletActive)}
              aria-label={`Перейти к слайду ${index + 1}`}
              aria-current={index === active ? 'true' : undefined}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Custom comparator: skip re-renders that only change the items array reference (e.g. a route
// re-render), re-render only on a real content change. See slidesEqual above.
const MemoSlider = memo(Slider, slidesEqual)

function isInteractiveTarget(target: EventTarget): boolean {
  return target instanceof Element && Boolean(target.closest('a, button'))
}

export default MemoSlider
