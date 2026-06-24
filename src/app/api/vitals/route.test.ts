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

describe('POST /api/vitals', () => {
  it('records a valid LCP from a mobile UA and returns 204', async () => {
    const res = await post({ name: 'LCP', value: 2300 }, 'Mozilla/5.0 (iPhone)')
    expect(res.status).toBe(204)
    const out = await metrics.registry.metrics()
    expect(out).toContain('web_vitals_lcp_seconds')
    expect(out).toContain('device="mobile"')
  })

  it('records CLS (unitless) from a desktop UA', async () => {
    const res = await post({ name: 'CLS', value: 0.05 }, 'Mozilla/5.0 (X11; Linux x86_64)')
    expect(res.status).toBe(204)
    expect(await metrics.registry.metrics()).toContain('web_vitals_cls')
  })

  it('ignores invalid payloads without throwing (still 204)', async () => {
    expect((await post({ name: 'LCP', value: -1 })).status).toBe(204) // negative
    expect((await post({ name: 'LCP', value: 'x' })).status).toBe(204) // non-number
    expect((await post({ name: 'BOGUS', value: 1 })).status).toBe(204) // unknown metric
    expect((await post('not-json')).status).toBe(204) // unparseable body
  })
})
