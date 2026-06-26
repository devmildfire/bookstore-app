'use client'

import { useEffect } from 'react'

// Real-User-Monitoring collector. Dynamically imports `web-vitals` AFTER hydration
// so it lands in a deferred chunk (zero impact on the initial bundle / LCP), then
// beacons each Core Web Vital to /api/vitals via sendBeacon (fire-and-forget, runs
// even on page unload). Mounted once in the root layout.

// Coarse page classifier → low-cardinality `page_type` label (≤20 values) for
// per-page CLS/LCP attribution in Grafana. Matches the allowlist in the vitals
// route handler. Never sends raw URLs (cardinality + privacy).
function pageType(): string {
  const p = window.location.pathname
  if (p === '/') return 'home'
  if (p.startsWith('/books/')) return 'book'
  if (p.startsWith('/authors/')) return 'author'
  if (p === '/authors') return 'authors'
  if (p.startsWith('/profile')) return 'profile'
  if (p.startsWith('/payments')) return 'payments'
  if (p === '/cart') return 'cart'
  if (p === '/checkout') return 'checkout'
  if (p === '/gift-cards') return 'gift-cards'
  if (p === '/subscription') return 'subscription'
  if (p === '/dino-magazine') return 'magazine'
  if (p === '/about') return 'about'
  if (p === '/contacts') return 'contacts'
  if (p === '/abzac') return 'abzac'
  if (p === '/suggest-manuscript') return 'suggest-manuscript'
  return 'other'
}

export default function WebVitals() {
  useEffect(() => {
    void import('web-vitals')
      .then(({ onLCP, onINP, onCLS, onFCP, onTTFB }) => {
        const pt = pageType()
        const send = (metric: { name: string; value: number }) => {
          try {
            navigator.sendBeacon?.(
              '/api/vitals',
              JSON.stringify({ name: metric.name, value: metric.value, page_type: pt }),
            )
          } catch {
            // RUM is best-effort; never let it surface to the user
          }
        }
        onLCP(send)
        onINP(send)
        onCLS(send)
        onFCP(send)
        onTTFB(send)
      })
      .catch(() => {})
  }, [])
  return null
}
