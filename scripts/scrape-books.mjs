/**
 * Scrapes book data from the old chtivo.spb.ru site.
 *
 * Usage:  node scripts/scrape-books.mjs
 * Output: scripts/scraped-books.json
 */

import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE_URL = 'https://chtivo.spb.ru'
const ALL_BOOKS_URL = `${BASE_URL}/all-books.html`
const OUTPUT_PATH = join(dirname(fileURLToPath(import.meta.url)), 'scraped-books.json')

const DELAY_MS = 300

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function unescapeHtml(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function extractYearSection(articleHtml) {
  const yearMatch = articleHtml.match(/<h2[^>]*class="all-books__title-year"[^>]*>(.*?)<\/h2>/)
  return yearMatch ? stripHtml(yearMatch[1]).trim() : null
}

function slugFromHref(href) {
  let slug = href.replace(/^\/+/, '').replace(/\.html$/, '')
  if (slug.startsWith('book-')) {
    slug = slug.slice(5)
  }
  return slug
}

function parseListingPage(html) {
  const articles = html.split(/<article[^>]*class="all-books__of-one-year"[^>]*>/).slice(1)

  const books = []
  const seenSlugs = new Set()

  for (const articleHtml of articles) {
    const yearRaw = extractYearSection(articleHtml) || 'unknown'
    const year = yearRaw === 'Предзаказ' ? 'preorder' : yearRaw

    const articleEnd = articleHtml.indexOf('</article>')
    const cleanArticle = articleEnd > 0 ? articleHtml.slice(0, articleEnd) : articleHtml

    const items = cleanArticle.split(/<li[^>]*class="all-books__item[^"]*"[^>]*>/).slice(1)

    for (const itemHtml of items) {
      const liEnd = itemHtml.indexOf('</li>')
      const cleanItem = liEnd > 0 ? itemHtml.slice(0, liEnd) : itemHtml

      const linkMatch = cleanItem.match(/href="([^"]+)"/)
      if (!linkMatch) continue

      const href = linkMatch[1]

      if (href === '' || href === '#') {
        const isSub = /all-books__link-to-suscription/i.test(cleanItem) || /Подписка/i.test(cleanItem)
        if (isSub) {
          const slug = '_subscription'
          if (seenSlugs.has(slug)) continue
          seenSlugs.add(slug)
          books.push({
            slug,
            href: href || '#',
            title: 'Подписка на книги',
            coverUrl: null,
            year,
            isPreorder: true,
            isSubscription: true,
            listingAuthor: null,
            listingSlogan: null,
            listingType: null,
          })
          continue
        }
        continue
      }

      if (href.includes('javascript:')) continue

      const slug = slugFromHref(href)
      if (seenSlugs.has(slug)) continue
      seenSlugs.add(slug)

      const imgMatch = cleanItem.match(/src="([^"]*?)"/)
      const altMatch = cleanItem.match(/alt="([^"]*?)"/)
      const imgSrc = imgMatch ? imgMatch[1] : null
      const altText = altMatch ? unescapeHtml(altMatch[1]) : null

      let titleFromDetail = null
      let sloganFromDetail = null
      let authorFromDetail = null
      let typeFromDetail = null

      const titleMatch = cleanItem.match(/class="all-books__book-title"[^>]*>([\s\S]*?)<\/h3>/)
      if (titleMatch) titleFromDetail = stripHtml(titleMatch[1])

      const sloganMatch = cleanItem.match(/class="all-books__book-slogan"[^>]*>([\s\S]*?)<\/p>/)
      if (sloganMatch) sloganFromDetail = stripHtml(sloganMatch[1])

      const authorMatch = cleanItem.match(/class="all-books__book-author"[^>]*>([\s\S]*?)<\/h\d>/)
      if (authorMatch) authorFromDetail = stripHtml(authorMatch[1])

      const typeMatch = cleanItem.match(/class="all-books__book-type"[^>]*>([\s\S]*?)<\/div>/)
      if (typeMatch) typeFromDetail = stripHtml(typeMatch[1])

      const isPreorder = /all-books__item_preorder/.test(cleanItem)

      const title = titleFromDetail || altText || slug

      books.push({
        slug,
        href,
        title,
        coverUrl: imgSrc ? (imgSrc.startsWith('http') ? imgSrc : `${BASE_URL}/${imgSrc.replace(/^\//, '')}`) : null,
        year,
        isPreorder: year === 'preorder' || isPreorder,
        isSubscription: false,
        listingAuthor: authorFromDetail,
        listingSlogan: sloganFromDetail,
        listingType: typeFromDetail,
      })
    }
  }

  return books
}

