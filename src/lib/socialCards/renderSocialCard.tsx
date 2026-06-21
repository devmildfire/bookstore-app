/* eslint-disable @next/next/no-img-element */
/**
 * REFERENCE IMPLEMENTATION — Чтиво social sharing cards (redesign).
 *
 * Drop-in replacement for `src/lib/socialCards/renderSocialCard.tsx`.
 * Renders inside next/og (satori). It mirrors the design file
 * `Social Cards.dc.html` 1:1 — every number here is the native (1200-wide)
 * pixel value from that prototype. Verify the output in satori and nudge if a
 * glyph metric differs; satori's text metrics are close but not identical to a
 * browser's.
 *
 * SATORI NOTES
 *  - Every element with >1 child MUST have `display: 'flex'`.
 *  - satori supports inline <svg> with <path> + fill-opacity (used for the
 *    diamond logo and the 3-leaf journal mark). If a build of satori chokes on
 *    the inline SVG, swap to a data-URI <img> of the same asset.
 *  - Load BOTH fonts in the ImageResponse (see route note at bottom): the design
 *    uses Cheque (display) AND Montserrat (kicker / subtitle / description).
 *    The current route only loads Cheque — Montserrat text will fall back to a
 *    serving default until you add it.
 */
import type { CSSProperties, ReactElement } from 'react'
import type { SocialCardVariantConfig } from './cardTypes'
import type { SocialCardData } from './resolveSocialCard'

const R = Math.round
const ACCENT = '#A10202' // oxblood. brighter link-red is #C20000.

// Brand marks use INLINE <svg> with explicit width/height (satori scales the
// viewBox deterministically). NOTE: never give a style value `undefined` anywhere
// in this file — satori calls `.trim()` on every value and crashes on undefined.

/* ---------- type sizing ---------------------------------------------------- */

function titleFontSize(title: string, sq: boolean, cp: boolean): number {
  const L = (title ?? '').length
  const cs = cp ? 0.74 : 1
  const ss = sq ? 1.06 : 1
  const base = L > 64 ? 44 : L > 46 ? 52 : L > 30 ? 60 : L > 18 ? 68 : 88
  return R(base * cs * ss)
}

/* ---------- brand lockup (diamond glyph + ЧТИВО) --------------------------- */

function diamondGlyph(height: number): ReactElement {
  const width = R(height * 4.577)
  return (
    <div style={{ width, height, display: 'flex' }}>
      <svg viewBox="0 0 119 26" width={width} height={height} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M47 18.5L35.5 12.5L24 18.5L24 6.5L35.5 0L47 6.5L47 18.5Z" fill="#930000" />
        <path d="M95 18.5L83.5 12.5L72 18.5L72 6.5L83.5 0L95 6.5L95 18.5Z" fill="#F7F7F7" />
        <path d="M48 7L59.5 13L71 7V19L59.5 25.5L48 19V7Z" fill="#930000" />
        <path d="M96 7L107.5 13L119 7V19L107.5 25.5L96 19V7Z" fill="#F7F7F7" />
        <path d="M0 7L11.5 13L23 7V19L11.5 25.5L0 19V7Z" fill="#930000" />
      </svg>
    </div>
  )
}

function brandLockup(brandFont: number, showGlyph: boolean): ReactElement {
  const glyphH = R(brandFont * 0.72)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: R(brandFont * 0.42) }}>
      {showGlyph && diamondGlyph(glyphH)}
      <span style={{ fontFamily: 'Cheque, sans-serif', fontSize: brandFont, lineHeight: 0.8, color: '#e6e6e6' }}>
        ЧТИВО
      </span>
    </div>
  )
}

