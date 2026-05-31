/**
 * Back-fill `Articles.cover_blur` for every row that has a `cover_path`.
 *
 * Reads each cover from the `articles` Storage bucket, computes a tiny
 * base64 LQIP via sharp, and writes it back to the row. Idempotent.
 *
 * Usage:  node scripts/sync-article-blurs.mjs [--force]
 *
 * --force re-computes blurs even for rows where cover_blur is already set.
 */

import { makeBlurDataUrl } from './_blur.mjs'
import { fetchBucketObject, getEnv, patchRow, selectRows } from './_supabase.mjs'

const BUCKET = 'articles'
const TABLE = 'Articles'

async function main() {
  const force = process.argv.includes('--force')
  const { supabaseUrl, serviceKey } = getEnv()

  const filter = force
    ? 'cover_path=not.is.null'
    : 'cover_path=not.is.null&cover_blur=is.null'
  const rows = await selectRows(
    supabaseUrl,
    serviceKey,
    TABLE,
    `select=id,cover_path&${filter}`,
  )

  console.log(`Found ${rows.length} article(s) to process${force ? ' (force mode)' : ''}.`)

  let ok = 0
  let missing = 0
  let fail = 0
  for (const row of rows) {
    const bytes = await fetchBucketObject(supabaseUrl, BUCKET, row.cover_path)
    if (!bytes) {
      console.warn(`  missing object: ${row.cover_path}`)
      missing++
      continue
    }
    try {
      const dataUrl = await makeBlurDataUrl(bytes)
      const updated = await patchRow(supabaseUrl, serviceKey, TABLE, `id=eq.${row.id}`, {
        cover_blur: dataUrl,
      })
      if (updated) {
        ok++
      } else {
        console.error(`  UPDATE failed for id=${row.id} cover_path=${row.cover_path}`)
        fail++
      }
    } catch (err) {
      console.error(`  blur failed for ${row.cover_path}: ${err.message}`)
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
