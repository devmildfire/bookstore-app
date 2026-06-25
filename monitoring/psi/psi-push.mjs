// Synthetic PSI probe → Pushgateway. Runs N cache-busted PageSpeed Insights mobile
// traces, pushes the MEDIAN (never a single run — see docs/perf/psi-baseline.md) as
// gauges to the Pushgateway, which Prometheus scrapes. Pure Node (no deps); run in a
// node container by the crontab. Service-account key + scope per the PSI access note.
import crypto from 'node:crypto'
import fs from 'node:fs'

const KEY_PATH = process.env.PSI_KEY || '/psi/sa-key.json'
const PUSHGATEWAY = process.env.PUSHGATEWAY || 'http://pushgateway:9091'
const TARGET = process.env.TARGET_URL || 'https://bookstore-app.mildfire.dev/'
const STRATEGY = process.env.STRATEGY || 'mobile'
const N = Number(process.env.N || 8)
const CONCURRENCY = 4

const KEY = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'))
const b64 = (x) => Buffer.from(x).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const median = (a) => { const s = [...a].sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2 }

async function mintToken() {
  const now = Math.floor(Date.now() / 1000)
  const head = b64(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claim = b64(JSON.stringify({ iss: KEY.client_email, scope: 'openid', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }))
  const signer = crypto.createSign('RSA-SHA256'); signer.update(`${head}.${claim}`)
  const jwt = `${head}.${claim}.${b64(signer.sign(KEY.private_key))}`
  const res = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }) })
  const j = await res.json()
  if (!j.access_token) throw new Error('token mint failed: ' + JSON.stringify(j))
  return j.access_token
}

async function runOne(token, i) {
  const url = `${TARGET}?psi=syn-${Date.now()}-${i}`
  const api = `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${STRATEGY}&category=performance`
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(api, { headers: { Authorization: `Bearer ${token}` } })
      const j = await res.json()
      if (j.error) { await sleep(1500 * (attempt + 1)); continue }
      const a = j.lighthouseResult.audits
      return {
        perf: Math.round(j.lighthouseResult.categories.performance.score * 100),
        lcp: a['largest-contentful-paint'].numericValue / 1000,
        fcp: a['first-contentful-paint'].numericValue / 1000,
        cls: a['cumulative-layout-shift'].numericValue,
        tbt: a['total-blocking-time'].numericValue / 1000,
        ttfb: (a['server-response-time']?.numericValue || 0) / 1000,
      }
    } catch { await sleep(1500 * (attempt + 1)) }
  }
  return null
}

async function main() {
  const token = await mintToken()
  const results = []
  const queue = Array.from({ length: N }, (_, i) => i)
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) { const i = queue.shift(); const r = await runOne(token, i); if (r) results.push(r) }
  }))
  if (!results.length) throw new Error('no successful PSI runs')

  const med = {}
  for (const k of ['perf', 'lcp', 'fcp', 'cls', 'tbt', 'ttfb']) med[k] = median(results.map((r) => r[k]))
  const L = `{strategy="${STRATEGY}"}`
  const body = [
    `# TYPE psi_performance_score gauge`, `psi_performance_score${L} ${med.perf}`,
    `# TYPE psi_lcp_seconds gauge`, `psi_lcp_seconds${L} ${med.lcp.toFixed(3)}`,
    `# TYPE psi_fcp_seconds gauge`, `psi_fcp_seconds${L} ${med.fcp.toFixed(3)}`,
    `# TYPE psi_cls gauge`, `psi_cls${L} ${med.cls.toFixed(4)}`,
    `# TYPE psi_tbt_seconds gauge`, `psi_tbt_seconds${L} ${med.tbt.toFixed(3)}`,
    `# TYPE psi_ttfb_seconds gauge`, `psi_ttfb_seconds${L} ${med.ttfb.toFixed(3)}`,
    `# TYPE psi_sample_runs gauge`, `psi_sample_runs${L} ${results.length}`,
    '',
  ].join('\n')

  const res = await fetch(`${PUSHGATEWAY}/metrics/job/psi_synthetic`, { method: 'PUT', headers: { 'Content-Type': 'text/plain' }, body })
  if (!res.ok) throw new Error(`push failed: ${res.status} ${await res.text()}`)
  console.log(`pushed: perf=${med.perf} lcp=${med.lcp.toFixed(2)}s fcp=${med.fcp.toFixed(2)}s cls=${med.cls.toFixed(3)} ttfb=${med.ttfb.toFixed(3)}s (n=${results.length})`)
}

main().catch((e) => { console.error(e.message); process.exit(1) })
