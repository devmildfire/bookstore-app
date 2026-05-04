/**
 * Re-uploads failed cover images to Supabase Storage.
 */

import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const COVERS_DIR = join(SCRIPT_DIR, '..', 'public', 'covers')

const FAILED_FILES = [
  'amystis.jpg',
  'doch-greha.png',
  'doctor-sax.png',
  'i-est-rossia.png',
  'leshu-neubitiy-zhivoy.png',
  'moguchij-russkij-dinozavr.png',
  'povelitel-bloh.png',
  'rossijskoe-vremja.jpg',
  'segamegadrive.png',
  'slava.png',
  'troe-v-lodke-ne-schitaya-harona.png',
]

function getContentType(filename) {
  if (filename.endsWith('.png')) return 'image/png'
  if (filename.endsWith('.webp')) return 'image/webp'
  if (filename.endsWith('.gif')) return 'image/gif'
  return 'image/jpeg'
}

async function main() {
  const envContent = readFileSync(join(SCRIPT_DIR, '..', '.env'), 'utf-8')
  const match = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)
  const serviceKey = match[1].trim().replace(/^["']|["']$/g, '')
  const supabaseUrl = 'http://127.0.0.1:54321'

  let ok = 0
  let fail = 0

  for (const file of FAILED_FILES) {
    const filePath = join(COVERS_DIR, file)
    let fileBuffer
    try {
      fileBuffer = readFileSync(filePath)
    } catch (e) {
      console.log(`  SKIP ${file}: file not found`)
      continue
    }

    const contentType = getContentType(file)
    console.log(`  Uploading ${file} (${(fileBuffer.length / 1024).toFixed(1)} KB)...`)

    const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/covers/${file}`, {
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
      console.log(`  OK: ${file}`)
      ok++
    } else {
      const errText = await uploadRes.text()
      console.error(`  FAILED: ${file}: ${uploadRes.status} ${errText}`)
      fail++
    }
  }

  console.log(`\nRetry complete: ${ok} succeeded, ${fail} failed.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})