function parseDetailPage(html) {
  const result = {
    title: null,
    authors: [],
    thesis: null,
    description: null,
    litForm: null,
    ageRestriction: null,
    year: null,
    priceDigital: null,
    priceAudio: null,
    pricePrint: null,
    releaseDate: null,
    coverUrl: null,
    trailerUrl: null,
  }

  // Title - class can appear anywhere in the class list
  const titleMatch = html.match(/class="[^"]*bookpage-title[^"]*"[^>]*>([\s\S]*?)<\/h3>/)
  if (titleMatch) result.title = stripHtml(titleMatch[1])

  // Author(s) - class can appear anywhere in the class list
  const authorMatch = html.match(/class="[^"]*bookpage-author[^"]*"[^>]*>([\s\S]*?)<\/div>/)
  if (authorMatch) {
    const authorText = stripHtml(authorMatch[1]).trim()
    if (authorText) {
      result.authors = authorText
        .split(/[,;]/)
        .map((a) => a.trim())
        .filter(Boolean)
    }
  }

  // Thesis / slogan - look for sloganText span first, then slogan div
  const sloganTextMatch = html.match(/class="[^"]*bookpage-sloganText[^"]*"[^>]*>([\s\S]*?)<\/span>/)
  if (sloganTextMatch) {
    result.thesis = stripHtml(sloganTextMatch[1])
  } else {
    const sloganDivMatch = html.match(/class="[^"]*bookpage-slogan[^"]*"[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/)
    if (sloganDivMatch) result.thesis = stripHtml(sloganDivMatch[1])
  }

  // Date line: "2021 | повесть | 16+"
  const dateLineMatch = html.match(/class="[^"]*bookpage-date[^"]*"[^>]*>([\s\S]*?)<\/h3>/)
  if (dateLineMatch) {
    const dateLine = stripHtml(dateLineMatch[1])
    const parts = dateLine.split('|').map((p) => p.trim())
    if (parts[0]) result.year = parts[0]
    if (parts[1]) result.litForm = parts[1]
    if (parts[2]) {
      const ageMatch = parts[2].match(/(\d+)\+/)
      if (ageMatch) result.ageRestriction = parseInt(ageMatch[1], 10)
    }
  }

  // Description - first substantial <p class="white"> block
  const descMatches = html.matchAll(/class="white"[^>]*>([\s\S]*?)<\/p>/g)
  for (const m of descMatches) {
    const desc = stripHtml(m[1]).trim()
    if (desc.length > 30 && !desc.startsWith('Дата') && !desc.startsWith('Формат')) {
      result.description = desc
      break
    }
  }

  // Extract ALL price blocks (paperbook, ebook, audiobook)
  const priceBlocks = html.matchAll(/class="[^"]*bookpage-buybuyblock[^"]*"[^>]*>([\s\S]*?)(?=<div[^>]*class="[^"]*bookpage-buybuyblock|$)/g)

  // Paperbook price
  const paperBlock = html.match(/class="[^"]*bookpage-buybuyblock--paperbook[^"]*"[\s\S]*?(?=<div[^>]*class="[^"]*bookpage-buybuyblock|<\/div>\s*<\/div>\s*<\/div>\s*<\/div>)/)
  if (paperBlock) {
    const block = paperBlock[0]
    const priceMatch = block.match(/class="bookpage-price"[^>]*>([\s\S]*?)<\/div>/)
    if (priceMatch) {
      const priceStr = stripHtml(priceMatch[1]).replace(/[^\d]/g, '')
      if (priceStr) result.pricePrint = parseInt(priceStr, 10)
    }
    const dateMatch = block.match(/Дата релиза:\s*([\S\s]*?)<\/span>/)
    if (dateMatch) {
      const rawDate = stripHtml(dateMatch[1]).replace(/<[^>]*>/g, '').trim()
      if (rawDate) result.releaseDate = rawDate
    }
  }

  // E-book price
  const ebookBlock = html.match(/class="[^"]*bookpage-buybuyblock--ebook[^"]*"[\s\S]*?(?=<div[^>]*class="[^"]*bookpage-buybuyblock|<\/div>\s*<\/div>\s*<\/div>\s*<\/div>)/)
  if (ebookBlock) {
    const block = ebookBlock[0]
    const priceMatch = block.match(/class="bookpage-price"[^>]*>([\s\S]*?)<\/div>/)
    if (priceMatch) {
      const priceStr = stripHtml(priceMatch[1]).replace(/[^\d]/g, '')
      if (priceStr) result.priceDigital = parseInt(priceStr, 10)
    }
    if (!result.releaseDate) {
      const dateMatch = block.match(/Дата релиза:\s*([\S\s]*?)(?:<\/span>|<\/label>|<br)/)
      if (dateMatch) {
        const rawDate = stripHtml(dateMatch[1]).replace(/<[^>]*>/g, '').trim()
        if (rawDate) result.releaseDate = rawDate
      }
    }
  }

  // Audiobook price
  const audioBlock = html.match(/class="[^"]*bookpage-buybuyblock--audiobook[^"]*"[\s\S]*?(?=<div[^>]*class="[^"]*bookpage-buybuyblock|<\/div>\s*<\/div>\s*<\/div>\s*<\/div>)/)
  if (audioBlock) {
    const priceMatch = audioBlock[0].match(/class="bookpage-price"[^>]*>([\s\S]*?)<\/div>/)
    if (priceMatch) {
      const priceStr = stripHtml(priceMatch[1]).replace(/[^\d]/g, '')
      if (priceStr) result.priceAudio = parseInt(priceStr, 10)
    }
  }

  // Cover image from detail page slider or main image
  const coverSliderMatch = html.match(/class="bookpage-summary__slider"[\s\S]*?<img[^>]*src="([^"]+)"/)
  if (coverSliderMatch) {
    let coverSrc = coverSliderMatch[1]
    if (!coverSrc.startsWith('http')) {
      coverSrc = `${BASE_URL}/${coverSrc.replace(/^\//, '')}`
    }
    result.coverUrl = coverSrc
  } else {
    // Fallback: find cover in the main banner area
    const bannerMatch = html.match(/class="bookpage-maintitle"[\s\S]*?<img[^>]*src="([^"]+)"/)
    if (bannerMatch) {
      let coverSrc = bannerMatch[1]
      if (!coverSrc.startsWith('http')) {
        coverSrc = `${BASE_URL}/${coverSrc.replace(/^\//, '')}`
      }
      result.coverUrl = coverSrc
    }
  }

  // Also check <meta property="og:image"> for cover
  if (!result.coverUrl) {
    const ogMatch = html.match(/property="og:image"\s+content="([^"]+)"/)
    if (ogMatch) {
      let coverSrc = ogMatch[1]
      if (!coverSrc.startsWith('http')) {
        coverSrc = `${BASE_URL}/${coverSrc.replace(/^\//, '')}`
      }
      result.coverUrl = coverSrc
    }
  }

  // Trailer
  const trailerMatch = html.match(/src="(https?:\/\/[^"]*rutube[^"]*\/)"/)
  if (trailerMatch) result.trailerUrl = trailerMatch[1]

  return result
}

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
    },
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
  }
  return res.text()
}

