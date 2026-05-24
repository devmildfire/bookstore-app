/**
 * One-off: upload the about-page hero video into the `videos` Storage bucket
 * at `about/chtivo.mp4`.
 *
 * Usage: node scripts/upload-about-video.mjs
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY (in env or .env). Uses the local
 * Supabase URL by default; override via NEXT_PUBLIC_SUPABASE_URL.
 *
 * Idempotent — uses `x-upsert: true`. After this runs successfully you can
 * delete the local `public/videos/chtivo.mp4` copy.
 */

import { readFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getEnv, authHeaders } from './_supabase.mjs'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const SOURCE = join(SCRIPT_DIR, '..', 'public', 'videos', 'chtivo.mp4')
const BUCKET = 'videos'
const KEY = 'about/chtivo.mp4'

async function main() {
  const { supabaseUrl, serviceKey } = getEnv()

  const stat = statSync(SOURCE)
  console.log(`Uploading ${SOURCE} (${(stat.size / 1024 / 1024).toFixed(2)} MiB) → ${BUCKET}/${KEY}`)

  const bytes = readFileSync(SOURCE)
  const res = await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${KEY}`, {
    method: 'PUT',
    headers: {
      ...authHeaders(serviceKey),
      'Content-Type': 'video/mp4',
      'x-upsert': 'true',
    },
    body: bytes,
  })

  if (!res.ok) {
    const text = await res.text()
    console.error(`Upload failed: ${res.status} ${text}`)
    process.exit(1)
  }

  console.log(`Public URL: ${supabaseUrl}/storage/v1/object/public/${BUCKET}/${KEY}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