/* The 3-leaf "Russian Dinosaur" journal mark (assets/mrd.svg). */
const MRD_PATH =
  'M17.2309 0.675515C13.1857 11.586 11.4013 26.1554 12.3358 40.6448C12.8709 48.942 14.3219 56.8517 16.5204 63.456C16.9048 64.6105 17.4684 66.158 17.5045 66.158C17.5305 66.158 17.961 64.9927 18.2979 64.0103C21.9763 53.2864 23.5607 39.3338 22.6693 25.5132C22.1342 17.216 20.6832 9.30629 18.4848 2.70207C18.1004 1.54735 17.5369 0 17.5007 0C17.4901 0 17.3687 0.303997 17.2309 0.675515ZM0.218823 26.8971C0.209553 26.9573 0.182837 27.2113 0.159404 27.4615C-0.350954 32.9132 0.373272 39.5208 2.20136 46.0916C3.60443 51.1349 5.5652 55.785 7.91013 59.6304C8.34293 60.3401 9.21716 61.642 9.24245 61.6145C9.26303 61.5922 9.33257 60.8948 9.38355 60.1993C9.50298 58.5702 9.50292 56.3336 9.38323 54.4538C9.02767 48.8672 7.67586 42.7041 5.59324 37.1748C4.3151 33.7813 2.82491 30.7533 1.12796 28.1015C0.860741 27.684 0.315033 26.8754 0.257399 26.8118C0.245423 26.7985 0.228064 26.8369 0.218823 26.8971ZM34.5082 27.17C34.1528 27.6808 33.7368 28.3241 33.345 28.969C28.0869 37.6212 24.9178 50.4912 25.6376 60.2692C25.6875 60.9465 25.7534 61.6054 25.7733 61.625C25.7903 61.6418 26.3933 60.7568 26.7933 60.1281C30.0546 55.0022 32.7126 47.9275 34.0385 40.8439C34.5209 38.2666 34.7797 36.1861 34.9498 33.5199C34.9995 32.7389 35.0178 30.1205 34.9792 29.2961C34.9264 28.1684 34.814 26.8216 34.7727 26.8216C34.7605 26.8216 34.6415 26.9784 34.5082 27.17Z'

function mrdMark(height: number, color: string, fillOpacity = 1): ReactElement {
  const width = R(height * 0.522)
  return (
    <div style={{ width, height, display: 'flex' }}>
      <svg viewBox="0 0 35 67" width={width} height={height} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d={MRD_PATH} fill={color} fillOpacity={fillOpacity} />
      </svg>
    </div>
  )
}

/* The big translucent watermark logo used on the home cards. */
// Centered via EXPLICIT left/top (not flex justify-center): satori does not reliably
// center a near-full-width child, and it can't size a `inset:0` absolute box — both
// left-anchored the watermark. Compute the offset from the card dimensions instead.
function watermarkLogo(glyphW: number, cardW: number, cardH: number): ReactElement {
  const glyphH = R(glyphW / 4.577)
  const left = R((cardW - glyphW) / 2)
  const top = R((cardH - glyphH) / 2)
  return (
    <div style={{ position: 'absolute', left, top, width: glyphW, height: glyphH, display: 'flex', zIndex: 0 }}>
      <svg viewBox="0 0 119 26" width={glyphW} height={glyphH} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M47 18.5L35.5 12.5L24 18.5L24 6.5L35.5 0L47 6.5L47 18.5Z" fill="#C20000" fillOpacity={0.8} />
        <path d="M95 18.5L83.5 12.5L72 18.5L72 6.5L83.5 0L95 6.5L95 18.5Z" fill="#F2F2F2" fillOpacity={0.2} />
        <path d="M48 7L59.5 13L71 7V19L59.5 25.5L48 19V7Z" fill="#C20000" fillOpacity={0.8} />
        <path d="M96 7L107.5 13L119 7V19L107.5 25.5L96 19V7Z" fill="#F2F2F2" fillOpacity={0.2} />
        <path d="M0 7L11.5 13L23 7V19L11.5 25.5L0 19V7Z" fill="#C20000" fillOpacity={0.8} />
      </svg>
    </div>
  )
}

/* ---------- main ----------------------------------------------------------- */

type Visual = 'ghost' | 'cover' | 'circle' | 'landscape'

function visualFor(kind: SocialCardData['kind']): Visual {
  if (kind === 'home') return 'ghost'
  if (kind === 'author') return 'circle'
  if (kind === 'article') return 'landscape'
  return 'cover' // book + periodical
}

