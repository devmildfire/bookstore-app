'use client'

import { memo, useRef, useState, useEffect, useCallback } from 'react'
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

// Native CSS scroll-snap carousel for the home hero — replaces Swiper (~24 KB gz) on the critical
// path. Every slide renders in the SSR HTML (LCP cover paints with no carousel-library dependency)
// and the baseline is swipeable with zero JS. It does NOT auto-advance. On the first carousel
// interaction, Embla is attached to the SAME viewport node (no swap, no DOM recreation) to add
// looping + controlled drag — preserving the current scroll position, so there's no blink, no
// layout jump, and no slide-index reset.
const Slider = memo(function Slider({ items }: SliderProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const emblaApiRef = useRef<EmblaCarouselType | null>(null)
  const attachingRef = useRef(false)
  const attachTimerRef = useRef<number | null>(null)
  const pendingScrollToRef = useRef<number | null>(null)
  const [active, setActive] = useState(0)

  const count = items?.length ?? 0
  const showPagination = count > 1

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
        // [TEMP DEBUG] verify the index read + Embla's resolved slide through the attach.
        console.log('[hero] attach.then', { startIndex, idx, scrollLeftAtAttach: vp.scrollLeft, clientWidth: vp.clientWidth })
        // Hand off from native scroll → Embla. Drop native scroll (overflow hidden + scrollLeft 0)
        // and let Embla measure the UN-transformed DOM, then position itself via startIndex.
        // NOTE: we must NOT pre-set a transform on the container here. Doing so poisons Embla's slide
        // measurement — it would measure the shifted slides, conclude "slide idx lives at offset 0",
        // and settle the track to tx=0 (showing slide 0) while reporting selectedScrollSnap=idx. That
        // index/pixel desync was the "snap-back to the first slide". Clean DOM → correct positioning.
        vp.scrollLeft = 0
        vp.style.overflowX = 'hidden'
        vp.style.scrollSnapType = 'none'
        const api = EmblaCarousel(vp, { loop: true, startIndex: idx, align: 'start', containScroll: false })
        // [TEMP DEBUG] Compare Embla's INDEX (selectedSnap) against the actual rendered TRANSLATE of
        // the track. translateX / clientWidth = the visual slide. If selectedSnap=1 but visualSlide=0,
        // the index is right while the pixels are wrong → measurement/transform mismatch.
        const visual = () => {
          const c = vp.firstElementChild as HTMLElement | null
          if (!c) return { tx: 'n/a', slide: 'n/a' }
          const tf = getComputedStyle(c).transform
          const tx = tf === 'none' ? 0 : new DOMMatrixReadOnly(tf).m41
          return { tx: Math.round(tx), slide: vp.clientWidth ? +(tx / vp.clientWidth).toFixed(2) : 'n/a' }
        }
        // [TEMP DEBUG] Ground truth: which book is physically at the viewport's left edge, plus how
        // loop has laid out every slide. DOM order is stable (slide 0..N); loop shifts each slide via
        // its own transform, so we read each slide's real rect to find what's actually visible.
        const physical = () => {
          const vpLeft = vp.getBoundingClientRect().left
          const slides = Array.from((vp.firstElementChild?.children ?? []) as unknown as HTMLElement[])
          const rows = slides.map((s, domIdx) => {
            const alt = s.querySelector('img')?.getAttribute('alt')?.replace('Обложка книги: ', '') ?? '?'
            return { domIdx, alt, left: Math.round(s.getBoundingClientRect().left - vpLeft) }
          })
          const visible = rows.reduce((a, b) => (Math.abs(b.left) < Math.abs(a.left) ? b : a), rows[0])
          return { visibleDomIdx: visible?.domIdx, visibleBook: visible?.alt, slidesInView: api.slidesInView(), layout: rows }
        }
        console.log('[hero] embla inited, selectedSnap=', api.selectedScrollSnap(), 'expected', idx, '| visual', visual())
        api.on('reInit', () => console.log('[hero] embla reInit → selectedSnap=', api.selectedScrollSnap(), '| visual', visual()))
        requestAnimationFrame(() => console.log('[hero] +1rAF selectedSnap=', api.selectedScrollSnap(), '| visual', visual()))
        window.setTimeout(() => console.log('[hero] +200ms selectedSnap=', api.selectedScrollSnap(), '| visual', visual(), '| physical', physical()), 200)
        window.setTimeout(() => console.log('[hero] +500ms selectedSnap=', api.selectedScrollSnap(), '| visual', visual(), '| physical', physical()), 500)
        const onSelect = () => setActive(api.selectedScrollSnap())
        api.on('select', onSelect)
        api.on('reInit', onSelect)
        emblaApiRef.current = api
        setActive(idx)
        if (pendingScrollToRef.current != null) {
          api.scrollTo(pendingScrollToRef.current)
          pendingScrollToRef.current = null
        }
        // [TEMP DEBUG] catch WHO moves the track to slide 0. Tag the track; watch the viewport for
        // the container being replaced (React re-create) and for any inline-style/transform change.
        const track0 = vp.firstElementChild as HTMLElement | null
        track0?.setAttribute('data-hero-track', '1')
        const mo = new MutationObserver((muts) => {
          for (const mu of muts) {
            if (mu.type === 'childList' && mu.target === vp) {
              const nf = vp.firstElementChild as HTMLElement | null
              console.log('[hero] MUT viewport childList — container REPLACED?', {
                removed: mu.removedNodes.length, added: mu.addedNodes.length,
                stillTagged: nf?.getAttribute('data-hero-track'),
              })
            } else if (mu.type === 'attributes' && mu.attributeName === 'style') {
              const el = mu.target as HTMLElement
              if (el === vp.firstElementChild || el === track0) {
                console.log('[hero] MUT track style →', el.style.transform || '(empty)')
              }
            }
          }
        })
        mo.observe(vp, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] })
        window.setTimeout(() => mo.disconnect(), 1200)
      })
      .catch(() => {
        attachingRef.current = false
      })
  }, [count])

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
    setActive(index)
    const api = emblaApiRef.current
    if (api) {
      api.scrollTo(index)
      return
    }
    // Not attached yet: attach at the current position (seamless), then let Embla animate to the
    // clicked slide once it's live.
    pendingScrollToRef.current = index
    attachEmbla(currentBaselineIndex())
  }, [attachEmbla, currentBaselineIndex])

  const handleScroll = useCallback(() => {
    if (emblaApiRef.current) return // Embla owns the viewport now (native scroll is off)
    setActive(currentBaselineIndex()) // keep the active dot live during the drag
    if (!SCROLLEND_SUPPORTED) scheduleAttachFallback()
  }, [currentBaselineIndex, scheduleAttachFallback])

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (isInteractiveTarget(event.target)) return
    preload()
  }, [preload])

  // Attach Embla once the swipe has truly settled (scrollend), at the final landed slide.
  useEffect(() => {
    const vp = viewportRef.current
    if (!vp || !SCROLLEND_SUPPORTED) return
    const onScrollEnd = () => {
      if (emblaApiRef.current) return
      const idx = currentBaselineIndex()
      // [TEMP DEBUG] what the settled scroll position reads as, at the moment of attach.
      console.log('[hero] scrollend', { scrollLeft: vp.scrollLeft, clientWidth: vp.clientWidth, idx })
      attachEmbla(idx)
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
})

function isInteractiveTarget(target: EventTarget): boolean {
  return target instanceof Element && Boolean(target.closest('a, button'))
}

export default Slider
