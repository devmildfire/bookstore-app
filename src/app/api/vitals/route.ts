import { metrics } from '@/lib/metrics'

// Real-User-Monitoring sink: the browser beacons Core Web Vitals here (see
// components/common/WebVitals). We record them into Prometheus histograms →
// Grafana shows p75 (how CWV are defined). Public endpoint, so validate input;
// the `device` label is derived server-side from the UA (not client-controlled)
// to keep cardinality bounded. `page_type` is allow-listed for the same reason.
export const runtime = 'nodejs' // prom-client needs Node APIs

const noContent = () => new Response(null, { status: 204 })

// Allow-list matches the classifier in WebVitals/index.tsx — a public endpoint
// can't trust an arbitrary string label, or cardinality explodes.
const PAGE_TYPES = new Set([
  'home', 'book', 'author', 'authors', 'profile', 'payments', 'cart', 'checkout',
  'gift-cards', 'subscription', 'magazine', 'about', 'contacts', 'abzac',
  'suggest-manuscript', 'other',
])

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return noContent()
  }
  const { name, value, page_type } = (payload ?? {}) as {
    name?: unknown
    value?: unknown
    page_type?: unknown
  }
  if (typeof name !== 'string' || typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return noContent()
  }

  const device = /Mobi|Android|iPhone|iPad|iPod/i.test(request.headers.get('user-agent') ?? '')
    ? 'mobile'
    : 'desktop'
  const pageType = typeof page_type === 'string' && PAGE_TYPES.has(page_type) ? page_type : 'other'
  const sec = Math.min(value, 60_000) / 1000 // clamp absurd values, ms → s

  switch (name) {
    case 'LCP':
      metrics.vitals.lcp.observe({ device, pageType }, sec)
      break
    case 'INP':
      metrics.vitals.inp.observe({ device, pageType }, sec)
      break
    case 'FCP':
      metrics.vitals.fcp.observe({ device, pageType }, sec)
      break
    case 'TTFB':
      metrics.vitals.ttfb.observe({ device, pageType }, sec)
      break
    case 'CLS':
      metrics.vitals.cls.observe({ device, pageType }, Math.min(value, 10)) // unitless, no ms→s
      break
  }
  return noContent()
}