async function main() {
  console.log('Fetching all-books listing page...')
  const listingHtml = await fetchPage(ALL_BOOKS_URL)

  console.log('Parsing listing page...')
  const books = parseListingPage(listingHtml)
  console.log(`Found ${books.length} book entries on listing page`)

  const seenDetailSlugs = new Set()

  for (let i = 0; i < books.length; i++) {
    const book = books[i]
    console.log(`[${i + 1}/${books.length}] Scraping detail page: ${book.href}`)

    if (book.isSubscription || book.href === '#') {
      console.log('  Skipping subscription/non-link item')
      continue
    }

    if (seenDetailSlugs.has(book.slug)) {
      console.log(`  Skipping duplicate detail: ${book.slug}`)
      continue
    }
    seenDetailSlugs.add(book.slug)

    try {
      const detailUrl = book.href.startsWith('http') ? book.href : `${BASE_URL}/${book.href.replace(/^\//, '')}`
      const detailHtml = await fetchPage(detailUrl)
      const detail = parseDetailPage(detailHtml)

      if (detail.title && (!book.title || book.title === book.slug || book.title === 'Об пол')) book.title = detail.title
      if (detail.authors.length > 0) book.detailAuthors = detail.authors
      if (detail.thesis) book.thesis = detail.thesis
      if (detail.description) book.description = detail.description
      if (detail.litForm) book.litForm = detail.litForm
      if (detail.ageRestriction !== null) book.ageRestriction = detail.ageRestriction
      if (detail.year) book.detailYear = detail.year
      if (detail.priceDigital !== null) book.priceDigital = detail.priceDigital
      if (detail.priceAudio !== null) book.priceAudio = detail.priceAudio
      if (detail.pricePrint !== null) book.pricePrint = detail.pricePrint
      if (detail.releaseDate) book.releaseDate = detail.releaseDate
      if (detail.coverUrl) book.detailCoverUrl = detail.coverUrl
      if (detail.trailerUrl) book.trailerUrl = detail.trailerUrl

      console.log(`  → ${book.title} | ${(book.detailAuthors || []).join(', ') || 'no author'} | ${book.litForm || '?'} | ${book.ageRestriction || '?'}+`)
    } catch (err) {
      console.error(`  Error fetching ${book.href}: ${err.message}`)
    }

    await sleep(DELAY_MS)
  }

  const output = {
    scrapedAt: new Date().toISOString(),
    source: ALL_BOOKS_URL,
    totalBooks: books.length,
    books,
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2))
  console.log(`\nDone! Wrote ${books.length} books to ${OUTPUT_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})