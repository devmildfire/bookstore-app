import { Registry, Histogram, collectDefaultMetrics } from 'prom-client'

// Singleton Prometheus registry, shared by the /metrics scrape endpoint and the
// /api/vitals beacon handler. Both run in the same Node process under `next start`,
// so a module-level singleton works; we stash it on globalThis to survive dev
// hot-reload (which would otherwise re-run collectDefaultMetrics and throw).
type Vitals = Record<'lcp' | 'inp' | 'fcp' | 'ttfb' | 'cls', Histogram<'device'>>
type Metrics = { registry: Registry; vitals: Vitals }

const store = globalThis as unknown as { __chtivoMetrics?: Metrics }

function build(): Metrics {
  const registry = new Registry()
  collectDefaultMetrics({ register: registry }) // nodejs_* process metrics (bonus app/USE)

  const hist = (name: string, help: string, buckets: number[]) =>
    new Histogram({ name, help, labelNames: ['device'], buckets, registers: [registry] })

  const vitals: Vitals = {
    lcp: hist('web_vitals_lcp_seconds', 'Largest Contentful Paint (seconds)', [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 7.5, 10]),
    inp: hist('web_vitals_inp_seconds', 'Interaction to Next Paint (seconds)', [0.05, 0.1, 0.15, 0.2, 0.3, 0.5, 0.75, 1, 2]),
    fcp: hist('web_vitals_fcp_seconds', 'First Contentful Paint (seconds)', [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10]),
    ttfb: hist('web_vitals_ttfb_seconds', 'Time to First Byte (seconds)', [0.05, 0.1, 0.2, 0.3, 0.5, 0.75, 1, 2]),
    cls: hist('web_vitals_cls', 'Cumulative Layout Shift (unitless)', [0.01, 0.05, 0.1, 0.15, 0.25, 0.5, 0.75, 1]),
  }
  return { registry, vitals }
}

export const metrics: Metrics = store.__chtivoMetrics ?? (store.__chtivoMetrics = build())
