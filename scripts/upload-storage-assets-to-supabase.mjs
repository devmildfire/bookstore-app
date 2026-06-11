// Upload files from storage-assets/ into Supabase Storage.
//
// Expected source layout:
//   storage-assets/articles/<object-key>
//   storage-assets/covers/<object-key>
//   storage-assets/digital-files/<object-key>
//
// Re-runnable. Uploads use upsert and never delete objects.
// Run:
//   node --env-file=.env scripts/upload-storage-assets-to-supabase.mjs

import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { authHeaders, getEnv } from './_supabase.mjs'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(SCRIPT_DIR, '..')
const SOURCE_ROOT = join(REPO_ROOT, 'storage-assets')

const buckets = [
  { name: 'articles', public: true, fileSizeLimit: 20 * 1024 * 1024 },
  { name: 'covers', public: true, fileSizeLimit: 20 * 1024 * 1024 },
  { name: 'digital-files', public: false, fileSizeLimit: 1024 * 1024 * 1024 },
]

function listFiles(dir, root = dir) {
  const files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...listFiles(fullPath, root))
      continue
    }
    if (entry.isFile() && !entry.name.startsWith('.')) {
      files.push(relative(root, fullPath).split(sep).join('/'))
    }
  }
  return files
}

function contentType(filename) {
  if (/\.png$/i.test(filename)) return 'image/png'
  if (/\.jpe?g$/i.test(filename)) return 'image/jpeg'
  if (/\.webp$/i.test(filename)) return 'image/webp'
  if (/\.avif$/i.test(filename)) return 'image/avif'
  if (/\.gif$/i.test(filename)) return 'image/gif'
  if (/\.pdf$/i.test(filename)) return 'application/pdf'
  if (/\.epub$/i.test(filename)) return 'application/epub+zip'
  if (/\.fb2$/i.test(filename)) return 'application/xml'
  if (/\.mp3$/i.test(filename)) return 'audio/mpeg'
  return 'application/octet-stream'
}

async function ensureBucket(supabaseUrl, serviceKey, bucket) {
  const res = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      ...authHeaders(serviceKey),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: bucket.name,
      name: bucket.name,
      public: bucket.public,
      file_size_limit: bucket.fileSizeLimit,
    }),
  })
  if (res.ok) {
    console.log(`created bucket ${bucket.name}`)
    return
  }
  const text = await res.text()
  if (text.includes('already exists')) {
    console.log(`bucket ${bucket.name} exists`)
    return
  }
  throw new Error(`Create bucket ${bucket.name} failed: ${res.status} ${text}`)
}

async function uploadFile(supabaseUrl, serviceKey, bucket, key) {
  const path = join(SOURCE_ROOT, bucket.name, key)
  const body = readFileSync(path)
  const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucket.name}/${key}`, {
    method: 'PUT',
    headers: {
      ...authHeaders(serviceKey),
      'Content-Type': contentType(key),
      'x-upsert': 'true',
    },
    body,
  })
  if (!res.ok) {
    throw new Error(`Upload ${bucket.name}/${key} failed: ${res.status} ${await res.text()}`)
  }
  return body.length
}

async function main() {
  const { supabaseUrl, serviceKey } = getEnv()
  for (const bucket of buckets) {
    const sourceDir = join(SOURCE_ROOT, bucket.name)
    const files = listFiles(sourceDir)
    await ensureBucket(supabaseUrl, serviceKey, bucket)
    let bytes = 0
    for (const file of files) {
      bytes += await uploadFile(supabaseUrl, serviceKey, bucket, file)
    }
    console.log(`${bucket.name}: uploaded ${files.length} file(s), ${(bytes / 1024 / 1024).toFixed(1)} MB`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
