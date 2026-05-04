/**
 * Generates a SQL seed file from scraped-books.json.
 *
 * Usage:  node scripts/generate-seed-sql.mjs
 * Output: supabase/seed-books.sql
 *
 * Then run:  psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f supabase/seed-books.sql
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const INPUT_PATH = join(SCRIPT_DIR, 'scraped-books.json')
const OUTPUT_PATH = join(SCRIPT_DIR, '..', 'supabase', 'seed-books.sql')

const SKIP_SLUGS = new Set([
  'deleted',
  'pyl-na-ladonyah',
  'aristotel-v-kaz',
  '_subscription',
  'course-proza',
  'moguchij-russkij-dinozavr-6',
  'gorod-posledny',
])

const AUTHOR_NAME_FIXES = {
  'Сергея Иннера': 'Сергей Иннер',
}

const AUTHOR_BLACKLIST = new Set([
  'Незаконное потребление наркотических средств',
  'психотропных веществ',
  'их аналогов причиняет вред здоровью',
  'их незаконный оборот запрещён и влечёт установленную законодательством ответственность',
])

const MANUAL_AUTHOR_OVERRIDES = {
  moguchij_russkij_dinozavr: ['Издательство Чтиво'],
  hudshee: null,
  hudshee_2: null,
  i_est_rossia: null,
  abzac_workshop: null,
  local_press: null,
  advent_calendar: null,
  course_proza: null,
}

const MANUAL_TITLE_OVERRIDES = {
  advent_calendar: 'Адвент-календарь Чтива',
  local_press: 'Локал',
  rossia: 'Россия',
}

const TITLE_FIXES = {
  'gorod-sluchajnostej': { title: 'Город случайностей' },
  'vihr-zhizni': { title: 'Вихрь жизни' },
  'prizrachnye-istorii': { title: 'Призрачные истории' },
  'hudshee-2': { title: 'Худшее-2' },
  'advent-calendar': { title: 'Адвент-календарь Чтива' },
  'local_press': { title: 'Локал' },
  'rossia': { title: 'Россия' },
  'unhappened': { title: 'Неслучившееся' },
  'kolmi-press': { title: 'Колми' },
  'i-est-rossia': { title: 'Я есть Россия' },
}

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL'
  return "'" + String(str).replace(/'/g, "''") + "'"
}

function main() {
  const data = JSON.parse(readFileSync(INPUT_PATH, 'utf-8'))
  const books = data.books

  // Deduplicate authors
  const authorMap = new Map()
  let authorId = 0
  const authorNames = []

  function getOrCreateAuthorId(name) {
    const fixed = AUTHOR_NAME_FIXES[name] || name.trim()
    if (authorMap.has(fixed)) return authorMap.get(fixed)
    authorId++
    authorMap.set(fixed, authorId)
    authorNames.push({ id: authorId, name: fixed })
    return authorId
  }

  // Filter and process books
  const validBooks = books.filter((b) => !SKIP_SLUGS.has(b.slug) && b.isSubscription !== true)

  // Generate IDs
  let titleId = 0
  let cardBookId = 0

  const titles = []
  const titlesAuthors = []
  const cardBooks = []

  for (const book of validBooks) {
    titleId++

    // Fix title
    let title = book.title || book.slug
    const fixes = TITLE_FIXES[book.slug]
    if (fixes?.title) title = fixes.title
    if (title === 'Об пол') title = 'Об пол'

    // Fix МРД description overflow
    let thesis = book.thesis || null
    if (thesis && thesis.length > 500) {
      thesis = null
    }

    // Fix description overflow for Худшее
    let description = book.description || null
    if (description && description.includes('Незаконное потребление')) {
      description = null
    }

    // Fix lit_form for advent-calendar (no lit_form, only age)
    let litForm = book.litForm || null
    if (book.slug === 'advent-calendar') litForm = 'ежегодник'

    // Use year from detail page if available, otherwise from listing
    const year = book.detailYear || book.year || null
    const firstRelease = year && year !== 'preorder' && year !== 'unknown' ? year : null

    // Age restriction
    let ageRestriction = book.ageRestriction || null
    if (ageRestriction === 0) ageRestriction = null

    // Cover URL: prefer detail page cover, fallback to listing cover
    const coverUrl = book.detailCoverUrl || book.coverUrl || null

    // Authors
    let authors = book.detailAuthors || (book.listingAuthor ? [book.listingAuthor] : [])
    // Filter out garbage authors (drug warnings, etc.)
    authors = authors.filter((a) => !Array.from(AUTHOR_BLACKLIST).some((b) => a.includes(b)))
    // Apply manual overrides
    const overrideKey = book.slug.replace(/-/g, '_')
    if (overrideKey in MANUAL_AUTHOR_OVERRIDES) {
      authors = MANUAL_AUTHOR_OVERRIDES[overrideKey] || []
    }
    // Fix author name inflections
    authors = authors.map((a) => AUTHOR_NAME_FIXES[a] || a)
    const authorIds = []
    for (const authorName of authors) {
      const aid = getOrCreateAuthorId(authorName)
      authorIds.push(aid)
    }

    // Determine is_published
    const isPublished = !book.isPreorder

    // Price: prefer print price, then digital, then audio
    const price = book.pricePrint || book.priceDigital || book.priceAudio || null

    // Release date
    let releaseDate = book.releaseDate || null
    // Clean up release date - some are like "22.10.2025</br></br>"
    if (releaseDate) {
      releaseDate = releaseDate.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
      // Convert DD.MM.YYYY to YYYY-MM-DD for consistency
      const dateMatch = releaseDate.match(/(\d{1,2})\.(\d{2})\.(\d{4})/)
      if (dateMatch) {
        releaseDate = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1].padStart(2, '0')}`
      }
    }

    const slug = book.slug

    titles.push({
      id: titleId,
      name: title,
      slug,
      cover: coverUrl,
      description,
      thesis,
      age_restriction: ageRestriction,
      first_release: firstRelease,
      lit_form: litForm,
      is_compilation: false,
      is_featured: false,
    })

    for (const aid of authorIds) {
      titlesAuthors.push({ title_id: titleId, author_id: aid })
    }

    cardBookId++
    cardBooks.push({
      id: cardBookId,
      title_id: titleId,
      price,
      sold_out: false,
      is_published: isPublished,
      publish_date: firstRelease ? `${firstRelease}-01-01` : null,
      release_date: releaseDate,
    })
  }

  // Generate SQL
  let sql = `-- Seed data generated from chtivo.spb.ru scrape\n`
  sql += `-- Generated at: ${new Date().toISOString()}\n`
  sql += `-- Total: ${titles.length} titles, ${authorNames.length} authors\n\n`

  // Clear existing data (respect FK order)
  sql += `-- Clear existing seed data\n`
  sql += `DELETE FROM "CardBooks";\n`
  sql += `DELETE FROM "Titles_Authors";\n`
  sql += `DELETE FROM "Titles";\n`
  sql += `DELETE FROM "Authors";\n\n`

  // Reset sequences
  sql += `ALTER SEQUENCE "Authors_id_seq" RESTART WITH 1;\n`
  sql += `ALTER SEQUENCE "Titles_id_seq" RESTART WITH 1;\n`
  sql += `ALTER SEQUENCE "CardBooks_id_seq" RESTART WITH 1;\n`
  sql += `ALTER SEQUENCE "Titles_Authors_id_seq" RESTART WITH 1;\n\n`

  // Insert Authors
  sql += `-- Authors (${authorNames.length})\n`
  sql += `INSERT INTO "Authors" (id, name) VALUES\n`
  sql += authorNames.map((a) => `  (${a.id}, ${escapeSql(a.name)})`).join(',\n')
  sql += ';\n\n'

  // Insert Titles
  sql += `-- Titles (${titles.length})\n`
  sql += `INSERT INTO "Titles" (id, name, slug, cover, description, thesis, age_restriction, first_release, lit_form, is_compilation, is_featured) VALUES\n`
  sql += titles
    .map((t) => {
      const fields = [
        t.id,
        escapeSql(t.name),
        escapeSql(t.slug),
        escapeSql(t.cover),
        escapeSql(t.description),
        escapeSql(t.thesis),
        t.age_restriction !== null ? t.age_restriction : 'NULL',
        escapeSql(t.first_release),
        escapeSql(t.lit_form),
        t.is_compilation ? 'true' : 'false',
        t.is_featured ? 'true' : 'false',
      ]
      return `  (${fields.join(', ')})`
    })
    .join(',\n')
  sql += ';\n\n'

  // Insert Titles_Authors
  sql += `-- Title-Author links (${titlesAuthors.length})\n`
  sql += `INSERT INTO "Titles_Authors" (title_id, author_id) VALUES\n`
  sql += titlesAuthors.map((ta) => `  (${ta.title_id}, ${ta.author_id})`).join(',\n')
  sql += ';\n\n'

  // Insert CardBooks
  sql += `-- CardBooks (${cardBooks.length})\n`
  sql += `INSERT INTO "CardBooks" (id, title_id, price, sold_out, is_published, publish_date, release_date) VALUES\n`
  sql += cardBooks
    .map((cb) => {
      const fields = [
        cb.id,
        cb.title_id,
        cb.price !== null ? cb.price : 'NULL',
        cb.sold_out ? 'true' : 'false',
        cb.is_published ? 'true' : 'false',
        escapeSql(cb.publish_date),
        escapeSql(cb.release_date),
      ]
      return `  (${fields.join(', ')})`
    })
    .join(',\n')
  sql += ';\n\n'

  writeFileSync(OUTPUT_PATH, sql, 'utf-8')
  console.log(`Generated ${OUTPUT_PATH}`)
  console.log(`  ${authorNames.length} authors`)
  console.log(`  ${titles.length} titles`)
  console.log(`  ${titlesAuthors.length} title-author links`)
  console.log(`  ${cardBooks.length} card books`)
}

main()