/**
 * Uploads article images (covers + inline illustrations) to the
 * Supabase Storage bucket "articles". Mirrors
 * `scripts/upload-covers-to-supabase.mjs`.
 *
 * Usage: place files under `storage-assets/articles/` and run:
 *   node scripts/upload-articles-to-supabase.mjs
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env or the environment.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const SOURCE_DIR = join(SCRIPT_DIR, '..', 'storage-assets', 'articles')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const BUCKET_NAME = 'articles'

function listImages(dir, root = dir) {
  const files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...listImages(fullPath, root))
      continue
    }
    if (entry.isFile() && /\.(jpg|jpeg|png|webp|avif)$/i.test(entry.name)) {
      files.push(relative(root, fullPath).split(sep).join('/'))
    }
  }
  return files
}

function getContentType(filename) {
  if (/\.png$/i.test(filename)) return 'image/png'
  if (/\.webp$/i.test(filename)) return 'image/webp'
  if (/\.avif$/i.test(filename)) return 'image/avif'
  return 'image/jpeg'
}

async function main() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const envContent = readFileSync(join(SCRIPT_DIR, '..', '.env'), 'utf-8')
      const match = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)
      if (match) {
        process.env.SUPABASE_SERVICE_ROLE_KEY = match[1].trim().replace(/^["']|["']$/g, '')
      }
    } catch {}
  }
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY not found.')
    process.exit(1)
  }

  console.log(`Ensuring storage bucket "${BUCKET_NAME}" exists...`)
  const createRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: BUCKET_NAME,
      name: BUCKET_NAME,
      public: true,
      file_size_limit: 20971520,
    }),
  })
  if (createRes.ok) {
    console.log(`  Bucket "${BUCKET_NAME}" created.`)
  } else {
    const errText = await createRes.text()
    if (errText.includes('already exists')) {
      console.log(`  Bucket "${BUCKET_NAME}" already exists.`)
    } else {
      console.error(`  Error creating bucket: ${createRes.status} ${errText}`)
    }
  }

  let files = []
  try {
    files = listImages(SOURCE_DIR)
  } catch {
    console.error(`Source directory ${SOURCE_DIR} not found. Place images there first.`)
    process.exit(1)
  }
  console.log(`\nFound ${files.length} image(s) to upload.`)

  const uploaded = []
  const failed = []

  for (const file of files) {
    const filePath = join(SOURCE_DIR, file)
    const fileBuffer = readFileSync(filePath)
    const contentType = getContentType(file)

    console.log(`  Uploading ${file} (${(fileBuffer.length / 1024).toFixed(1)} KB)...`)
    const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${file}`, {
      method: 'PUT',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': contentType,
        'x-upsert': 'true',
      },
      body: fileBuffer,
    })
    if (uploadRes.ok) {
      uploaded.push(file)
    } else {
      const errText = await uploadRes.text()
      console.error(`  FAILED: ${file}: ${uploadRes.status} ${errText}`)
      failed.push(file)
    }
  }

  console.log(`\nUpload complete: ${uploaded.length} succeeded, ${failed.length} failed.`)
  if (failed.length > 0) {
    console.error('Failed files:', failed)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
