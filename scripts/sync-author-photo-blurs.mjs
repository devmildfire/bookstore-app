/**
 * Back-fill `Authors.photo_blur` from the `authors` Storage bucket.
 *
 * Usage:  node scripts/sync-author-photo-blurs.mjs [--force]
 */

import { makeBlurDataUrl } from './_blur.mjs'
import { fetchBucketObject, getEnv, patchRow, selectRows } from './_supabase.mjs'

const BUCKET = 'authors'
const TABLE = 'Authors'

async function main() {
  const force = process.argv.includes('--force')
  const { supabaseUrl, serviceKey } = getEnv()

  const filter = force ? 'photo=not.is.null' : 'photo=not.is.null&photo_blur=is.null'
  const rows = await selectRows(supabaseUrl, serviceKey, TABLE, `select=id,photo&${filter}`)

  console.log(`Found ${rows.length} author(s) to process${force ? ' (force mode)' : ''}.`)

  let ok = 0
  let missing = 0
  let fail = 0
  for (const row of rows) {
    const bytes = await fetchBucketObject(supabaseUrl, BUCKET, row.photo)
    if (!bytes) {
      console.warn(`  missing object: ${row.photo}`)
      missing++
      continue
    }
    try {
      const dataUrl = await makeBlurDataUrl(bytes)
      const updated = await patchRow(supabaseUrl, serviceKey, TABLE, `id=eq.${row.id}`, {
        photo_blur: dataUrl,
      })
      if (updated) {
        ok++
      } else {
        console.error(`  UPDATE failed for id=${row.id} photo=${row.photo}`)
        fail++
      }
    } catch (err) {
      console.error(`  blur failed for ${row.photo}: ${err.message}`)
      fail++
    }
  }

  console.log(`\nDone: ${ok} updated, ${missing} missing, ${fail} failed.`)
  if (fail > 0) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
