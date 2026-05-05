/**
 * Generates a SQL seed file from scraped-books.json.
 *
 * Usage:  node scripts/generate-seed-sql.mjs
 * Output: supabase/seed-books.sql
 *
 * Then run:  psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f supabase/seed-books.sql
 *
 * Product type mapping:
 *   CardBooks   (Book2.0)  — always created (chtivo's own format)
 *   Ebooks      (EBook)    — created when priceDigital is present
 *   Audiobooks  (AudioBook)— created when priceAudio is present
 *   PrintedBooks(PrintBook)— created when pricePrint is present
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const INPUT_PATH = join(SCRIPT_DIR, 'scraped-books.json')
const COVER_MAPPING_PATH = join(SCRIPT_DIR, 'cover-mapping.json')
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

function parseReleaseDate(raw) {
  if (!raw) return null
  const cleaned = raw.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  const match = cleaned.match(/(\d{1,2})\.(\d{2})\.(\d{4})/)
  if (match) return `${match[3]}-${match[2]}-${match[1].padStart(2, '0')}`
  return null
}

function main() {
  const data = JSON.parse(readFileSync(INPUT_PATH, 'utf-8'))
  const coverMapping = JSON.parse(readFileSync(COVER_MAPPING_PATH, 'utf-8'))
  const coverBySlug = new Map(coverMapping.map((entry) => [entry.slug, entry.filename]))
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

  const validBooks = books.filter((b) => !SKIP_SLUGS.has(b.slug) && b.isSubscription !== true)

  let titleId = 0
  let cardBookId = 0
  let ebookId = 0
  let audiobookId = 0
  let printedBookId = 0

  const titles = []
  const titlesAuthors = []
  const cardBooks = []
  const ebooks = []
  const audiobooks = []
  const printedBooks = []

  for (const book of validBooks) {
    titleId++

    let title = book.title || book.slug
    const fixes = TITLE_FIXES[book.slug]
    if (fixes?.title) title = fixes.title

    let thesis = book.thesis || null
    if (thesis && thesis.length > 500) thesis = null

    let description = book.description || null
    if (description && description.includes('Незаконное потребление')) description = null

    let litForm = book.litForm || null
    if (book.slug === 'advent-calendar') litForm = 'ежегодник'

    const year = book.detailYear || book.year || null
    const firstRelease = year && year !== 'preorder' && year !== 'unknown' ? year : null

    let ageRestriction = book.ageRestriction || null
    if (ageRestriction === 0) ageRestriction = null

    const coverFullUrl = book.detailCoverUrl || book.coverUrl || null
    const cover = coverBySlug.get(book.slug) ?? (coverFullUrl ? coverFullUrl.split('/').pop() : null)

    let authors = book.detailAuthors || (book.listingAuthor ? [book.listingAuthor] : [])
    authors = authors.filter((a) => !Array.from(AUTHOR_BLACKLIST).some((b) => a.includes(b)))
    const overrideKey = book.slug.replace(/-/g, '_')
    if (overrideKey in MANUAL_AUTHOR_OVERRIDES) {
      authors = MANUAL_AUTHOR_OVERRIDES[overrideKey] || []
    }
    authors = authors.map((a) => AUTHOR_NAME_FIXES[a] || a)
    for (const authorName of authors) {
      titlesAuthors.push({ title_id: titleId, author_id: getOrCreateAuthorId(authorName) })
    }

    const isPublished = !book.isPreorder
    const publishDate = firstRelease ? `${firstRelease}-01-01` : null
    const releaseDate = parseReleaseDate(book.releaseDate)

    titles.push({
      id: titleId,
      name: title,
      slug: book.slug,
      cover,
      description,
      thesis,
      age_restriction: ageRestriction,
      first_release: firstRelease,
      lit_form: litForm,
      is_compilation: false,
      is_featured: false,
    })

    // CardBook (Book2.0) — always created
    cardBookId++
    cardBooks.push({
      id: cardBookId,
      title_id: titleId,
      price: book.priceDigital || book.pricePrint || book.priceAudio || null,
      sold_out: false,
      is_published: isPublished,
      publish_date: publishDate,
      release_date: releaseDate,
    })

    // Ebook — only when digital price is known
    if (book.priceDigital) {
      ebookId++
      ebooks.push({
        id: ebookId,
        title_id: titleId,
        price: book.priceDigital,
        is_published: isPublished,
        publish_date: publishDate,
        release_date: releaseDate,
      })
    }

    // Audiobook — only when audio price is known
    if (book.priceAudio) {
      audiobookId++
      audiobooks.push({
        id: audiobookId,
        title_id: titleId,
        price: book.priceAudio,
        is_published: isPublished,
        publish_date: publishDate,
        release_date: releaseDate,
      })
    }

    // PrintedBook — only when print price is known
    if (book.pricePrint) {
      printedBookId++
      printedBooks.push({
        id: printedBookId,
        title_id: titleId,
        price: book.pricePrint,
        sold_out: false,
        is_published: isPublished,
        publish_date: publishDate,
        release_date: releaseDate,
      })
    }
  }

  // --- SQL generation ---
  let sql = `-- Seed data generated from chtivo.spb.ru scrape\n`
  sql += `-- Generated at: ${new Date().toISOString()}\n`
  sql += `-- Titles: ${titles.length} | Authors: ${authorNames.length}\n`
  sql += `-- CardBooks: ${cardBooks.length} | Ebooks: ${ebooks.length} | Audiobooks: ${audiobooks.length} | PrintedBooks: ${printedBooks.length}\n\n`

  sql += `-- Clear existing seed data (FK order)\n`
  sql += `DELETE FROM "featured_books";\n`
  sql += `DELETE FROM "PrintedBooks";\n`
  sql += `DELETE FROM "Audiobooks";\n`
  sql += `DELETE FROM "Ebooks";\n`
  sql += `DELETE FROM "CardBooks";\n`
  sql += `DELETE FROM "Titles_Authors";\n`
  sql += `DELETE FROM "Titles";\n`
  sql += `DELETE FROM "Authors";\n\n`

  sql += `ALTER SEQUENCE "Authors_id_seq" RESTART WITH 1;\n`
  sql += `ALTER SEQUENCE "Titles_id_seq" RESTART WITH 1;\n`
  sql += `ALTER SEQUENCE "Titles_Authors_id_seq" RESTART WITH 1;\n`
  sql += `ALTER SEQUENCE "CardBooks_id_seq" RESTART WITH 1;\n`
  sql += `ALTER SEQUENCE "Ebooks_id_seq" RESTART WITH 1;\n`
  sql += `ALTER SEQUENCE "Audiobooks_id_seq" RESTART WITH 1;\n`
  sql += `ALTER SEQUENCE "PrintedBooks_id_seq" RESTART WITH 1;\n\n`

  sql += `-- Authors (${authorNames.length})\n`
  sql += `INSERT INTO "Authors" (id, name) VALUES\n`
  sql += authorNames.map((a) => `  (${a.id}, ${escapeSql(a.name)})`).join(',\n')
  sql += ';\n\n'

  sql += `-- Titles (${titles.length})\n`
  sql += `INSERT INTO "Titles" (id, name, slug, cover, description, thesis, age_restriction, first_release, lit_form, is_compilation, is_featured) VALUES\n`
  sql += titles.map((t) => `  (${[
    t.id, escapeSql(t.name), escapeSql(t.slug), escapeSql(t.cover),
    escapeSql(t.description), escapeSql(t.thesis),
    t.age_restriction ?? 'NULL', escapeSql(t.first_release),
    escapeSql(t.lit_form), t.is_compilation ? 'true' : 'false', t.is_featured ? 'true' : 'false',
  ].join(', ')})`).join(',\n')
  sql += ';\n\n'

  sql += `-- Title-Author links (${titlesAuthors.length})\n`
  sql += `INSERT INTO "Titles_Authors" (title_id, author_id) VALUES\n`
  sql += titlesAuthors.map((ta) => `  (${ta.title_id}, ${ta.author_id})`).join(',\n')
  sql += ';\n\n'

  sql += `-- CardBooks / Book2.0 (${cardBooks.length})\n`
  sql += `INSERT INTO "CardBooks" (id, title_id, price, sold_out, is_published, publish_date, release_date) VALUES\n`
  sql += cardBooks.map((cb) => `  (${[
    cb.id, cb.title_id, cb.price ?? 'NULL',
    cb.sold_out ? 'true' : 'false', cb.is_published ? 'true' : 'false',
    escapeSql(cb.publish_date), escapeSql(cb.release_date),
  ].join(', ')})`).join(',\n')
  sql += ';\n\n'

  if (ebooks.length > 0) {
    sql += `-- Ebooks (${ebooks.length})\n`
    sql += `INSERT INTO "Ebooks" (id, title_id, price, is_published, publish_date, release_date) VALUES\n`
    sql += ebooks.map((e) => `  (${[
      e.id, e.title_id, e.price ?? 'NULL',
      e.is_published ? 'true' : 'false',
      escapeSql(e.publish_date), escapeSql(e.release_date),
    ].join(', ')})`).join(',\n')
    sql += ';\n\n'
  }

  if (audiobooks.length > 0) {
    sql += `-- Audiobooks (${audiobooks.length})\n`
    sql += `INSERT INTO "Audiobooks" (id, title_id, price, is_published, publish_date, release_date) VALUES\n`
    sql += audiobooks.map((a) => `  (${[
      a.id, a.title_id, a.price ?? 'NULL',
      a.is_published ? 'true' : 'false',
      escapeSql(a.publish_date), escapeSql(a.release_date),
    ].join(', ')})`).join(',\n')
    sql += ';\n\n'
  }

  if (printedBooks.length > 0) {
    sql += `-- PrintedBooks (${printedBooks.length})\n`
    sql += `INSERT INTO "PrintedBooks" (id, title_id, price, sold_out, is_published, publish_date, release_date) VALUES\n`
    sql += printedBooks.map((pb) => `  (${[
      pb.id, pb.title_id, pb.price ?? 'NULL',
      pb.sold_out ? 'true' : 'false', pb.is_published ? 'true' : 'false',
      escapeSql(pb.publish_date), escapeSql(pb.release_date),
    ].join(', ')})`).join(',\n')
    sql += ';\n\n'
  }

  // Featured books — slugs of titles to highlight on the homepage slider
  const FEATURED_SLUGS = [
    'murlo',
    'kokora',
    'makintosh-dlya-bliznecov',
    'sin-greha',
    'snovidyashiy-i-snotvorishiy',
  ]

  const featuredEntries = FEATURED_SLUGS
    .map((slug, i) => ({ slug, sort_order: i + 1, title_id: titles.find((t) => t.slug === slug)?.id }))
    .filter((f) => f.title_id != null)

  if (featuredEntries.length > 0) {
    sql += `-- Featured books (homepage slider)\n`
    sql += `INSERT INTO "featured_books" (title_id, sort_order) VALUES\n`
    sql += featuredEntries.map((f) => `  (${f.title_id}, ${f.sort_order})`).join(',\n')
    sql += ';\n\n'
  }

  writeFileSync(OUTPUT_PATH, sql, 'utf-8')
  console.log(`Generated ${OUTPUT_PATH}`)
  console.log(`  ${authorNames.length} authors`)
  console.log(`  ${titles.length} titles`)
  console.log(`  ${titlesAuthors.length} title-author links`)
  console.log(`  ${cardBooks.length} card books (Book2.0)`)
  console.log(`  ${ebooks.length} ebooks`)
  console.log(`  ${audiobooks.length} audiobooks`)
  console.log(`  ${printedBooks.length} printed books`)
  console.log(`  ${featuredEntries.length} featured books`)
}

main()
