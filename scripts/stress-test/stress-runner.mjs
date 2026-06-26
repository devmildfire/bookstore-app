#!/usr/bin/env node

import { parseArgs } from 'node:util'
import { launchBrowser, createSession } from './lib/browser.mjs'
import { createReporter } from './lib/reporter.mjs'
import { runJourney } from './scenarios/user-journey.mjs'

const USAGE = `Usage: node scripts/stress-test/stress-runner.mjs [options]

Options:
  --sessions <n>    Concurrent browser contexts (default: 2)
  --duration <n>    Test duration in minutes (default: 30)
  --device <type>   mobile | desktop | both (default: both)
  --throttle <p>    none | slow-3g | fast-3g (default: slow-3g)
                    Slow-3g reproduces the reflow that drives prod's catastrophic CLS.
  --url <url>       Target URL (default: the prod live site)
  --keep            Skip cleanup of test orders
  --help            Show this help

Env (cleanup only):
  SUPABASE_URL                Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY   Service-role key
`

let flags
try {
  ;({ values: flags } = parseArgs({
    options: {
      sessions: { type: 'string', default: '2' },
      duration: { type: 'string', default: '30' },
      device: { type: 'string', default: 'both' },
      throttle: { type: 'string', default: 'slow-3g' },
      // Prod by default — the point is to stress the live site and watch the
      // Grafana dashboard / surface real weaknesses. Marker-based cleanup makes
      // this safe: only test orders are removed, never real ones.
      url: { type: 'string', default: 'https://bookstore-app.mildfire.dev' },
      keep: { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
    },
  }))
} catch (e) {
  console.error(`${e.message}\n${USAGE}`)
  process.exit(1)
}

if (flags.help) { console.log(USAGE); process.exit(0) }
if (!['mobile', 'desktop', 'both'].includes(flags.device)) {
  console.error(`--device must be mobile, desktop, or both\n${USAGE}`)
  process.exit(1)
}
if (!['none', 'slow-3g', 'fast-3g'].includes(flags.throttle)) {
  console.error(`--throttle must be none, slow-3g, or fast-3g\n${USAGE}`)
  process.exit(1)
}

const sessionCount = Number(flags.sessions)
const durationMin = Number(flags.duration)
const TARGET = flags.url.replace(/\/$/, '')
const deviceTypes = flags.device === 'both' ? ['mobile', 'desktop'] : [flags.device]

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const canCleanup = !flags.keep && SUPABASE_URL && SUPABASE_KEY

const startTime = Date.now()
const endTime = startTime + durationMin * 60_000
const reporter = createReporter()
let stopping = false

// Cleanup deletes ONLY orders carrying the test marker email (the journey fills
// every checkout's email field with `stress-…@example.com`) — never by time
// window, so a real order placed during a run is never touched.
async function cleanupOrders() {
  if (!canCleanup) {
    console.log('cleanup skipped (--keep or missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)')
    return
  }
  try {
    const filter = `email=like.${encodeURIComponent('stress-*@example.com')}`
    const res = await fetch(`${SUPABASE_URL}/rest/v1/Orders?${filter}`, {
      method: 'DELETE',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Prefer: 'return=representation' },
    })
    if (!res.ok) { console.error('cleanup: delete failed', res.status, await res.text().catch(() => '')); return }
    const rows = await res.json().catch(() => [])
    console.log(`cleanup: deleted ${Array.isArray(rows) ? rows.length : '?'} test order(s)`)
  } catch (e) {
    console.error('cleanup: error', e.message)
  }
}

// One worker = one device, looping fresh contexts (new anon user each time)
// until the duration elapses or a stop is requested.
async function runWorker(browser, deviceType) {
  while (!stopping && Date.now() < endTime) {
    let session
    try {
      session = await createSession(browser, deviceType, flags.throttle)
    } catch (e) {
      // Can't open a context = the browser is gone (crash/OOM). Don't hot-loop.
      reporter.record({ sessionId: deviceType, deviceType, timestamp: new Date().toISOString(), action: 'worker_aborted', ok: false, error: e.message })
      break
    }
    try {
      console.log(`[${session.id}] start`)
      await runJourney(session, { url: TARGET, reporter })
      reporter.record({ sessionId: session.id, deviceType, timestamp: new Date().toISOString(), action: 'iteration_complete', ok: true })
    } catch (e) {
      reporter.record({ sessionId: session.id, deviceType, timestamp: new Date().toISOString(), action: 'iteration_error', ok: false, error: e.message })
    } finally {
      await session.close()
    }
  }
}

async function main() {
  console.log(`stress test: ${sessionCount} session(s), ${durationMin}min, ${flags.device}, throttle=${flags.throttle}, target=${TARGET}`)
  console.log(
    canCleanup
      ? 'cleanup: enabled — test orders (marker email) removed afterward'
      : 'cleanup: DISABLED — test orders will remain (set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY and drop --keep)',
  )

  const browser = await launchBrowser()
  await Promise.allSettled(
    Array.from({ length: sessionCount }, (_, i) => runWorker(browser, deviceTypes[i % deviceTypes.length])),
  )
  await browser.close().catch(() => {})
  await cleanupOrders()
  reporter.summarize(startTime)
}

// Graceful: first Ctrl-C lets in-flight journeys finish, then main() runs
// cleanup + summary once. Second Ctrl-C force-quits.
process.on('SIGINT', () => {
  if (stopping) process.exit(1)
  stopping = true
  console.log('\nSIGINT — finishing current iterations, then cleaning up… (Ctrl-C again to force-quit)')
})

main().catch((e) => { console.error(e); process.exit(1) })
