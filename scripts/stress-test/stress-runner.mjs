#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { createSession } from './lib/browser.mjs'
import { createReporter } from './lib/reporter.mjs'
import { runJourney } from './scenarios/user-journey.mjs'

// --- CLI flags ---
const USAGE = `Usage: node stress-runner.mjs [options]

Options:
  --sessions <n>    Concurrent browser sessions (default: 2)
  --duration <n>    Test duration in minutes (default: 30)
  --device <type>   Device type: mobile, desktop, or both (default: both)
  --url <url>       Target URL (default: https://bookstore-app.mildfire.dev)
  --keep            Skip cleanup of test orders
  --help            Show this help

Env:
  SUPABASE_URL        Supabase project URL (for cleanup)
  SUPABASE_SERVICE_ROLE_KEY  Service-role key (for cleanup)
`

const flags = {
  sessions: 2,
  duration: 30,
  device: 'both',
  url: 'https://bookstore-app.mildfire.dev',
  keep: false,
}

for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i]
  switch (arg) {
    case '--sessions': flags.sessions = Number(process.argv[++i]); break
    case '--duration': flags.duration = Number(process.argv[++i]); break
    case '--device': {
      const v = process.argv[++i]
      if (!['mobile', 'desktop', 'both'].includes(v)) throw new Error(`--device must be mobile, desktop, or both`)
      flags.device = v
      break
    }
    case '--url': flags.url = process.argv[++i]; break
    case '--keep': flags.keep = true; break
    case '--help': console.log(USAGE); process.exit(0)
    default: throw new Error(`Unknown flag: ${arg}\n${USAGE}`)
  }
}

// --- Env + cleanup setup ---
const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const canCleanup = !flags.keep && SUPABASE_URL && SUPABASE_KEY

const startTime = Date.now()
const endTime = startTime + flags.duration * 60_000
const reporter = createReporter()

// --- Sessions ---
function resolveDevices() {
  if (flags.device === 'both') return ['mobile', 'desktop']
  return [flags.device]
}

async function spawnSessions() {
  const devices = resolveDevices()
  const count = flags.sessions
  const sessions = []
  for (let i = 0; i < count; i++) {
    const device = devices[i % devices.length]
    try {
      const session = await createSession(device)
      sessions.push(session)
      console.log(`[${session.id}] session started (${device})`)
    } catch (e) {
      console.error(`failed to start session ${i}:`, e.message)
    }
  }
  return sessions
}

async function closeSessions(sessions) {
  for (const s of sessions) {
    try { await s.close(); console.log(`[${s.id}] closed`) } catch {}
  }
}

// --- Cleanup via Supabase REST API ---
async function cleanupOrders() {
  if (!canCleanup) {
    console.log('cleanup skipped (--keep or missing SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY)')
    return
  }
  const since = new Date(startTime).toISOString()
  const until = new Date().toISOString()
  console.log(`cleaning orders created between ${since} and ${until}...`)

  try {
    // Query orders in the test window
    const listRes = await fetch(`${SUPABASE_URL}/rest/v1/Orders?created_at=gte.${since}&created_at=lte.${until}&select=id`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    })
    if (!listRes.ok) { console.error('cleanup: failed to query orders', listRes.status); return }
    const orders = await listRes.json()
    if (!orders.length) { console.log('cleanup: no orders found'); return }

    // Delete them (admin bypass — service_role can delete directly)
    const ids = orders.map(o => o.id)
    const delRes = await fetch(`${SUPABASE_URL}/rest/v1/Orders?id=in.(${ids.join(',')})`, {
      method: 'DELETE',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Prefer: 'return=minimal' },
    })
    if (delRes.ok) console.log(`cleanup: deleted ${ids.length} order(s)`)
    else console.error('cleanup: delete failed', delRes.status, await delRes.text().catch(() => ''))
  } catch (e) {
    console.error('cleanup: error', e.message)
  }
}

// --- Session runner ---
async function runSession(session) {
  while (Date.now() < endTime) {
    try {
      await runJourney(session, { url: flags.url, reporter })
      reporter.record({ sessionId: session.id, deviceType: session.deviceType, timestamp: new Date().toISOString(), action: 'iteration_complete', ok: true })
    } catch (e) {
      reporter.record({ sessionId: session.id, deviceType: session.deviceType, timestamp: new Date().toISOString(), action: 'iteration_error', ok: false, error: e.message })
    }
    // If time remains, close and reopen fresh (new anon session)
    if (Date.now() < endTime) {
      await session.close()
      const device = session.deviceType
      try {
        const fresh = await createSession(device)
        Object.assign(session, fresh)
        session.id = fresh.id
        console.log(`[${session.id}] fresh session (${device})`)
      } catch (e) {
        console.error(`failed to reopen session:`, e.message)
        break
      }
    }
  }
}

// --- Main ---
async function main() {
  console.log(`stress test: ${flags.sessions} session(s), ${flags.duration}min, ${flags.device}, target=${flags.url}`)
  if (canCleanup) console.log('cleanup: enabled (delete orders after test)')

  const sessions = await spawnSessions()
  if (!sessions.length) { console.error('no sessions started — aborting'); process.exit(1) }

  // Run each session concurrently
  await Promise.allSettled(sessions.map(runSession))

  // Close all browsers
  await closeSessions(sessions)

  // Cleanup
  await cleanupOrders()

  // Summary
  reporter.summarize(startTime)
}

// SIGINT: graceful shutdown
let shuttingDown = false
process.on('SIGINT', async () => {
  if (shuttingDown) return
  shuttingDown = true
  console.log('\nSIGINT received — shutting down...')
  // Override endTime to stop loops
  endTime = Date.now() - 1 // hack: force endTime to the past
  // Wait a moment for loops to notice, then cleanup
  setTimeout(async () => {
    await cleanupOrders()
    reporter.summarize(startTime)
    process.exit(0)
  }, 5000)
})

main().catch(e => { console.error(e); process.exit(1) })
