/**
 * Uploads cover images to Supabase Storage bucket "covers"
 * and updates the Titles table to use the Supabase Storage URLs.
 *
 * Usage: node scripts/upload-covers-to-supabase.mjs
 * 
 * Requires SUPABASE_URL and SUPABASE_SERVICE_KEY env vars,
 * or uses the local Supabase instance defaults.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const COVERS_DIR = join(SCRIPT_DIR, '..', 'public', 'covers')

// Local Supabase defaults
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const BUCKET_NAME = 'covers'

function getContentType(filename) {
  if (filename.endsWith('.png')) return 'image/png'
  if (filename.endsWith('.webp')) return 'image/webp'
  if (filename.endsWith('.gif')) return 'image/gif'
  return 'image/jpeg'
}

async function main() {
  // Read service key from .env if not set
  if (!SUPABASE_SERVICE_KEY) {
    try {
      const envContent = readFileSync(join(SCRIPT_DIR, '..', '.env'), 'utf-8')
      const match = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)
      if (match) {
        const key = match[1].trim().replace(/^["']|["']$/g, '')
        process.env.SUPABASE_SERVICE_ROLE_KEY = key
      }
    } catch {}
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_KEY
  if (!serviceKey) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY not found. Set it in .env or as env var.')
    process.exit(1)
  }

  // Create bucket
  console.log(`Creating storage bucket "${BUCKET_NAME}"...`)
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
      file_size_limit: 5242880,
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

  // Read all cover files
  const files = readdirSync(COVERS_DIR).filter((f) =>
    /\.(jpg|jpeg|png|webp|gif)$/i.test(f),
  )
  console.log(`\nFound ${files.length} cover files to upload.`)

  const uploaded = []
  const failed = []

  for (const file of files) {
    const filePath = join(COVERS_DIR, file)
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
  }

  // Generate SQL to update cover URLs
  const supabaseProjectRef = SUPABASE_URL.replace(/.*:\/\/([^.]+).*/, '$1')
  // For local Supabase, the URL pattern is different
  const storageBase = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}`

  console.log(`\nCover URLs will be: ${storageBase}/{filename}`)
  console.log(`\nTo update the database, run:`)
  console.log(`  node scripts/update-cover-urls-supabase.mjs`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})