// Upload public/workers/*.{jpg,png,webp} into the `workers` Supabase Storage
// bucket (team-member photos). Idempotent (upsert). Object key = bare filename,
// matching `Workers.photo_path` (see getWorkerPhotoUrl in src/lib/storage.ts).
//   node --env-file=.env scripts/upload-workers-to-supabase.mjs
import { createClient } from '@supabase/supabase-js'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) { console.error('Missing env'); process.exit(1) }
const admin = createClient(url, key, { auth: { persistSession: false } })

const dir = 'public/workers'
const CT = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }
const files = (await readdir(dir)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
for (const f of files) {
  const ext = f.slice(f.lastIndexOf('.')).toLowerCase()
  const body = await readFile(join(dir, f))
  const { error } = await admin.storage.from('workers').upload(f, body, { contentType: CT[ext] ?? 'application/octet-stream', upsert: true })
  console.log(error ? `FAIL ${f}: ${error.message}` : `ok ${f}`)
}
console.log('done')
