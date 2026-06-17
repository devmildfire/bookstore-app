/**
 * Upload public/boxsets/*.webp to the `box-sets` storage bucket (upsert).
 * Pairs with boxsets-svg-to-webp.mjs + the DB repoint (BoxSets.image → .webp).
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL (default local), SUPABASE_SERVICE_ROLE_KEY (or read from .env).
 * Usage: node scripts/upload-boxset-webp.mjs
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const DIR = join(SCRIPT_DIR, '..', 'public', 'boxsets')
const BUCKET = 'box-sets'
const URL_BASE = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321').replace(/\/+$/, '')

let key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
if (!key) {
  try {
    const env = readFileSync(join(SCRIPT_DIR, '..', '.env'), 'utf-8')
    key = (env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1] ?? '').trim().replace(/^["']|["']$/g, '')
  } catch {}
}
if (!key) { console.error('Missing SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }

const files = readdirSync(DIR).filter((f) => f.toLowerCase().endsWith('.webp')).sort()
console.log(`Uploading ${files.length} WebP to ${URL_BASE}/storage/v1/object/${BUCKET}`)
let ok = 0
for (const f of files) {
  const res = await fetch(`${URL_BASE}/storage/v1/object/${BUCKET}/${f}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'image/webp',
      'x-upsert': 'true',
      'cache-control': '31536000',
    },
    body: readFileSync(join(DIR, f)),
  })
  if (res.ok) { ok++; console.log(`  ✓ ${f}`) }
  else console.error(`  ✗ ${f}: ${res.status} ${await res.text()}`)
}
console.log(`Done: ${ok}/${files.length} uploaded`)
