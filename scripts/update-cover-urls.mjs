/**
 * Updates the Titles table cover URLs from remote chtivo.spb.ru URLs
 * to local /covers/{slug}.{ext} paths.
 *
 * Usage: node scripts/update-cover-urls.mjs
 */

import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const MAPPING_PATH = join(SCRIPT_DIR, 'cover-mapping.json')

function main() {
  const mapping = JSON.parse(readFileSync(MAPPING_PATH, 'utf-8'))

  // Generate SQL to update cover URLs
  const statements = []

  for (const entry of mapping) {
    if (!entry.localPath) continue
    // Escape single quotes in the path
    const path = entry.localPath.replace(/'/g, "''")
    const slug = entry.slug.replace(/'/g, "''")
    statements.push(`UPDATE "Titles" SET cover = '${path}' WHERE slug = '${slug}';`)
  }

  const sql = `-- Update cover URLs to local paths\n-- Generated at: ${new Date().toISOString()}\n\n` + statements.join('\n')

  process.stdout.write(sql)
  console.error(`\n\nGenerated ${statements.length} UPDATE statements`)
}

main()