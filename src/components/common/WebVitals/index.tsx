'use client'

import { useEffect } from 'react'

// Real-User-Monitoring collector. Dynamically imports `web-vitals` AFTER hydration
// so it lands in a deferred chunk (zero impact on the initial bundle / LCP), then
// beacons each Core Web Vital to /api/vitals via sendBeacon (fire-and-forget, runs
// even on page unload). Mounted once in the root layout.
export default function WebVitals() {
  useEffect(() => {
    let cancelled = false
    void import('web-vitals')
      .then(({ onLCP, onINP, onCLS, onFCP, onTTFB }) => {
        if (cancelled) return
        const send = (metric: { name: string; value: number }) => {
          try {
            navigator.sendBeacon?.(
              '/api/vitals',
              JSON.stringify({ name: metric.name, value: metric.value }),
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
    return () => {
      cancelled = true
    }
  }, [])
  return null
}
