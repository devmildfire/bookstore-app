/**
 * Back-fill `Subscriptions.image_blur` from the `subscriptions` Storage bucket.
 *
 * Usage:  node scripts/sync-subscription-blurs.mjs [--force]
 */

import { makeBlurDataUrl } from './_blur.mjs'
import { fetchBucketObject, getEnv, patchRow, selectRows } from './_supabase.mjs'

const BUCKET = 'subscriptions'
const TABLE = 'Subscriptions'

async function main() {
  const force = process.argv.includes('--force')
  const { supabaseUrl, serviceKey } = getEnv()

  const filter = force ? 'image=not.is.null' : 'image=not.is.null&image_blur=is.null'
  const rows = await selectRows(supabaseUrl, serviceKey, TABLE, `select=id,image&${filter}`)

  console.log(`Found ${rows.length} subscription(s) to process${force ? ' (force mode)' : ''}.`)

  let ok = 0
  let missing = 0
  let fail = 0
  for (const row of rows) {
    const bytes = await fetchBucketObject(supabaseUrl, BUCKET, row.image)
    if (!bytes) {
      console.warn(`  missing object: ${row.image}`)
      missing++
      continue
    }
    try {
      const dataUrl = await makeBlurDataUrl(bytes)
      const updated = await patchRow(supabaseUrl, serviceKey, TABLE, `id=eq.${row.id}`, {
        image_blur: dataUrl,
      })
      if (updated) {
        ok++
      } else {
        console.error(`  UPDATE failed for id=${row.id} image=${row.image}`)
        fail++
      }
    } catch (err) {
      console.error(`  blur failed for ${row.image}: ${err.message}`)
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
