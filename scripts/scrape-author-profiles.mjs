/**
 * Scrapes the "Об авторе" block from each book page on chtivo.spb.ru.
 *
 * Usage:  node scripts/scrape-author-profiles.mjs
 * Output: scripts/scraped-author-profiles.json
 *
 * The old site embeds author bio info directly inside each book detail page
 * (no separate /author-*.html). Multiple books by the same author repeat
 * (mostly) identical "Об авторе" content — we aggregate by author display
 * name and keep the longest non-empty value seen for each field.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE_URL = 'https://chtivo.spb.ru'
const DIR = dirname(fileURLToPath(import.meta.url))
const INPUT_PATH = join(DIR, 'scraped-books.json')
const OUTPUT_PATH = join(DIR, 'scraped-author-profiles.json')
const DELAY_MS = 200

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function unescapeHtml(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&nbsp;/g, ' ')
}

function stripTags(html) {
  return unescapeHtml(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
}

// "03.01.1939" or "03|01|1939" → "1939-01-03"; returns null otherwise.
function parseRuDate(s) {
  if (!s) return null
  const m = s.match(/(\d{1,2})[.\|](\d{1,2})[.\|](\d{4})/)
  if (!m) return null
  const [, dd, mm, yyyy] = m
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
}

// Match a line that is *only* a date or a date range like "01.04.1809 – 04.03.1852".
const DATE_LINE_RE = /^(\d{1,2}[.\|]\d{1,2}[.\|]\d{4})(\s*[—–-]\s*(\d{1,2}[.\|]\d{1,2}[.\|]\d{4}))?\s*$/

function classifyContact(url, title) {
  const u = url.toLowerCase()
  const t = (title || '').toLowerCase()
  if (u.startsWith('mailto:')) return 'email'
  if (u.includes('t.me/') || u.includes('telegram')) return 'telegram'
  if (u.includes('instagram.com')) return 'instagram'
  if (u.includes('facebook.com') || u.includes('fb.com')) return 'facebook'
  if (u.includes('twitter.com') || u.includes('x.com/')) return 'twitter'
  if (t.includes('telegram')) return 'telegram'
  if (t.includes('instagram')) return 'instagram'
  if (t.includes('facebook')) return 'facebook'
  if (t.includes('twitter')) return 'twitter'
  return 'website'
}

function extractAuthorBlock(html) {
  // Look for the "Об авторе" heading and its sibling <article class="author-block">.
  const headIdx = html.search(/Об\s+авторе/i)
  if (headIdx < 0) return null
  const slice = html.slice(headIdx)
  const articleMatch = slice.match(/<article[^>]*class="[^"]*author-block[^"]*"[^>]*>([\s\S]*?)<\/article>/)
  if (!articleMatch) return null
  return articleMatch[1]
}

function parseAuthorBlock(block) {
  const result = {
    name: null,
    photoUrl: null,
    phrase: null,
    bio: null,
    city: null,
    birth_date: null,
    death_date: null,
    contacts: [],
  }

  // Photo
  const imgMatch = block.match(/<img[^>]*\bsrc="([^"]+)"/i)
  if (imgMatch) result.photoUrl = imgMatch[1]

  // Phrase (slogan h3 inside .about-author__slogan)
  const sloganMatch = block.match(/<div[^>]*class="[^"]*about-author__slogan[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i)
    || block.match(/about-author__slogan[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>/i)
  if (sloganMatch) {
    let phrase = stripTags(sloganMatch[1])
    // Drop surrounding « » “ ” ' " on either side; some pages have unmatched
    // closing quotes either at the very end or right before trailing punctuation
    // (e.g. `Лучший день — последний».`). The BookAuthor component re-wraps the
    // phrase in « » so we want a bare string here.
    phrase = phrase.replace(/^[«»"“”'’\s]+/, '').replace(/[«»"“”'’]+([.!?,;:]*)\s*$/, '$1').trim()
    if (phrase) result.phrase = phrase
  }

  // Main bio paragraph (first <p ...> inside the article)
  const pMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
  if (pMatch) {
    // The first line is typically "Name | City | DD.MM.YYYY"
    const fullText = unescapeHtml(pMatch[1])
    // Replace <br><br> with paragraph breaks before stripping.
    const normalized = fullText.replace(/<br\s*\/?>(\s*<br\s*\/?>)+/gi, '\n\n').replace(/<br\s*\/?>/gi, '\n')
    const lines = stripTagsLines(normalized)
    if (lines.length > 0) {
      const head = lines[0]
      const parts = head.split('|').map((s) => s.trim())
      if (parts.length >= 1 && parts[0]) result.name = parts[0]
      if (parts.length >= 2) result.city = parts[1] || null
      if (parts.length >= 3) {
        // Could be either "BIRTH" or "BIRTH — DEATH"
        const dates = parts.slice(2).join(' | ')
        const dashSplit = dates.split(/[—–-]/).map((s) => s.trim()).filter(Boolean)
        if (dashSplit.length >= 1) result.birth_date = parseRuDate(dashSplit[0])
        if (dashSplit.length >= 2) result.death_date = parseRuDate(dashSplit[1])
      }
      // Many pages put dates on the SECOND line (the head is just "Name | City").
      // If we don't yet have a birth date and the first body line is a date, lift it.
      const remaining = lines.slice(1)
      if (remaining.length > 0) {
        const m = remaining[0].match(DATE_LINE_RE)
        if (m) {
          if (!result.birth_date) result.birth_date = parseRuDate(m[1])
          if (m[3] && !result.death_date) result.death_date = parseRuDate(m[3])
          remaining.shift()
        }
      }
      const bioBody = remaining.join('\n\n').trim()
      if (bioBody) result.bio = bioBody
    }
  }

  // Contacts in .social-list .social-link
  const socialBlockMatch = block.match(/<div[^>]*class="[^"]*social-list[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
  if (socialBlockMatch) {
    const linkRegex = /<a[^>]*\bhref="([^"]+)"[^>]*(?:title="([^"]*)")?[^>]*>([\s\S]*?)<\/a>/g
    let m
    let order = 0
    while ((m = linkRegex.exec(socialBlockMatch[1])) !== null) {
      const url = unescapeHtml(m[1]).trim()
      const title = m[2] || ''
      if (!url || url.startsWith('#')) continue
      const channel = classifyContact(url, title)
      result.contacts.push({ channel, url, sort_order: order++ })
    }
  }

  return result
}

function stripTagsLines(text) {
  // Split on real newlines, strip remaining tags per line, drop empties.
  return text
    .split(/\n+/)
    .map((line) => stripTags(line))
    .filter(Boolean)
}

function pickBetter(prev, next) {
  if (!next) return prev
  if (!prev) return next
  // Prefer the longer string for text fields.
  return next.length > prev.length ? next : prev
}

async function main() {
  const inputRaw = readFileSync(INPUT_PATH, 'utf8')
  const input = JSON.parse(inputRaw)
  const books = input.books || []

  /** @type {Record<string, ReturnType<typeof parseAuthorBlock>>} */
  const byAuthor = {}

  let processed = 0
  let withBlock = 0
  for (const book of books) {
    if (!book.href || book.href.includes('javascript:') || book.href === '#') continue
    const url = `${BASE_URL}/${book.href.replace(/^\//, '')}`
    process.stdout.write(`[${++processed}/${books.length}] ${book.title} … `)
    let html
    try {
      const res = await fetch(url)
      if (!res.ok) {
        console.log(`HTTP ${res.status}`)
        continue
      }
      html = await res.text()
    } catch (err) {
      console.log(`ERROR ${err.message}`)
      continue
    }
    const block = extractAuthorBlock(html)
    if (!block) {
      console.log('no block')
      await sleep(DELAY_MS)
      continue
    }
    withBlock++
    const profile = parseAuthorBlock(block)
    if (!profile.name) {
      console.log('no name')
      await sleep(DELAY_MS)
      continue
    }
    const key = profile.name
    if (!byAuthor[key]) {
      byAuthor[key] = {
        name: profile.name,
        photoUrl: profile.photoUrl,
        phrase: profile.phrase,
        bio: profile.bio,
        city: profile.city,
        birth_date: profile.birth_date,
        death_date: profile.death_date,
        contacts: profile.contacts,
        sourcePages: [book.href],
      }
    } else {
      const agg = byAuthor[key]
      agg.photoUrl = agg.photoUrl || profile.photoUrl
      agg.phrase = pickBetter(agg.phrase, profile.phrase)
      agg.bio = pickBetter(agg.bio, profile.bio)
      agg.city = agg.city || profile.city
      agg.birth_date = agg.birth_date || profile.birth_date
      agg.death_date = agg.death_date || profile.death_date
      if (profile.contacts.length > agg.contacts.length) agg.contacts = profile.contacts
      agg.sourcePages.push(book.href)
    }
    console.log(`${profile.name} ✓`)
    await sleep(DELAY_MS)
  }

  const out = {
    scrapedAt: new Date().toISOString(),
    source: BASE_URL,
    totalBooks: books.length,
    booksWithAuthorBlock: withBlock,
    authors: Object.values(byAuthor).sort((a, b) => a.name.localeCompare(b.name, 'ru')),
  }
  writeFileSync(OUTPUT_PATH, JSON.stringify(out, null, 2), 'utf8')
  console.log(`\nWrote ${out.authors.length} author profiles to ${OUTPUT_PATH}`)
}

await main()
