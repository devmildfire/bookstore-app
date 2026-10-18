#!/usr/bin/env node
// Renovate postUpgradeTask (renovate.json): keep lockstep monorepo siblings on one version.
//
// Why: for a package with an open security alert, Renovate FORCES a per-package branch at the
// lowest fixed version (vulnerabilityAlerts → groupName: null; not overridable via packageRules).
// With exact pins + exact peer deps, bumping `vitest` alone breaks `npm ci` (@vitest/coverage-v8
// peers vitest exactly), and the grouped npm PR — now missing vitest — breaks too. Same shape:
// next / eslint-config-next / @next/*, react / react-dom, lexical / @lexical/*.
//
// Rule: for each dep Renovate changed (X: a → b), also move every other dep that was at exactly
// `a`, is published at `b`, and comes from the same source repository. Then regenerate the
// lockfile. No-op otherwise. Never leaves a half-applied state: restores package.json on failure.
//
// Run from the repo root on a Renovate branch (HEAD = base, working tree = Renovate's edit).
// `node scripts/sync-monorepo-siblings.mjs --self-test` checks the repo-URL normaliser.
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import assert from 'node:assert/strict'

const REGISTRY = (process.env.npm_config_registry || 'https://registry.npmjs.org').replace(/\/$/, '')
const SECTIONS = ['dependencies', 'devDependencies']
// Shared repos whose packages DON'T release in lockstep (equal version numbers are coincidence).
const NOT_LOCKSTEP = new Set(['github.com/definitelytyped/definitelytyped'])

// "git+https://github.com/Vercel/next.js.git" | {url} | "github:vercel/next.js" → "github.com/vercel/next.js"
export function normalizeRepo(repo) {
  const url = typeof repo === 'string' ? repo : repo?.url
  if (!url) return null
  return url
    .trim()
    .toLowerCase()
    .replace(/^github:/, 'github.com/')
    .replace(/^(git\+)?[a-z]+:\/\//, '')
    .replace(/^git@([^:]+):/, '$1/')
    .replace(/^[^@/]+@/, '')
    .replace(/\.git$/, '')
    .replace(/\/+$/, '')
}

async function repoAt(name, version) {
  const res = await fetch(`${REGISTRY}/${name}/${version}`)
  if (!res.ok) return null // that version isn't published for this package
  return normalizeRepo((await res.json()).repository)
}

// The lockfile must be written by the SAME npm that CI's `npm ci` uses: npm versions disagree on
// optional entries (@emnapi/*) and a mismatch fails `npm ci`. CI's npm = the one bundled with the
// node-version in ci.yml (Renovate keeps that current, so this follows automatically).
async function ciNpm() {
  const node = readFileSync('.github/workflows/ci.yml', 'utf8').match(/node-version:\s*'?v?(\d+\.\d+\.\d+)/)?.[1]
  if (!node) return null
  const res = await fetch('https://nodejs.org/dist/index.json')
  return res.ok ? ((await res.json()).find((r) => r.version === `v${node}`)?.npm ?? null) : null
}

async function main() {
  const before = JSON.parse(execFileSync('git', ['show', 'HEAD:package.json'], { encoding: 'utf8' }))
  const raw = readFileSync('package.json', 'utf8')
  const after = JSON.parse(raw)

  const bumps = []
  for (const s of SECTIONS)
    for (const [name, to] of Object.entries(after[s] ?? {})) {
      const from = before[s]?.[name]
      if (from && from !== to) bumps.push({ name, from, to })
    }

  const synced = []
  for (const { name, from, to } of bumps) {
    const repo = await repoAt(name, to)
    if (!repo || NOT_LOCKSTEP.has(repo)) continue
    for (const s of SECTIONS)
      for (const [dep, v] of Object.entries(after[s] ?? {})) {
        // Same old version, untouched by Renovate, and published at the new version from the same repo.
        if (dep === name || v !== from || before[s]?.[dep] !== v) continue
        if ((await repoAt(dep, to)) !== repo) continue
        after[s][dep] = to
        synced.push(`${dep} ${from} → ${to} (with ${name})`)
      }
  }
  if (!synced.length) return console.log('sync-monorepo-siblings: nothing to sync')

  const npm = await ciNpm()
  if (!npm) console.error("sync-monorepo-siblings: couldn't resolve CI's npm version, using the local npm")
  const [cmd, pre] = npm ? ['npx', ['-y', `npm@${npm}`]] : ['npm', []]
  writeFileSync('package.json', JSON.stringify(after, null, 2) + (raw.endsWith('\n') ? '\n' : ''))
  try {
    execFileSync(cmd, [...pre, 'install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund'], {
      stdio: 'inherit',
    })
  } catch (err) {
    writeFileSync('package.json', raw) // leave Renovate's own change intact
    console.error(`sync-monorepo-siblings: lockfile regeneration failed, reverted: ${err.message}`)
    return
  }
  console.log(`sync-monorepo-siblings: synced\n  ${synced.join('\n  ')}`)
}

if (process.argv[2] === '--self-test') {
  const n = 'github.com/vercel/next.js'
  assert.equal(normalizeRepo('git+https://github.com/Vercel/next.js.git'), n)
  assert.equal(normalizeRepo({ type: 'git', url: 'https://github.com/vercel/next.js', directory: 'packages/x' }), n)
  assert.equal(normalizeRepo('github:vercel/next.js'), n)
  assert.equal(normalizeRepo('git@github.com:vercel/next.js.git'), n)
  assert.equal(normalizeRepo('git://github.com/vercel/next.js/'), n)
  assert.equal(normalizeRepo(undefined), null)
  console.log('self-test ok')
} else {
  // A sync problem must never block Renovate's own update — warn and exit 0.
  await main().catch((err) => console.error(`sync-monorepo-siblings: skipped (${err.message})`))
}
