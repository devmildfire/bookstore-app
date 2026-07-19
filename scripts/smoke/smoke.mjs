#!/usr/bin/env node
// Infra smoke tests — assert each service's REAL behaviour (not just that a
// process is up). This is the reusable core Phase 0.2 builds: the SAME harness
// gates a candidate infra image in CI (Phase 0.3), gates the blue-green switch
// (Phase 1), and verifies a manual prod sync. See docs/plans/infra-image-automation.md.
//
// Portable on purpose: Node 22 global fetch, ZERO dependencies, exit code 0 iff
// every SELECTED, RUNNABLE check passed. So it runs anywhere node runs — a CI
// job, the VPS during a switch, or your laptop against prod.
//
// A check that hits a service THROUGH kong also proves kong routed it and
// preserved the apikey header — so the gateway is covered transitively.
//
// ── Config (env) ──────────────────────────────────────────────────────────────
//   SMOKE_APP_URL   Next.js app base       e.g. https://bookstore-app.mildfire.dev
//   SMOKE_API_URL   Supabase API (kong)    e.g. https://api.mildfire.dev
//   SUPABASE_ANON_KEY          anon apikey — enables the postgrest data check
//   SMOKE_NGINX_URL (optional) internal nginx base for the /healthz probe (CI only)
// A check whose required config is absent is SKIPPED (reported, not failed),
// unless --strict, which turns skips into failures (use in CI where all config exists).
//
// ── Usage ─────────────────────────────────────────────────────────────────────
//   node scripts/smoke/smoke.mjs                 # all checks, current env
//   node scripts/smoke/smoke.mjs --only app,gotrue
//   node scripts/smoke/smoke.mjs --list
//   node scripts/smoke/smoke.mjs --strict        # skips count as failures

const env = process.env
const args = process.argv.slice(2)
const only = (args.find((a) => a.startsWith('--only='))?.slice(7) ?? '')
  .split(',').map((s) => s.trim()).filter(Boolean)
const onlyIdx = args.indexOf('--only')
if (onlyIdx !== -1 && args[onlyIdx + 1]) only.push(...args[onlyIdx + 1].split(',').map((s) => s.trim()))
const strict = args.includes('--strict')
const list = args.includes('--list')

const APP = env.SMOKE_APP_URL?.replace(/\/$/, '')
const API = env.SMOKE_API_URL?.replace(/\/$/, '')
const ANON = env.SUPABASE_ANON_KEY
const NGINX = env.SMOKE_NGINX_URL?.replace(/\/$/, '')

const TIMEOUT_MS = 12_000

async function http(url, { headers } = {}) {
  const ctl = AbortSignal.timeout(TIMEOUT_MS)
  const res = await fetch(url, { headers, redirect: 'manual', signal: ctl })
  return res
}

