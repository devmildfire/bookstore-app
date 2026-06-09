// Upload public/partners/*.{png,svg,jpg,webp} into the `partners` Supabase
// Storage bucket (partner logo tiles). Idempotent (upsert). Object key = bare
// filename, matching Partners.logo_path (see getPartnerLogoUrl in src/lib/storage.ts).
//   node --env-file=.env scripts/upload-partners-to-supabase.mjs
import { createClient } from '@supabase/supabase-js'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) { console.error('Missing env'); process.exit(1) }
const admin = createClient(url, key, { auth: { persistSession: false } })

const dir = 'public/partners'
const CT = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }
const files = (await readdir(dir)).filter((f) => /\.(svg|png|jpe?g|webp)$/i.test(f))
for (const f of files) {
  const ext = f.slice(f.lastIndexOf('.')).toLowerCase()
  const body = await readFile(join(dir, f))
  const { error } = await admin.storage.from('partners').upload(f, body, { contentType: CT[ext] ?? 'application/octet-stream', upsert: true })
  console.log(error ? `FAIL ${f}: ${error.message}` : `ok ${f}`)
}
console.log('done')
