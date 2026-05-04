/**
 * Updates Titles table cover URLs to point to Supabase Storage.
 * Reads from cover-mapping.json and generates SQL updates.
 */

import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const MAPPING_PATH = join(SCRIPT_DIR, 'cover-mapping.json')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/covers`

function main() {
  const mapping = JSON.parse(readFileSync(MAPPING_PATH, 'utf-8'))

  const statements = []
  for (const entry of mapping) {
    if (!entry.filename) continue
    const coverUrl = `${STORAGE_BASE}/${entry.filename}`
    const slug = entry.slug.replace(/'/g, "''")
    const url = coverUrl.replace(/'/g, "''")
    statements.push(`UPDATE "Titles" SET cover = '${url}' WHERE slug = '${slug}';`)
  }

  const sql = `-- Update cover URLs to Supabase Storage\n-- Generated at: ${new Date().toISOString()}\n\n` + statements.join('\n')

  process.stdout.write(sql)
  console.error(`\n\nGenerated ${statements.length} UPDATE statements`)
}

main()