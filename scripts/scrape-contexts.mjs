/**
 * Scrapes the "Дополнительные материалы" (context) section from each book page
 * on chtivo.spb.ru and emits SQL inserts for the BookContexts table.
 *
 * Usage:  node scripts/scrape-contexts.mjs
 * Output: supabase/seed-contexts.sql
 *
 * Slug mapping: we crawl https://chtivo.spb.ru/all-books.html to get every
 * book-{slug}.html URL, then match each old-site slug exactly to a Titles.slug
 * in our local Supabase. Mismatches are logged at the end.
 */

import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE_URL = 'https://chtivo.spb.ru'
const ALL_BOOKS_URL = `${BASE_URL}/all-books.html`
const SEED_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'supabase',
  'seed-contexts.sql',
)

const PG = {
  host: '127.0.0.1',
  port: 54322,
  user: 'postgres',
  password: 'postgres',
  database: 'postgres',
}

const DELAY_MS = 250

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function decodeEntities(str) {
  return str
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
}

function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim()
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0',
    },
  })
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`)
  return res.text()
}

async function getOldSlugs() {
  const html = await fetchText(ALL_BOOKS_URL)
  const matches = html.matchAll(/href="(book-[a-z0-9-]+)\.html"/g)
  const slugs = new Set()
  for (const m of matches) slugs.add(m[1].replace(/^book-/, ''))
  return [...slugs].sort()
}

/**
 * Returns the substring of `html` that belongs to the
 * "Дополнительные материалы" block, or null if absent.
 */
function extractContextBlock(html) {
  const headingRe = /<h3[^>]*>\s*Дополнительные материалы\s*<\/h3>/i
  const headingMatch = headingRe.exec(html)
  if (!headingMatch) return null
  const start = headingMatch.index + headingMatch[0].length
  // The block ends when the next .col-md-* opens or a closing div seq ends the
  // col. Cheapest correct heuristic: stop at the next <h3> heading or at the
  // </div> that closes the wrapping col-md-8.
  const tail = html.slice(start)
  const nextH3 = tail.search(/<h3[^>]*class="heads/i)
  const end = nextH3 === -1 ? tail.length : nextH3
  return tail.slice(0, end)
}

function parseItems(block) {
  const items = []
  const articleRe =
    /<article\s+class="publications__item"[^>]*>([\s\S]*?)<\/article>/gi
  for (const m of block.matchAll(articleRe)) {
    const inner = m[1]
    const headingMatch = /<h4[^>]*>([\s\S]*?)<\/h4>/i.exec(inner)
    if (!headingMatch) continue
    const headingHtml = headingMatch[1]
    const linkMatch = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i.exec(headingHtml)
    const heading = linkMatch ? stripTags(linkMatch[2]) : stripTags(headingHtml)
    const url = linkMatch ? decodeEntities(linkMatch[1]).trim() : null

    // Capture every <p>…</p> inside the article so multi-paragraph items
    // preserve their breaks (joined with \n\n).
    const paragraphs = []
    for (const p of inner.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)) {
      const text = stripTags(p[1])
      if (text) paragraphs.push(text)
    }
    const body = paragraphs.join('\n\n')

    if (heading && body) items.push({ heading, body, url })
  }
  return items
}

function sqlEscape(value) {
  if (value === null || value === undefined) return 'NULL'
  return `'${String(value).replace(/'/g, "''")}'`
}

async function getOurSlugs() {
  const { execSync } = await import('node:child_process')
  const env = { ...process.env, PGPASSWORD: PG.password }
  const out = execSync(
    `psql -h ${PG.host} -p ${PG.port} -U ${PG.user} -d ${PG.database} -tA -c 'SELECT slug FROM "Titles" ORDER BY slug;'`,
    { env, encoding: 'utf8' },
  )
  return new Set(out.split('\n').map((s) => s.trim()).filter(Boolean))
}

async function main() {
  console.log('→ fetching all-books.html')
  const oldSlugs = await getOldSlugs()
  console.log(`  found ${oldSlugs.length} old-site slugs`)

  console.log('→ loading our Titles.slug set from local Supabase')
  const ourSlugs = await getOurSlugs()
  console.log(`  ${ourSlugs.size} titles in local DB`)

  const matchedSlugs = oldSlugs.filter((s) => ourSlugs.has(s))
  const unmatchedOurs = [...ourSlugs].filter((s) => !oldSlugs.includes(s))
  console.log(`  ${matchedSlugs.length} slugs match exactly`)

  const sqlLines = [
    '-- Generated by scripts/scrape-contexts.mjs from chtivo.spb.ru',
    '-- Do not edit by hand; re-run the script to regenerate.',
    '',
    'DELETE FROM "BookContexts";',
    'ALTER SEQUENCE "BookContexts_id_seq" RESTART WITH 1;',
    '',
  ]

  const skippedNoSection = []
  const skippedNoItems = []
  const errors = []
  let totalItems = 0
  let booksWithItems = 0

  for (const slug of matchedSlugs) {
    const url = `${BASE_URL}/book-${slug}.html`
    try {
      const html = await fetchText(url)
      const block = extractContextBlock(html)
      if (!block) {
        skippedNoSection.push(slug)
      } else {
        const items = parseItems(block)
        if (items.length === 0) {
          skippedNoItems.push(slug)
        } else {
          sqlLines.push(`-- ${slug}`)
          sqlLines.push(
            `INSERT INTO "BookContexts" (title_id, heading, body, url, sort_order)`,
          )
          const values = items.map((it, idx) => {
            return `  ((SELECT id FROM "Titles" WHERE slug = ${sqlEscape(slug)}), ${sqlEscape(it.heading)}, ${sqlEscape(it.body)}, ${sqlEscape(it.url)}, ${idx})`
          })
          sqlLines.push('VALUES')
          sqlLines.push(values.join(',\n') + ';')
          sqlLines.push('')
          totalItems += items.length
          booksWithItems += 1
        }
      }
    } catch (err) {
      errors.push({ slug, message: err.message })
    }
    await sleep(DELAY_MS)
  }

  writeFileSync(SEED_PATH, sqlLines.join('\n'), 'utf8')

  console.log('')
  console.log('═══ Summary ═══')
  console.log(`  books with context items:  ${booksWithItems}`)
  console.log(`  total context items:       ${totalItems}`)
  console.log(`  skipped (no section):      ${skippedNoSection.length}`)
  console.log(`  skipped (section empty):   ${skippedNoItems.length}`)
  console.log(`  fetch errors:              ${errors.length}`)
  console.log(`  our slugs not on old site: ${unmatchedOurs.length}`)
  console.log('')
  if (skippedNoSection.length > 0) console.log('  no section:', skippedNoSection.join(', '))
  if (skippedNoItems.length > 0) console.log('  empty section:', skippedNoItems.join(', '))
  if (errors.length > 0) console.log('  errors:', errors)
  if (unmatchedOurs.length > 0) console.log('  our-only slugs:', unmatchedOurs.join(', '))
  console.log('')
  console.log(`✓ wrote ${SEED_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
