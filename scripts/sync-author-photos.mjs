/**
 * Downloads author portrait images from chtivo.spb.ru and uploads them to the
 * Supabase Storage bucket "authors" using the same filenames referenced by
 * Authors.photo.
 *
 * Usage:  node scripts/sync-author-photos.mjs
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (read from
 * env or .env). Source URLs come from scripts/scraped-author-profiles.json.
 */

import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const PROFILES_PATH = join(SCRIPT_DIR, 'scraped-author-profiles.json')

const OLD_SITE = 'https://chtivo.spb.ru'
const BUCKET = 'authors'

function getContentType(filename) {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.avif')) return 'image/avif'
  return 'image/jpeg'
}

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

  const profiles = JSON.parse(readFileSync(PROFILES_PATH, 'utf8'))

  let ok = 0
  let skip = 0
  let fail = 0
  for (const a of profiles.authors) {
    if (!a.photoUrl) {
      skip++
      continue
    }
    const filename = a.photoUrl.split('/').pop()
    const sourceUrl = `${OLD_SITE}/${a.photoUrl.replace(/^\//, '')}`

    process.stdout.write(`${a.name.padEnd(28)}  ${filename.padEnd(30)} … `)

    let imgRes
    try {
      imgRes = await fetch(sourceUrl)
    } catch (err) {
      console.log(`fetch error: ${err.message}`)
      fail++
      continue
    }
    if (!imgRes.ok) {
      console.log(`source HTTP ${imgRes.status}`)
      fail++
      continue
    }
    const buf = Buffer.from(await imgRes.arrayBuffer())

    const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${filename}`, {
      method: 'PUT',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': getContentType(filename),
        'x-upsert': 'true',
      },
      body: buf,
    })
    if (!uploadRes.ok) {
      const t = await uploadRes.text()
      console.log(`upload HTTP ${uploadRes.status} ${t.slice(0, 120)}`)
      fail++
      continue
    }
    console.log(`✓ ${(buf.length / 1024).toFixed(0)} KB`)
    ok++
  }

  console.log(`\nDone: ${ok} uploaded, ${skip} skipped, ${fail} failed.`)
}

await main()
