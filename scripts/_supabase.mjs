import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))

export function readServiceKey() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return process.env.SUPABASE_SERVICE_ROLE_KEY
  try {
    const envText = readFileSync(join(SCRIPT_DIR, '..', '.env'), 'utf8')
    const m = envText.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)
    if (m) return m[1].trim().replace(/^["']|["']$/g, '')
  } catch {}
  return null
}

export function getEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
  const serviceKey = readServiceKey()
  if (!serviceKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY not set (env or .env)')
    process.exit(1)
  }
  return { supabaseUrl, serviceKey }
}

export function authHeaders(serviceKey) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  }
}

/**
 * Fetch an object from a public Storage bucket and return its bytes.
 * Returns null if the object is missing.
 */
export async function fetchBucketObject(supabaseUrl, bucket, path) {
  const url = `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
  const res = await fetch(url)
  if (!res.ok) return null
  return new Uint8Array(await res.arrayBuffer())
}

/**
 * List filenames in a bucket folder. Returns ordered, dotfile-filtered.
 */
export async function listBucketFolder(supabaseUrl, serviceKey, bucket, prefix) {
  const res = await fetch(`${supabaseUrl}/storage/v1/object/list/${bucket}`, {
    method: 'POST',
    headers: { ...authHeaders(serviceKey), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prefix,
      limit: 1000,
      sortBy: { column: 'name', order: 'asc' },
    }),
  })
  if (!res.ok) return []
  const list = await res.json()
  return list
    .map((f) => f.name)
    .filter((name) => name && !name.startsWith('.'))
}

/**
 * Run a PostgREST PATCH to update a row. `match` is the filter
 * (e.g. `id=eq.42`). Returns true on 2xx.
 */
export async function patchRow(supabaseUrl, serviceKey, table, match, body) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${match}`, {
    method: 'PATCH',
    headers: {
      ...authHeaders(serviceKey),
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  })
  return res.ok
}

/**
 * Run a PostgREST GET to read rows. Returns the parsed JSON array.
 */
export async function selectRows(supabaseUrl, serviceKey, table, query) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: authHeaders(serviceKey),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`SELECT ${table}?${query} failed: ${res.status} ${text}`)
  }
  return res.json()
}
