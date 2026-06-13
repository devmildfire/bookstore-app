#!/usr/bin/env node
// RLS drift guard (data-architecture audit F1).
//
// Fails (exit 1) if any table in the `public` schema is either:
//   - RLS disabled, or
//   - RLS enabled but has ZERO policies (and is not an intentional
//     SECURITY-DEFINER-only table).
//
// A table with no policies + RLS on is locked to the table owner / service role only,
// which is intentional for a few tables (listed in ALLOW_LIST) but a bug elsewhere.
// A table with RLS off is exposed to whatever grants anon/authenticated hold — the
// exact hole this guard exists to prevent.
//
// Usage:
//   node scripts/check-rls.mjs
// Connects with DATABASE_URL, else the local Docker default.

import { execFileSync } from 'node:child_process'

// Tables intentionally gated by SECURITY DEFINER RPCs only (no row policies).
const ALLOW_LIST = new Set(['Subscribers'])

const SQL = `
SELECT c.relname,
       c.relrowsecurity AS rls_on,
       (SELECT count(*) FROM pg_policies p WHERE p.schemaname = 'public' AND p.tablename = c.relname) AS policies
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relname;
`

function runSql() {
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl) {
    return execFileSync('psql', [dbUrl, '-t', '-A', '-F', '|', '-c', SQL], { encoding: 'utf8' })
  }
  // Local Docker fallback.
  return execFileSync(
    'docker',
    ['exec', 'supabase_db_chtivo-next', 'psql', '-U', 'postgres', '-d', 'postgres', '-t', '-A', '-F', '|', '-c', SQL],
    { encoding: 'utf8' },
  )
}

function main() {
  const out = runSql().trim()
  const offenders = []
  for (const line of out.split('\n').filter(Boolean)) {
    const [name, rlsOn, policies] = line.split('|')
    const rls = rlsOn === 't'
    const count = Number(policies)
    if (ALLOW_LIST.has(name)) continue
    if (!rls) offenders.push(`${name}: RLS DISABLED`)
    else if (count === 0) offenders.push(`${name}: RLS on but ZERO policies`)
  }

  if (offenders.length > 0) {
    console.error('RLS drift detected on public tables:')
    for (const o of offenders) console.error(`  - ${o}`)
    console.error('\nEvery public table must have RLS enabled with at least one policy')
    console.error('(or be added to ALLOW_LIST if intentionally definer-only).')
    process.exit(1)
  }

  console.log('RLS guard OK — all public tables are RLS-enabled with policies.')
}

main()
