/**
 * Updates Titles table cover values to match Supabase Storage object filenames.
 * Reads from cover-mapping.json and generates SQL updates.
 */

import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const MAPPING_PATH = join(SCRIPT_DIR, 'cover-mapping.json')

function main() {
  const mapping = JSON.parse(readFileSync(MAPPING_PATH, 'utf-8'))

  const statements = []
  for (const entry of mapping) {
    if (!entry.filename) continue
    const slug = entry.slug.replace(/'/g, "''")
    const filename = entry.filename.replace(/'/g, "''")
    statements.push(`UPDATE "Titles" SET cover = '${filename}' WHERE slug = '${slug}';`)
  }

  const sql = `-- Update cover filenames to Supabase Storage objects\n-- Generated at: ${new Date().toISOString()}\n\n` + statements.join('\n')

  process.stdout.write(sql)
  console.error(`\n\nGenerated ${statements.length} UPDATE statements`)
}

main()
