import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { makeBlurDataUrl } from './_blur.mjs'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(SCRIPT_DIR, '..')
const DEFAULT_EPUB = '/home/mildfire/Downloads/mrd6/МРД № 6 2026/Могучий Русский Динозавр № 6.epub'
const epubPath = process.argv[2] ?? DEFAULT_EPUB
const outputImageDir = join(REPO_ROOT, 'public', 'articles', 'mrd6')
const outputSqlPath = join(REPO_ROOT, 'supabase', 'seed-articles-mrd6.sql')
const outputManifestPath = join(REPO_ROOT, 'supabase', 'seed-articles-mrd6.json')
const publishedAt = '2026-01-20T12:00:00.000Z'

const CYRILLIC = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
 ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
}

function decodeEntities(value) {
  return value
    .replace(/&#160;|&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
}

function htmlToText(html) {
  return decodeEntities(html.replace(/<br\b[^>]*\/?>/gi, ' ').replace(/<[^>]+>/g, ''))
    .replace(/\s+/g, ' ')
    .trim()
}

function slugify(value) {
  return value
    .toLowerCase()
    .split('')
    .map((char) => CYRILLIC[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function sqlString(value) {
  if (value === null || value === undefined) return 'NULL'
  return `'${String(value).replace(/'/g, "''")}'`
}

function sqlJson(value) {
  return `${sqlString(JSON.stringify(value))}::jsonb`
}

function extractBody(xhtml) {
  const match = xhtml.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)
  return match?.[1] ?? ''
}

function extractTitle(body) {
  const match = body.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)
  return htmlToText(match?.[1] ?? '')
}

function parseArticle(body) {
  const blocks = []
  let pendingCaption = null
  const elementPattern = /<(p|h5|div)\b[^>]*>([\s\S]*?)<\/\1>/gi
  for (const match of body.matchAll(elementPattern)) {
    const [, tag, inner] = match
    if (tag === 'div') {
      const img = inner.match(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i)
      if (img) {
        blocks.push({ kind: 'image', source: img[1], caption: null })
        pendingCaption = blocks[blocks.length - 1]
      }
      continue
    }

    const text = htmlToText(inner)
    if (!text) continue
    if (tag === 'h5' && pendingCaption && text.startsWith('Иллюстрация ')) {
      pendingCaption.caption = text
      pendingCaption = null
      continue
    }
    blocks.push({ kind: 'paragraph', text })
    pendingCaption = null
  }
  return blocks
}

function getArticleEntries(toc) {
  const entries = []
  const pattern = /<navLabel>\s*<text>([\s\S]*?)<\/text>\s*<\/navLabel>\s*<content src="([^"]+)"/g
  for (const match of toc.matchAll(pattern)) {
    const label = htmlToText(match[1])
    const src = decodeEntities(match[2])
    if (!/^index_split_0(0[2-9]|1[0-3])\.xhtml$/.test(src)) continue
    const [title, author] = label.split('|').map((part) => part.trim())
    if (!title || !author) continue
    entries.push({ title, author, src })
  }
  return entries
}

async function buildArticle(extractDir, entry) {
  const xhtml = readFileSync(join(extractDir, entry.src), 'utf8')
  const heading = extractTitle(extractBody(xhtml))
  const title = entry.title || heading.split('|')[0]?.trim()
  const author = entry.author
  const sourceBlocks = parseArticle(extractBody(xhtml))
  const slug = `mrd6-${slugify(title)}`

  let coverPath = null
  let coverBlur = null
  let coverWidth = null
  let coverHeight = null
  const contentBlocks = []

  for (const block of sourceBlocks) {
    if (block.kind === 'paragraph') {
      contentBlocks.push(block)
      continue
    }

    const ext = extname(block.source).replace(/\.(jpg|jpeg)\.jpg$/i, '.jpg').replace(/\.(png)\.png$/i, '.png')
    const normalizedExt = ext === '.jpeg' ? '.jpg' : ext || extname(block.source)
    const imageName = `${slug}${normalizedExt}`
    const repoPath = `mrd6/${imageName}`
    const sourcePath = join(extractDir, block.source)
    const targetPath = join(outputImageDir, imageName)
    copyFileSync(sourcePath, targetPath)

    if (!coverPath) {
      const buffer = readFileSync(sourcePath)
      const meta = await sharp(buffer).metadata()
      coverPath = repoPath
      coverWidth = meta.width ?? null
      coverHeight = meta.height ?? null
      coverBlur = await makeBlurDataUrl(buffer)
    }

    contentBlocks.push({ kind: 'image', path: repoPath, caption: block.caption })
  }

  const excerpt = contentBlocks.find((block) => block.kind === 'paragraph')?.text.slice(0, 220) ?? null
  return {
    slug,
    title,
    author,
    coverPath,
    coverBlur,
    coverWidth,
    coverHeight,
    excerpt,
    contentBlocks,
  }
}

