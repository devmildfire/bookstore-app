/**
 * Generates a 400x400 silhouette placeholder portrait and uploads it to the
 * Supabase Storage bucket "authors" as placeholder.jpg.
 *
 * Usage:  node scripts/upload-author-placeholder.mjs
 */

import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))

const BUCKET = 'authors'
const FILENAME = 'placeholder.jpg'

// Soft warm gray background with a simple silhouette in a darker gray.
const SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <rect width="400" height="400" fill="#d8d3cd" />
  <g fill="#9d958c">
    <circle cx="200" cy="160" r="62" />
    <path d="M90 360 Q90 250 200 250 Q310 250 310 360 L310 400 L90 400 Z" />
  </g>
</svg>
`

function readServiceKey() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return process.env.SUPABASE_SERVICE_ROLE_KEY
  try {
    const envText = readFileSync(join(SCRIPT_DIR, '..', '.env'), 'utf8')
    const m = envText.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)
    if (m) return m[1].trim().replace(/^["']|["']$/g, '')
  } catch {}
  return null
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
  const serviceKey = readServiceKey()
  if (!serviceKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY not set (env or .env)')
    process.exit(1)
  }

  const buf = await sharp(Buffer.from(SVG)).jpeg({ quality: 86 }).toBuffer()
  console.log(`Generated ${FILENAME}: ${(buf.length / 1024).toFixed(1)} KB`)

  const res = await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${FILENAME}`, {
    method: 'PUT',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'image/jpeg',
      'x-upsert': 'true',
    },
    body: buf,
  })
  if (!res.ok) {
    const t = await res.text()
    console.error(`Upload HTTP ${res.status}: ${t}`)
    process.exit(1)
  }
  console.log(`Uploaded to ${BUCKET}/${FILENAME}`)
}

await main()
