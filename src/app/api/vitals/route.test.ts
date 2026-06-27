import { describe, it, expect } from 'vitest'
import { POST } from './route'
import { metrics } from '@/lib/metrics'

const post = (body: unknown, ua = 'Mozilla/5.0') =>
  POST(
    new Request('http://localhost/api/vitals', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'user-agent': ua },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  )

// Current `_count` of the desktop LCP histogram — proves a metric was actually
// RECORDED (the metric line exists once registered, so a `toContain` check alone
// doesn't prove an observation happened).
async function lcpDesktopCount(): Promise<number> {
  const hist = (await metrics.registry.getMetricsAsJSON()).find((m) => m.name === 'web_vitals_lcp_seconds')
  const sample = hist?.values.find(
    // prom-client's type omits `metricName` (present at runtime for _count/_sum/_bucket).
    (v) => (v as { metricName?: string }).metricName === 'web_vitals_lcp_seconds_count' && v.labels.device === 'desktop',
  )
  return (sample?.value as number) ?? 0
}

describe('POST /api/vitals', () => {
  it('records a valid LCP from a mobile UA and returns 204', async () => {
    const res = await post({ name: 'LCP', value: 2300, page_type: 'home' }, 'Mozilla/5.0 (iPhone)')
    expect(res.status).toBe(204)
    const out = await metrics.registry.metrics()
    expect(out).toContain('web_vitals_lcp_seconds')
    expect(out).toContain('device="mobile"')
    expect(out).toContain('pageType="home"')
  })

  it('records CLS (unitless) from a desktop UA with page_type', async () => {
    const res = await post({ name: 'CLS', value: 0.05, page_type: 'cart' }, 'Mozilla/5.0 (X11; Linux x86_64)')
    expect(res.status).toBe(204)
    const out = await metrics.registry.metrics()
    expect(out).toContain('web_vitals_cls')
    expect(out).toContain('pageType="cart"')
  })

  it('falls back to pageType="other" for an invalid page_type', async () => {
    await post({ name: 'CLS', value: 0.1, page_type: 'javascript:alert(1)' })
    const out = await metrics.registry.metrics()
    expect(out).toContain('pageType="other"')
  })

  it('falls back to pageType="other" when page_type is missing', async () => {
    await post({ name: 'CLS', value: 0.1 })
    const out = await metrics.registry.metrics()
    expect(out).toContain('pageType="other"')
  })

  it('ignores invalid payloads without throwing (still 204)', async () => {
    expect((await post({ name: 'LCP', value: -1 })).status).toBe(204) // negative
    expect((await post({ name: 'LCP', value: 'x' })).status).toBe(204) // non-number
    expect((await post({ name: 'BOGUS', value: 1 })).status).toBe(204) // unknown metric
    expect((await post('not-json')).status).toBe(204) // unparseable body
  })

  it('records exactly one observation for a valid payload and nothing for malformed', async () => {
    const before = await lcpDesktopCount()
    await post({ name: 'LCP', value: 1200 }) // default UA → desktop
    expect(await lcpDesktopCount()).toBe(before + 1)

    const afterValid = await lcpDesktopCount()
    for (const bad of [{ name: 'LCP' }, { name: 'LCP', value: -1 }, { name: 'BOGUS', value: 1 }, 'not-json']) {
      await post(bad)
    }
    expect(await lcpDesktopCount()).toBe(afterValid) // unchanged — nothing recorded
  })
})