export function renderSocialCard(card: SocialCardData, variant: SocialCardVariantConfig): ReactElement {
  const { width: w, height: h } = variant
  const sq = w === h
  const cp = w < 1000
  const home = card.kind === 'home'
  // The journal/periodical and рассказ (article) cards carry the 3-leaf mark in
  // their kicker. Set `card.kickerMark` in resolveSocialCard for those kinds.
  const kickerMark = Boolean((card as { kickerMark?: boolean }).kickerMark)
  const visual = visualFor(card.kind)
  const hasImage = Boolean(card.imageUrl) && visual !== 'ghost'

  const padL = cp ? 50 : sq ? 86 : 74
  const brandTop = cp ? 34 : sq ? 60 : 52
  const brandFont = cp ? 42 : sq ? 72 : 62
  const brandCentered = sq || home

  const tF = titleFontSize(card.title, sq, cp)
  const kF = cp ? 16 : sq ? 23 : 20
  const sF = cp ? 25 : sq ? 37 : 31
  const dF = sq ? 29 : 23
  const showDesc = Boolean(card.description) && !cp && !sq
  const showMeta = !cp

  const media: ReactElement[] = []
  let contentRight = padL
  let contentTop = 0
  let contentBottom = cp ? 42 : 72
  let contentJustify: CSSProperties['justifyContent'] = 'flex-end'
  const contentAlign = brandCentered ? 'center' : 'flex-start'
  const textAlign = (brandCentered ? 'center' : 'left') as CSSProperties['textAlign']

  if (sq) {
    contentJustify = 'flex-start'
    contentBottom = R(h * 0.08)
    const sqTop = R(h * 0.15)
    if (visual === 'cover' && hasImage) {
      const ch = R(h * 0.45)
      const cw = R(ch * 0.6667)
      const left = R((w - cw) / 2)
      media.push(<div key="g" style={{ position: 'absolute', left: left - 40, top: sqTop - 40, width: cw + 80, height: ch + 80, background: `radial-gradient(ellipse at center, ${ACCENT}59, ${ACCENT}00 70%)`, display: 'flex', zIndex: 1 }} />)
      media.push(coverEl(card.imageUrl!, { left, top: sqTop, width: cw, height: ch }))
      contentTop = sqTop + ch + R(h * 0.05)
    } else if (visual === 'circle' && hasImage) {
      const D = R(w * 0.48)
      media.push(circleEl(card.imageUrl!, { left: R((w - D) / 2), top: sqTop, width: D, height: D }))
      contentTop = sqTop + D + R(h * 0.05)
    } else if (visual === 'landscape' && hasImage) {
      const lw = w - padL * 2
      const lh = R(lw * 0.5)
      media.push(landscapeEl(card.imageUrl!, { left: padL, top: sqTop, width: lw, height: lh }))
      contentTop = sqTop + lh + R(h * 0.05)
    } else {
      // home / no image: centered watermark logo
      media.push(<div key="wm" style={{ display: 'flex' }}>{watermarkLogo(R(w * 0.9), w, h)}</div>)
      contentTop = R(h * 0.45)
    }
  } else {
    const mTop = cp ? 34 : 44
    const areaH = h - mTop * 2
    if (visual === 'cover' && hasImage) {
      const ch = areaH
      const cw = R(ch * 0.6667)
      const top = R((h - ch) / 2)
      const right = cp ? 40 : 64
      media.push(<div key="g" style={{ position: 'absolute', right: right - 30, top: top - 30, width: cw + 60, height: ch + 60, background: `radial-gradient(ellipse at center, ${ACCENT}4d, ${ACCENT}00 70%)`, display: 'flex', zIndex: 1 }} />)
      media.push(coverEl(card.imageUrl!, { right, top, width: cw, height: ch }))
      contentRight = w - right - cw - (cp ? 26 : 40)
    } else if (visual === 'circle' && hasImage) {
      const D = Math.min(areaH, R(w * 0.48))
      const right = cp ? 40 : R(w * 0.05)
      media.push(circleEl(card.imageUrl!, { right, top: R((h - D) / 2), width: D, height: D }))
      contentRight = w - right - D - (cp ? 24 : 40)
    } else if (visual === 'landscape' && hasImage) {
      const lw = R(w * 0.47)
      const lh = R(lw * 0.68)
      const right = cp ? 40 : 64
      media.push(landscapeEl(card.imageUrl!, { right, top: R((h - lh) / 2), width: lw, height: lh }))
      contentRight = w - right - lw - (cp ? 24 : 40)
    } else {
      media.push(<div key="wm" style={{ display: 'flex' }}>{watermarkLogo(R(w * (cp ? 1.0 : 0.96)), w, h)}</div>)
      contentRight = padL
    }
    contentTop = brandTop + brandFont + (cp ? 24 : 42)
    if (home) contentJustify = 'center'
  }

  return (
    <div
      style={{
        position: 'relative',
        width: w,
        height: h,
        display: 'flex',
        overflow: 'hidden',
        color: '#e0e0e0',
        fontFamily: 'Montserrat, sans-serif',
        background: 'linear-gradient(341deg, #161616 6%, #000000 94%)',
      }}
    >
      {media}

      {/* brand lockup — top, centered on home + square, else top-left */}
      <div
        style={{
          position: 'absolute',
          top: brandTop,
          left: brandCentered ? 0 : padL,
          ...(brandCentered ? { right: 0 } : {}),
          display: 'flex',
          justifyContent: brandCentered ? 'center' : 'flex-start',
          zIndex: 6,
        }}
      >
        {brandLockup(brandFont, !home /* hide small glyph on home — watermark carries it */)}
      </div>

      {/* content block */}
      <div
        style={{
          position: 'absolute',
          left: padL,
          right: contentRight,
          top: contentTop,
          bottom: contentBottom,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: contentJustify,
          alignItems: contentAlign,
          textAlign,
          zIndex: 5,
        }}
      >
        {/* kicker: 3-leaf mark (journal/рассказ) OR red tick, then label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: cp ? 10 : 14, marginBottom: cp ? 14 : 22, justifyContent: brandCentered ? 'center' : 'flex-start' }}>
          {kickerMark ? mrdMark(R(kF * 1.55), ACCENT) : <span style={{ width: cp ? 30 : 46, height: 3, background: ACCENT, display: 'flex' }} />}
          <span style={{ fontSize: kF, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: '#cfcfcf', display: 'flex' }}>
            {card.kicker}
          </span>
        </div>

        <div
          style={{
            fontFamily: 'Cheque, sans-serif',
            fontSize: tF,
            lineHeight: 1.12,
            paddingBottom: R(tF * 0.08),
            color: '#f1f1f1',
            marginBottom: cp ? 12 : 18,
            flexShrink: 0,
            maxHeight: sq ? 540 : cp ? 220 : 380,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {card.title}
        </div>

        {card.subtitle && (
          <div style={{ fontSize: sF, fontWeight: 700, lineHeight: 1.15, color: '#dadada', marginBottom: cp ? 10 : 16, display: 'flex' }}>
            {card.subtitle}
          </div>
        )}

        {showDesc && card.description && (
          <div
            style={{
              fontSize: dF,
              lineHeight: 1.4,
              color: 'rgba(220,220,220,0.66)',
              maxWidth: '100%',
              flexShrink: 1,
              maxHeight: R(dF * 1.4 * 2),
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {card.description}
          </div>
        )}
      </div>

      {/* baseline meta */}
      {showMeta && (
        <div
          style={{
            position: 'absolute',
            left: brandCentered ? 0 : padL,
            ...(brandCentered ? { right: 0 } : {}),
            bottom: sq ? 44 : 40,
            fontSize: sq ? 19 : 18,
            letterSpacing: 1.2,
            color: 'rgba(220,220,220,0.32)',
            display: 'flex',
            justifyContent: brandCentered ? 'center' : 'flex-start',
            zIndex: 5,
          }}
        >
          chtivo.ru
        </div>
      )}
    </div>
  )
}