function buildSql(articles) {
  const authors = [...new Set(articles.map((article) => article.author))]
  const lines = [
    '-- Generated by scripts/extract-mrd6-articles.mjs from Могучий Русский Динозавр № 6.epub',
    '-- Re-runnable. Inserts missing authors by name and upserts Articles by slug.',
    '',
    'BEGIN;',
    '',
    `SELECT setval('"Authors_id_seq"', COALESCE((SELECT MAX(id) FROM "Authors"), 0) + 1, false);`,
    `SELECT setval('"Articles_id_seq"', COALESCE((SELECT MAX(id) FROM "Articles"), 0) + 1, false);`,
    '',
  ]

  for (const author of authors) {
    lines.push(
      `INSERT INTO "Authors" (name)`,
      `SELECT ${sqlString(author)}`,
      `WHERE NOT EXISTS (SELECT 1 FROM "Authors" WHERE name = ${sqlString(author)});`,
      '',
    )
  }

  for (const article of articles) {
    lines.push(
      `INSERT INTO "Articles" (slug, title, author_id, cover_path, cover_blur, cover_width, cover_height, excerpt, content_blocks, published_at)`,
      `VALUES (`,
      `  ${sqlString(article.slug)},`,
      `  ${sqlString(article.title)},`,
      `  (SELECT id FROM "Authors" WHERE name = ${sqlString(article.author)} ORDER BY id LIMIT 1),`,
      `  ${sqlString(article.coverPath)},`,
      `  ${sqlString(article.coverBlur)},`,
      `  ${article.coverWidth ?? 'NULL'},`,
      `  ${article.coverHeight ?? 'NULL'},`,
      `  ${sqlString(article.excerpt)},`,
      `  ${sqlJson(article.contentBlocks)},`,
      `  ${sqlString(publishedAt)}`,
      `)`,
      `ON CONFLICT (slug) DO UPDATE SET`,
      `  title = EXCLUDED.title,`,
      `  author_id = EXCLUDED.author_id,`,
      `  cover_path = EXCLUDED.cover_path,`,
      `  cover_blur = EXCLUDED.cover_blur,`,
      `  cover_width = EXCLUDED.cover_width,`,
      `  cover_height = EXCLUDED.cover_height,`,
      `  excerpt = EXCLUDED.excerpt,`,
      `  content_blocks = EXCLUDED.content_blocks,`,
      `  published_at = EXCLUDED.published_at;`,
      '',
    )
  }

  lines.push('COMMIT;', '')
  return lines.join('\n')
}

async function main() {
  const extractDir = mkdtempSync(join(tmpdir(), 'mrd6-epub-'))
  try {
    mkdirSync(outputImageDir, { recursive: true })
    execFileSync('python3', ['-m', 'zipfile', '-e', epubPath, extractDir], { stdio: 'inherit' })

    const toc = readFileSync(join(extractDir, 'toc.ncx'), 'utf8')
    const entries = getArticleEntries(toc)
    const articles = []
    for (const entry of entries) {
      articles.push(await buildArticle(extractDir, entry))
    }

    writeFileSync(outputSqlPath, buildSql(articles))
    writeFileSync(outputManifestPath, `${JSON.stringify(articles, null, 2)}\n`)

    console.log(`Extracted ${articles.length} article(s).`)
    console.log(`Images: ${outputImageDir}`)
    console.log(`SQL: ${outputSqlPath}`)
    console.log(`Manifest: ${outputManifestPath}`)
    for (const article of articles) {
      const paragraphCount = article.contentBlocks.filter((block) => block.kind === 'paragraph').length
      console.log(`- ${article.title} | ${article.author} (${paragraphCount} paragraphs)`)
    }
  } finally {
    rmSync(extractDir, { recursive: true, force: true })
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
