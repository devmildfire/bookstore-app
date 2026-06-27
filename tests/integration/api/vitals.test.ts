import { describe, it, expect } from 'vitest'
import { POST } from '@/app/api/vitals/route'
import { metrics } from '@/lib/metrics'

// App-edge test for the RUM beacon sink (/api/vitals). Pure (no Supabase) — it
// always answers 204, so the meaningful assertions are on the SIDE EFFECT: a
// well-formed metric is recorded into the Prometheus histogram; a malformed one
// is silently dropped. Validates the public-endpoint input hardening.

function post(body: unknown, ua = 'Mozilla/5.0 (X11; Linux x86_64)') {
  return POST(
    new Request('http://localhost/api/vitals', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'user-agent': ua },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  )
}

// Current `_count` for the LCP histogram at a given device label.
async function lcpCount(device: 'mobile' | 'desktop'): Promise<number> {
  const json = await metrics.registry.getMetricsAsJSON()
  const hist = json.find((m) => m.name === 'web_vitals_lcp_seconds')
  // prom-client's MetricValue type doesn't declare `metricName` (present at runtime
  // for histogram sub-series: _count / _sum / _bucket).
  const sample = hist?.values.find(
    (v) => (v as { metricName?: string }).metricName === 'web_vitals_lcp_seconds_count' && v.labels.device === device,
  )
  return (sample?.value as number) ?? 0
}

describe('/api/vitals', () => {
  it('records a valid LCP observation (204) and increments the histogram', async () => {
    const before = await lcpCount('desktop')
    const res = await post({ name: 'LCP', value: 1234 })
    expect(res.status).toBe(204)
    expect(await lcpCount('desktop')).toBe(before + 1)
  })

  it('derives device=mobile from the UA', async () => {
    const before = await lcpCount('mobile')
    const res = await post({ name: 'LCP', value: 1000 }, 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)')
    expect(res.status).toBe(204)
    expect(await lcpCount('mobile')).toBe(before + 1)
  })

  it('returns 204 and records NOTHING for malformed payloads', async () => {
    const before = await lcpCount('desktop')
    const bad: unknown[] = [
      'not json', // unparseable
      {}, // missing fields
      { name: 'LCP' }, // missing value
      { name: 'LCP', value: 'x' }, // value not a number
      { name: 'LCP', value: -1 }, // negative
      { name: 'LCP', value: Number.NaN }, // non-finite
      { name: 'NOT_A_METRIC', value: 1 }, // unknown metric → no switch case
    ]
    for (const payload of bad) {
      expect((await post(payload)).status).toBe(204)
    }
    expect(await lcpCount('desktop')).toBe(before) // unchanged — nothing recorded
  })
})