/* ---------- media frames --------------------------------------------------- */

type Box = { left?: number; right?: number; top: number; width: number; height: number }

function coverEl(src: string, box: Box): ReactElement {
  return (
    <div key="cover" style={{ position: 'absolute', ...box, overflow: 'hidden', border: '1px solid rgba(220,220,220,0.12)', boxShadow: '0 24px 70px rgba(0,0,0,0.6)', display: 'flex', zIndex: 2 }}>
      <img src={src} alt="" width={box.width} height={box.height} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  )
}

function circleEl(src: string, box: Box): ReactElement {
  return (
    <div key="circle" style={{ position: 'absolute', ...box, borderRadius: box.width, overflow: 'hidden', border: '1px solid rgba(220,220,220,0.14)', boxShadow: '0 24px 60px rgba(0,0,0,0.55)', display: 'flex', zIndex: 2 }}>
      <img src={src} alt="" width={box.width} height={box.height} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  )
}

function landscapeEl(src: string, box: Box): ReactElement {
  return (
    <div key="land" style={{ position: 'absolute', ...box, overflow: 'hidden', border: '1px solid rgba(220,220,220,0.12)', boxShadow: '0 24px 70px rgba(0,0,0,0.55)', display: 'flex', zIndex: 2 }}>
      <img src={src} alt="" width={box.width} height={box.height} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  )
}
