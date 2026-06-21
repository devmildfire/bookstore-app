/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactElement } from 'react'
import type { SocialCardVariantConfig } from './cardTypes'
import type { SocialCardData } from './resolveSocialCard'

type FontSizes = {
  title: number
  subtitle: number
  description: number
}

function titleFontSize(title: string, variant: SocialCardVariantConfig): number {
  const length = title.length
  const compactScale = variant.width < 1000 ? 0.72 : 1
  const squareScale = variant.width === variant.height ? 1.08 : 1
  const base = length > 62 ? 58 : length > 42 ? 70 : length > 26 ? 82 : 96
  return Math.round(base * compactScale * squareScale)
}

function getFontSizes(card: SocialCardData, variant: SocialCardVariantConfig): FontSizes {
  const square = variant.width === variant.height
  const compact = variant.width < 1000
  return {
    title: titleFontSize(card.title, variant),
    subtitle: compact ? 30 : square ? 42 : 34,
    description: compact ? 22 : square ? 30 : 24,
  }
}

function brandMark(size: number): ReactElement {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(size * 0.08) }}>
      <div
        style={{
          width: Math.round(size * 0.62),
          height: Math.round(size * 0.24),
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{ width: '24%', height: '45%', background: '#a10202', transform: 'skewY(-24deg)' }} />
        <div style={{ width: '24%', height: '45%', background: '#c62828', transform: 'skewY(24deg)' }} />
        <div style={{ width: '24%', height: '45%', background: '#dcdcdc', transform: 'skewY(-24deg)' }} />
        <div style={{ width: '24%', height: '45%', background: '#f3f3f3', transform: 'skewY(24deg)' }} />
      </div>
      <span
        style={{
          fontFamily: 'Cheque, sans-serif',
          fontSize: size,
          lineHeight: 0.86,
          color: '#e0e0e0',
          letterSpacing: 0,
        }}
      >
        ЧТИВО
      </span>
    </div>
  )
}

function background(width: number, height: number): ReactElement {
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width, height, display: 'flex' }}>
      {/* ponytail: decorative brand layers, delete if visual QA says the plain dark gradient is enough. */}
      <div
        style={{
          position: 'absolute',
          left: -width * 0.2,
          top: -height * 0.24,
          width: width * 0.68,
          height: height * 0.7,
          borderRadius: width,
          background: 'radial-gradient(circle, rgba(161, 2, 2, 0.34), rgba(161, 2, 2, 0) 67%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -width * 0.18,
          bottom: -height * 0.28,
          width: width * 0.64,
          height: height * 0.72,
          borderRadius: width,
          background: 'radial-gradient(circle, rgba(198, 40, 40, 0.2), rgba(198, 40, 40, 0) 65%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.16,
          backgroundImage:
            'linear-gradient(115deg, transparent 0 46%, rgba(220, 220, 220, 0.16) 47%, transparent 48% 100%)',
          backgroundSize: `${Math.max(120, width * 0.12)}px ${Math.max(120, height * 0.16)}px`,
        }}
      />
    </div>
  )
}

function imageFrame(card: SocialCardData, square: boolean, compact: boolean): ReactElement | null {
  if (!card.imageUrl) return null

  const book = card.kind === 'book'
  const width = square ? '62%' : compact ? '34%' : book ? '30%' : '38%'
  const right = square ? '19%' : compact ? '50px' : '74px'
  const top = square ? '96px' : compact ? '50px' : '74px'
  const bottom = compact ? '50px' : '74px'
  const height = '46%'

  const frameStyle: CSSProperties = {
    position: 'absolute',
    right,
    top,
    width,
    overflow: 'hidden',
    border: '1px solid rgba(220, 220, 220, 0.18)',
    boxShadow: '0 28px 90px rgba(0, 0, 0, 0.58)',
    background: '#121212',
    display: 'flex',
  }

  if (square) {
    frameStyle.height = height
  } else {
    frameStyle.bottom = bottom
  }

  if (book) {
    frameStyle.padding = square ? 34 : compact ? 20 : 28
    frameStyle.justifyContent = 'center'
    frameStyle.alignItems = 'center'
  }

  return (
    <div style={frameStyle}>
      <img
        src={card.imageUrl}
        alt=''
        style={{
          width: '100%',
          height: '100%',
          objectFit: book ? 'contain' : 'cover',
          filter: book ? 'none' : 'saturate(0.84) contrast(1.08)',
        }}
      />
      {!book && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 42%, rgba(0, 0, 0, 0.48) 100%)',
          }}
        />
      )}
    </div>
  )
}

export function renderSocialCard(card: SocialCardData, variant: SocialCardVariantConfig): ReactElement {
  const { width, height } = variant
  const square = width === height
  const compact = width < 1000
  const sizes = getFontSizes(card, variant)
  const hasImage = Boolean(card.imageUrl)

  const contentStyle: CSSProperties = {
    position: 'absolute',
    left: compact ? 50 : 74,
    top: square && hasImage ? height * 0.55 : compact ? 54 : 86,
    right: square ? 74 : hasImage ? (compact ? width * 0.42 : width * 0.46) : 74,
    bottom: compact ? 42 : 72,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  }

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        display: 'flex',
        overflow: 'hidden',
        color: '#e0e0e0',
        fontFamily: 'Arial, sans-serif',
        // Dark base lives on the root (which has explicit width/height) — satori
        // cannot size a gradient on an inset:0 child, which left cards white.
        background: 'linear-gradient(135deg, #080808 0%, #141414 46%, #1a0f0f 100%)',
      }}
    >
      {background(width, height)}
      <div style={{ position: 'absolute', left: compact ? 48 : 74, top: compact ? 34 : 52, display: 'flex' }}>
        {brandMark(compact ? 30 : square ? 46 : 38)}
      </div>

      {imageFrame(card, square, compact)}

      {!hasImage && (
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            right: square ? 120 : 92,
            top: square ? 188 : 156,
            fontFamily: 'Cheque, sans-serif',
            fontSize: square ? 238 : compact ? 112 : 188,
            lineHeight: 0.86,
            color: 'rgba(224, 224, 224, 0.08)',
          }}
        >
          Ч
        </div>
      )}

      <div style={contentStyle}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: compact ? 18 : 26,
            color: '#c62828',
            fontSize: compact ? 18 : 22,
            fontWeight: 700,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
          }}
        >
          <span style={{ width: compact ? 34 : 48, height: 3, background: '#a10202' }} />
          <span>{card.kicker}</span>
        </div>

        <div
          style={{
            fontFamily: 'Cheque, Arial, sans-serif',
            fontSize: sizes.title,
            lineHeight: 0.92,
            color: '#f0f0f0',
            letterSpacing: 0,
            marginBottom: compact ? 16 : 22,
            maxHeight: square ? 330 : compact ? 166 : 260,
            overflow: 'hidden',
          }}
        >
          {card.title}
        </div>

        {card.subtitle && (
          <div
            style={{
              fontSize: sizes.subtitle,
              lineHeight: 1.16,
              fontWeight: 700,
              color: '#dcdcdc',
              marginBottom: compact ? 12 : 18,
            }}
          >
            {card.subtitle}
          </div>
        )}

        {card.description && !compact && (
          <div
            style={{
              maxWidth: square ? '100%' : hasImage ? '92%' : '76%',
              fontSize: sizes.description,
              lineHeight: 1.36,
              color: 'rgba(220, 220, 220, 0.72)',
            }}
          >
            {card.description}
          </div>
        )}
      </div>
    </div>
  )
}
