/**
 * Back-fill `Titles.book_photos_blurs` from the `book-photos` bucket.
 *
 * For every Title with a `slug`, scan the per-edition subfolders
 * `book-photos/{slug}/{print,card,digital}/*`, fetch each photo, compute a
 * blur, and write a JSONB map `{ "folder/filename": dataUrl, ... }` to
 * `Titles.book_photos_blurs`.
 *
 * Idempotent — re-running over a fully-populated DB is a no-op (skips
 * rows that already have a non-null book_photos_blurs, unless --force).
 *
 * Usage:  node scripts/sync-book-photo-blurs.mjs [--force]
 */

import { makeBlurDataUrl } from './_blur.mjs'
import {
  fetchBucketObject,
  getEnv,
  listBucketFolder,
  patchRow,
  selectRows,
} from './_supabase.mjs'

const BUCKET = 'book-photos'
const TABLE = 'Titles'
// Per-edition photo subfolders (mirrors src/consts/bookPhotos.ts).
const PHOTO_FOLDERS = ['print', 'card', 'digital']

async function main() {
  const force = process.argv.includes('--force')
  const { supabaseUrl, serviceKey } = getEnv()

  const filter = force
    ? 'slug=not.is.null'
    : 'slug=not.is.null&book_photos_blurs=is.null'
  const rows = await selectRows(supabaseUrl, serviceKey, TABLE, `select=id,slug&${filter}`)

  console.log(`Found ${rows.length} title(s) to scan${force ? ' (force mode)' : ''}.`)

  let titlesUpdated = 0
  let titlesEmpty = 0
  let photosOk = 0
  let photosFail = 0

  for (const row of rows) {
    const blurs = {}
    let found = 0
    for (const folder of PHOTO_FOLDERS) {
      const filenames = await listBucketFolder(supabaseUrl, serviceKey, BUCKET, `${row.slug}/${folder}`)
      for (const name of filenames) {
        found++
        const key = `${folder}/${name}`
        const bytes = await fetchBucketObject(supabaseUrl, BUCKET, `${row.slug}/${key}`)
        if (!bytes) {
          photosFail++
          continue
        }
        try {
          blurs[key] = await makeBlurDataUrl(bytes)
          photosOk++
        } catch (err) {
          console.error(`  blur failed for ${row.slug}/${key}: ${err.message}`)
          photosFail++
        }
      }
    }

    if (found === 0) {
      titlesEmpty++
      continue
    }
    if (Object.keys(blurs).length === 0) continue

    const updated = await patchRow(supabaseUrl, serviceKey, TABLE, `id=eq.${row.id}`, {
      book_photos_blurs: blurs,
    })
    if (updated) {
      titlesUpdated++
    } else {
      console.error(`  UPDATE failed for slug=${row.slug}`)
    }
  }

  console.log(
    `\nDone: ${titlesUpdated} titles updated, ${titlesEmpty} titles without photos, ` +
      `${photosOk} photos blurred, ${photosFail} photos failed.`
  )
  if (photosFail > 0) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