// Each check: { name, need: () => baseUrl|undefined (skip reason if falsy), run: async () => detail-string (throw to fail) }
const CHECKS = [
  {
    name: 'app',
    why: 'Next.js liveness — dependency-free /api/health returns 200 {status:ok}',
    need: () => APP && `SMOKE_APP_URL=${APP}`,
    run: async () => {
      const r = await http(`${APP}/api/health`)
      if (r.status !== 200) throw new Error(`GET /api/health → ${r.status} (expected 200; is the app image with the health route deployed?)`)
      const body = await r.json().catch(() => ({}))
      if (body.status !== 'ok') throw new Error(`/api/health body ${JSON.stringify(body)} — expected {status:"ok"}`)
      return '/api/health 200 {status:ok}'
    },
  },
  {
    name: 'gotrue',
    why: 'Auth reachable THROUGH kong — /auth/v1/health 200',
    need: () => API && `SMOKE_API_URL=${API}`,
    run: async () => {
      const r = await http(`${API}/auth/v1/health`)
      if (r.status !== 200) throw new Error(`GET /auth/v1/health → ${r.status} (expected 200)`)
      return '/auth/v1/health 200'
    },
  },
  {
    name: 'postgrest',
    why: 'PostgREST serving THROUGH kong — /rest/v1/ 200',
    need: () => API && `SMOKE_API_URL=${API}`,
    run: async () => {
      const r = await http(`${API}/rest/v1/`)
      if (r.status !== 200) throw new Error(`GET /rest/v1/ → ${r.status} (expected 200)`)
      return '/rest/v1/ 200'
    },
  },
  {
    name: 'postgrest-data',
    why: 'kong forwards the apikey AND postgrest queries the DB — a real anon row read',
    need: () => (API && ANON) ? `SMOKE_API_URL + SUPABASE_ANON_KEY` : undefined,
    run: async () => {
      const r = await http(`${API}/rest/v1/Titles?select=id&limit=1`, { headers: { apikey: ANON, Authorization: `Bearer ${ANON}` } })
      if (r.status !== 200) throw new Error(`GET /rest/v1/Titles → ${r.status} (expected 200 — apikey forwarded + anon RLS read)`)
      const rows = await r.json().catch(() => null)
      if (!Array.isArray(rows)) throw new Error(`/rest/v1/Titles body is not a JSON array: ${JSON.stringify(rows)?.slice(0, 120)}`)
      return `Titles read ok (${rows.length} row)`
    },
  },
  {
    name: 'storage',
    why: 'storage-api serving THROUGH kong — /storage/v1/status 200',
    need: () => API && `SMOKE_API_URL=${API}`,
    run: async () => {
      const r = await http(`${API}/storage/v1/status`)
      if (r.status !== 200) throw new Error(`GET /storage/v1/status → ${r.status} (expected 200)`)
      return '/storage/v1/status 200'
    },
  },
  {
    name: 'kong',
    why: 'kong IS the gateway — an unrouted path returns kong\'s 404, proving it responds',
    need: () => API && `SMOKE_API_URL=${API}`,
    run: async () => {
      const r = await http(`${API}/`)
      if (r.status !== 404) throw new Error(`GET / → ${r.status} (expected 404 = kong "no Route matched"; a 502/timeout would mean the gateway is down)`)
      return '/ 404 (kong responding)'
    },
  },
  {
    name: 'nginx',
    why: 'nginx serving — internal /healthz 200 (CI/internal only; publicly it is covered transitively by app+api)',
    need: () => NGINX ? `SMOKE_NGINX_URL=${NGINX}` : undefined,
    run: async () => {
      const r = await http(`${NGINX}/healthz`)
      if (r.status !== 200) throw new Error(`GET /healthz → ${r.status} (expected 200)`)
      return '/healthz 200'
    },
  },
]

function selected() {
  return only.length ? CHECKS.filter((c) => only.includes(c.name)) : CHECKS
}

if (list) {
  for (const c of CHECKS) console.log(`  ${c.name.padEnd(14)} ${c.why}`)
  process.exit(0)
}

const results = []
for (const c of selected()) {
  const reason = c.need()
  if (!reason) {
    results.push({ name: c.name, state: strict ? 'FAIL' : 'SKIP', detail: 'missing config' })
    continue
  }
  try {
    const detail = await c.run()
    results.push({ name: c.name, state: 'PASS', detail })
  } catch (e) {
    results.push({ name: c.name, state: 'FAIL', detail: e instanceof Error ? e.message : String(e) })
  }
}

const icon = { PASS: '✓', FAIL: '✗', SKIP: '–' }
for (const r of results) console.log(`  ${icon[r.state]} ${r.name.padEnd(14)} ${r.detail}`)

const failed = results.filter((r) => r.state === 'FAIL')
const passed = results.filter((r) => r.state === 'PASS').length
const skipped = results.filter((r) => r.state === 'SKIP').length
console.log(`\n${passed} passed, ${failed.length} failed, ${skipped} skipped`)
process.exit(failed.length ? 1 : 0)
