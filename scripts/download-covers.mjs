/**
 * Downloads all cover images from chtivo.spb.ru and saves them locally.
 * Also creates a mapping JSON for later upload to Supabase Storage.
 *
 * Usage:  node scripts/download-covers.mjs
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const INPUT_PATH = join(SCRIPT_DIR, 'scraped-books.json')
const OUTPUT_DIR = join(SCRIPT_DIR, '..', 'public', 'covers')
const MAPPING_PATH = join(SCRIPT_DIR, 'cover-mapping.json')

const DELAY_MS = 100

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function slugToFilename(slug) {
  return `${slug}.jpg`
}

async function main() {
  const data = JSON.parse(readFileSync(INPUT_PATH, 'utf-8'))

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const mapping = []
  let downloaded = 0
  let skipped = 0
  let failed = 0

  for (const book of data.books) {
    if (book.isSubscription || book.slug === '_subscription') {
      skipped++
      continue
    }

    const coverUrl = book.detailCoverUrl || book.coverUrl
    if (!coverUrl) {
      console.log(`  [SKIP] ${book.slug}: no cover URL`)
      skipped++
      continue
    }

    const filename = slugToFilename(book.slug)
    const filePath = join(OUTPUT_DIR, filename)

    if (existsSync(filePath)) {
      console.log(`  [EXISTS] ${book.slug}`)
      mapping.push({ slug: book.slug, filename, originalUrl: coverUrl, localPath: `/covers/${filename}` })
      downloaded++
      continue
    }

    try {
      const res = await fetch(coverUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          'Accept': 'image/*',
        },
      })

      if (!res.ok) {
        console.log(`  [FAIL] ${book.slug}: ${res.status} ${res.statusText}`)
        failed++
        continue
      }

      const contentType = res.headers.get('content-type') || ''
      const buffer = Buffer.from(await res.arrayBuffer())

      // Determine extension from content type
      let ext = '.jpg'
      if (contentType.includes('png')) ext = '.png'
      else if (contentType.includes('webp')) ext = '.webp'
      else if (contentType.includes('gif')) ext = '.gif'

      const finalFilename = ext === '.jpg' ? filename : `${book.slug}${ext}`
      const finalPath = join(OUTPUT_DIR, finalFilename)

      const { writeFileSync: writeFileSyncSync } = await import('node:fs')
      writeFileSyncSync(finalPath, buffer)

      mapping.push({
        slug: book.slug,
        filename: finalFilename,
        originalUrl: coverUrl,
        localPath: `/covers/${finalFilename}`,
      })

      downloaded++
      console.log(`  [OK] ${book.slug} → ${finalFilename} (${(buffer.length / 1024).toFixed(1)} KB)`)
    } catch (err) {
      console.log(`  [ERROR] ${book.slug}: ${err.message}`)
      failed++
    }

    await sleep(DELAY_MS)
  }

  writeFileSync(MAPPING_PATH, JSON.stringify(mapping, null, 2))
  console.log(`\nDone! Downloaded: ${downloaded}, Skipped: ${skipped}, Failed: ${failed}`)
  console.log(`Covers saved to: ${OUTPUT_DIR}`)
  console.log(`Mapping saved to: ${MAPPING_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})