// Generate storage-source assets and re-runnable seed SQL for all issues of
// «Могучий Русский Динозавр».
//
// Outputs:
//   storage-assets/articles/mrd<N>/<slug>.jpg
//   storage-assets/covers/mrd-<N>.jpg
//   storage-assets/digital-files/ebook/mrd-<N>.<ext>
//   supabase/seed-articles-mrd<N>.sql
//   supabase/seed-mrd<N>.sql
//   supabase/seed-mrd-workers.sql
//
// Run from repo root:
//   node scripts/extract-mrd-issues.mjs

import { execFileSync } from 'node:child_process'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, extname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { makeBlurDataUrl } from './_blur.mjs'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(SCRIPT_DIR, '..')
const STORAGE_ASSETS_DIR = join(REPO_ROOT, 'storage-assets')
const ARTICLE_ASSETS_DIR = join(STORAGE_ASSETS_DIR, 'articles')
const COVER_ASSETS_DIR = join(STORAGE_ASSETS_DIR, 'covers')
const DIGITAL_ASSETS_DIR = join(STORAGE_ASSETS_DIR, 'digital-files')

const PERIODICAL_SLUG = 'moguchij-russkij-dinozavr'
const PERIODICAL_NAME = 'Могучий Русский Динозавр'

const CYRILLIC = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y',
  ь: '', э: 'e', ю: 'yu', я: 'ya',
}

const issues = [
  {
    number: 1,
    year: '2020',
    sourceKind: 'pdf',
    source: '/home/mildfire/Downloads/MoguchijRusskijDinozavr.pdf',
    publishedAt: '2020-12-30T12:00:00.000Z',
    formats: ['PDF'],
    characterCount: 140000,
    releaseDate: '2020-12-30',
    publishDate: '2020-12-30',
    digitalSource: '/home/mildfire/Downloads/MoguchijRusskijDinozavr.pdf',
    workers: {
      ebook: [
        ['Екатерина Яковлева', 'иллюстратор'],
        ['Наталья Коваленко', 'иллюстратор'],
        ['Дмитрий Козлов', 'иллюстратор'],
        ['Лена Солнцева', 'иллюстратор'],
        ['Ольга Тамкович', 'иллюстратор'],
        ['Александра Давидович', 'иллюстратор'],
        ['Мария Давидович', 'иллюстратор'],
        ['Илья Смирнов', 'иллюстратор'],
        ['Александра Яшаркина', 'верстальщик'],
        ['Сергей Дедович', 'редактор'],
        ['Максим Димов', 'веб-мастер'],
        ['Серафим Лоза', 'веб-мастер'],
      ],
    },
  },
  {
    number: 2,
    year: '2021',
    sourceKind: 'pdf',
    source: '/home/mildfire/Downloads/mrd2-2021.pdf',
    publishedAt: '2021-12-30T12:00:00.000Z',
    formats: ['PDF'],
    characterCount: null,
    releaseDate: '2021-12-30',
    publishDate: '2021-12-30',
    digitalSource: '/home/mildfire/Downloads/mrd2-2021.pdf',
    workers: {
      ebook: [
        ['Катерина Курносова', 'иллюстратор'],
        ['Ольга Тамкович', 'иллюстратор'],
        ['Ксения Харина', 'иллюстратор'],
        ['Елена Солнцева', 'иллюстратор'],
        ['Екатерина Яковлева', 'иллюстратор'],
        ['Анна Мухина', 'иллюстратор'],
        ['Даниил Румянцев', 'дизайнер'],
        ['Катерина Видяскина', 'дизайнер'],
        ['Леон Меликьянц', 'верстальщик'],
        ['Анастасия Ворожейкина', 'редактор'],
        ['Александр Лызь', 'веб-мастер'],
      ],
    },
  },
  {
    number: 3,
    year: '2022',
    sourceKind: 'epub',
    source: findFirst('/home/mildfire/Downloads/mrd3', '.epub'),
    coverSource: null,
    publishedAt: '2022-12-30T12:00:00.000Z',
    formats: ['FB2', 'EPUB'],
    characterCount: 141000,
    releaseDate: '2022-12-30',
    publishDate: '2022-12-30',
    digitalSource: findFirst('/home/mildfire/Downloads/mrd3', '.epub'),
    workers: {
      ebook: [
        ['Полина Шарафутдинова', 'редактор'],
        ['Анастасия Ворожейкина', 'редактор'],
        ['Анна Волкова', 'редактор'],
        ['Никита Барков', 'редактор'],
        ['Катерина Гребенщикова', 'корректор'],
        ['Екатерина Ковалевская', 'иллюстратор'],
        ['Лена Солнцева', 'иллюстратор'],
        ['Ксения Харина', 'иллюстратор'],
        ['Ольга Тамкович', 'иллюстратор'],
        ['Горыныч', 'иллюстратор'],
        ['Катерина Видяскина', 'дизайнер'],
        ['Алексей Капустяк', 'верстальщик'],
        ['Диана Гильманова', 'продюсер'],
      ],
    },
  },
  {
    number: 4,
    year: '2023',
    sourceKind: 'epub',
    source: '/home/mildfire/Downloads/mrd4/Могучий Русский Динозавр 4/Могучий Русский Динозавр № 4.epub',
    coverSource: '/home/mildfire/Downloads/mrd4/Могучий Русский Динозавр 4/Могучий Русский Динозавр № 4.png',
    publishedAt: '2023-12-31T12:00:00.000Z',
    formats: ['FB2', 'EPUB', 'PDF'],
    characterCount: 189000,
    releaseDate: '2023-12-31',
    publishDate: '2023-12-31',
    digitalSource: '/home/mildfire/Downloads/mrd4/Могучий Русский Динозавр 4/Могучий Русский Динозавр № 4.epub',
    workers: {
      ebook: [
        ['Анна Волкова', 'редактор'],
        ['Катерина Гребенщикова', 'редактор'],
        ['Никита Барков', 'редактор'],
        ['Ася Шарамаева', 'редактор'],
        ['Дарья Ягрова', 'корректор'],
        ['Татьяна Чикичева', 'корректор'],
        ['Вера Вересиянова', 'корректор'],
        ['Нелли Реук', 'корректор'],
        ['Елена Солнцева', 'иллюстратор'],
        ['Екатерина Ковалевская', 'иллюстратор'],
        ['Ксения Харина', 'иллюстратор'],
        ['daha amelina', 'иллюстратор'],
        ['Горыныч', 'иллюстратор'],
        ['Юлия Микуша', 'дизайнер'],
        ['Артём Артамонов', 'дизайнер'],
        ['Алексей Капустяк', 'верстальщик'],
        ['Александра Яшаркина', 'верстальщик'],
        ['Диана Гильманова', 'продюсер'],
      ],
    },
  },
  {
    number: 5,
    year: '2024',
    sourceKind: 'epub',
    source: '/home/mildfire/Downloads/МРД № 5 2024/Могучий Русский Динозавр № 5.epub',
    coverSource: null,
    publishedAt: '2024-12-31T12:00:00.000Z',
    formats: ['FB2', 'EPUB', 'PDF'],
    characterCount: 269000,
    releaseDate: '2024-10-15',
    publishDate: '2025-01-01',
    digitalSource: '/home/mildfire/Downloads/МРД № 5 2024/Могучий Русский Динозавр № 5.epub',
    print: {
      price: 700,
      publishDate: '2025-01-01',
      releaseDate: '2024-10-15',
      format: '210×297 мм',
      pageCount: 204,
      paper: 'офсетная, 80 гр/кв.м',
      coverMaterial: 'мелованная, 250 гр/кв.м, матовое ламинирование',
      binding: 'КБС, термопак поэкземплярно',
      illustrations: 'чёрно-белые',
    },
    workers: {
      all: [
        ['Анна Волкова', 'редактор'],
        ['Никита Барков', 'редактор'],
        ['Ася Шарамаева', 'редактор'],
        ['Глеб Кашеваров', 'редактор'],
        ['Ирина Курако', 'редактор'],
        ['Софья Попова', 'редактор'],
        ['Вера Вересиянова', 'корректор'],
        ['Нелли Реук', 'корректор'],
        ['Анастасия Давыдова', 'корректор'],
        ['Татьяна Максимова', 'корректор'],
        ['Катерина Гребенщикова', 'корректор'],
        ['Анастасия Автухова', 'корректор'],
        ['Александра Крученкова', 'корректор'],
        ['Ксения Шунькина', 'корректор'],
        ['Лена Солнцева', 'иллюстратор'],
        ['Екатерина Ковалевская', 'иллюстратор'],
        ['Кладбище Джо', 'иллюстратор'],
        ['Екатерина Апенько', 'иллюстратор'],
        ['Анастасия Болбат', 'иллюстратор'],
        ['Ольга Осипова', 'дизайнер'],
        ['Артём Артамонов', 'дизайнер'],
        ['Виктория Юшина', 'верстальщик'],
        ['Диана Гильманова', 'верстальщик'],
        ['Илья Черкасов', 'веб-мастер'],
        ['Александра Вакулинская', 'продюсер'],
      ],
    },
  },
  {
    number: 6,
    year: '2026',
    sourceKind: 'epub',
    source: '/home/mildfire/Downloads/mrd6/МРД № 6 2026/Могучий Русский Динозавр № 6.epub',
    coverSource: null,
    publishedAt: '2026-01-20T12:00:00.000Z',
    formats: ['FB2', 'EPUB'],
    characterCount: 280000,
    releaseDate: '2026-01-20',
    publishDate: '2026-01-20',
    digitalSource: '/home/mildfire/Downloads/mrd6/МРД № 6 2026/Могучий Русский Динозавр № 6.epub',
    workers: {
      ebook: [
        ['Ирина Курако', 'редактор'],
        ['Ася Шарамаева', 'редактор'],
        ['Глеб Кашеваров', 'редактор'],
        ['Александра Яковлева', 'редактор'],
        ['Наталья Атряхайлова', 'редактор'],
        ['Вера Вересиянова', 'корректор'],
        ['Александра Каменёк', 'корректор'],
        ['Катерина Гребенщикова', 'корректор'],
        ['Софья Попова', 'корректор'],
        ['Полина Смолякова', 'корректор'],
        ['Лена Солнцева', 'иллюстратор'],
        ['Маргарита Царева', 'иллюстратор'],
        ['Екатерина Ковалевская', 'иллюстратор'],
        ['Екатерина Кравченко', 'дизайнер'],
        ['Диана Гильманова', 'верстальщик'],
        ['Анастасия Лукьянова', 'веб-мастер'],
        ['Дарья Драхлер', 'продюсер'],
      ],
    },
  },
]

function findFirst(root, extension) {
  const stack = [root]
  while (stack.length) {
    const dir = stack.pop()
    if (!dir || !existsSync(dir)) continue
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) stack.push(fullPath)
      else if (entry.isFile() && entry.name.toLowerCase().endsWith(extension)) return fullPath
    }
  }
  return null
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

function sqlArray(values) {
  return `ARRAY[${values.map(sqlString).join(', ')}]`
}

function sqlJson(value) {
  return `${sqlString(JSON.stringify(value))}::jsonb`
}

function ensureDir(path) {
  mkdirSync(path, { recursive: true })
}

function pageCount(pdf) {
  const info = execFileSync('pdfinfo', [pdf], { encoding: 'utf8' })
  return Number(info.match(/Pages:\s*(\d+)/)?.[1] ?? 0)
}

function parsePdfToc(issue) {
  const txt = execFileSync('pdftotext', ['-layout', '-f', '1', '-l', '8', issue.source, '-'], { encoding: 'utf8' })
  const after = txt.split(/Содержание/).slice(1).join('Содержание')
  const lines = after.split('\n').map((line) => line.trim()).filter(Boolean)
  const entries = []
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(.+?)\s*\|\s*(.+?)(?:\s+(\d{1,3}))?$/)
    if (!match) continue
    let page = match[3] ? Number(match[3]) : null
    for (let j = i + 1; !page && j < Math.min(i + 4, lines.length); j++) {
      const pageMatch = lines[j].match(/^(\d{1,3})$/)
      if (pageMatch) page = Number(pageMatch[1])
    }
    if (!page) continue
    entries.push({ title: match[1].trim(), author: match[2].trim(), page })
  }
  return entries
}

function parsePdfBody(issue, start, end, title, author) {
  const txt = execFileSync('pdftotext', ['-layout', '-f', String(start), '-l', String(end), issue.source, '-'], {
    encoding: 'utf8',
  })
  const titleUpper = title.toUpperCase()
  const paragraphs = []
  let current = ''
  let pendingHyphen = false
  const flush = () => {
    const value = current.trim()
    if (value) paragraphs.push(value)
    current = ''
    pendingHyphen = false
  }

  for (const rawLine of txt.split('\n')) {
    const line = rawLine.replace(/\f/g, '')
    const text = line.trim()
    const indent = line.length - line.trimStart().length
    if (!text) {
      flush()
      continue
    }
    if (/^\d{1,3}$/.test(text)) continue
    if (/\s\|\s/.test(text)) continue
    if (/^Иллюстрация\b/i.test(text)) continue
    if (text === title || text === titleUpper || text === author) continue
    if (/^(Литературно-художественное издание|Авторы:|Иллюстратор|Иллюстраторы:|Полное или частичное копирование)/i.test(text)) continue
    if (/^ч\s+и\s+т/i.test(text)) continue
    if (/^https?:\/\//i.test(text)) continue
    if (indent > 18) continue
    const startsParagraph = indent >= 2 && indent <= 18
    if (startsParagraph) flush()
    current = pendingHyphen ? current.replace(/-$/, '') + text : current ? `${current} ${text}` : text
    pendingHyphen = /-$/.test(text)
  }
  flush()
  return paragraphs.filter((paragraph) => paragraph.length > 1)
}

async function pickPdfIllustration(issue, start, end) {
  const dir = mkdtempSync(join(tmpdir(), `mrd${issue.number}-img-`))
  const last = Math.min(start + 3, end)
  execFileSync('pdfimages', ['-png', '-p', '-f', String(start), '-l', String(last), issue.source, join(dir, 'i')], {
    stdio: 'ignore',
  })
  let best = null
  for (const file of readdirSync(dir).sort()) {
    if (!file.endsWith('.png')) continue
    const buffer = readFileSync(join(dir, file))
    const meta = await sharp(buffer).metadata()
    const width = meta.width ?? 0
    const height = meta.height ?? 0
    if (width < 500 || height < 250) continue
    const area = width * height
    if (!best || area > best.area) best = { buffer, width, height, area }
  }
  rmSync(dir, { recursive: true, force: true })
  return best
}

async function renderPdfCover(issue) {
  const dir = mkdtempSync(join(tmpdir(), `mrd${issue.number}-cover-`))
  execFileSync('pdftoppm', ['-jpeg', '-r', '180', '-f', '1', '-singlefile', issue.source, join(dir, 'cover')], {
    stdio: 'ignore',
  })
  const buffer = readFileSync(join(dir, 'cover.jpg'))
  rmSync(dir, { recursive: true, force: true })
  return buffer
}

function extractBody(xhtml) {
  const match = xhtml.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)
  return match?.[1] ?? ''
}

function getArticleEntries(toc) {
  const entries = []
  const pattern = /<navLabel>\s*<text>([\s\S]*?)<\/text>\s*<\/navLabel>\s*<content src="([^"]+)"/g
  for (const match of toc.matchAll(pattern)) {
    const label = htmlToText(match[1])
    const source = decodeEntities(match[2]).split('#')[0]
    if (!/index_split_\d+\.xhtml$/i.test(source)) continue
    if (!label.includes('|')) continue
    const [title, author] = label.split('|').map((part) => part.trim())
    if (!title || !author) continue
    entries.push({ title, author, source })
  }
  return entries
}

function parseEpubArticle(body) {
  const blocks = []
  let leadImage = null
  const elementPattern = /<(h1|h2|p|div)\b[^>]*>([\s\S]*?)<\/\1>/gi
  for (const match of body.matchAll(elementPattern)) {
    const [, tag, inner] = match
    const image = inner.match(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i)
    if (image && !leadImage) {
      leadImage = image[1]
    }
    const text = htmlToText(inner)
    if (!text) continue
    if (tag === 'h1' || tag === 'h2') continue
    if (/^(20\d{2}|Иллюстрация\b)/i.test(text)) continue
    blocks.push({ kind: 'paragraph', text })
  }
  return { leadImage, blocks }
}

function getEpubCoverPath(extractDir) {
  const opf = readFileSync(join(extractDir, 'content.opf'), 'utf8')
  const coverId = opf.match(/<meta\s+name=["']cover["']\s+content=["']([^"']+)["']/i)?.[1]
  if (coverId) {
    const itemPattern = new RegExp(`<item\\b[^>]*id=["']${coverId}["'][^>]*href=["']([^"']+)["']`, 'i')
    const path = opf.match(itemPattern)?.[1]
    if (path) return decodeEntities(path)
  }
  const fallback = ['fb2_cover_calibre_mi.jpg', 'cover.jpg', 'cover.jpeg', 'cover.png']
  return fallback.find((path) => existsSync(join(extractDir, path))) ?? null
}

async function writeJpeg(buffer, targetPath, maxWidth = 1600) {
  const output = await sharp(buffer)
    .resize({ width: maxWidth, height: maxWidth, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 84 })
    .toBuffer()
  writeFileSync(targetPath, output)
  const meta = await sharp(output).metadata()
  return {
    buffer: output,
    width: meta.width ?? null,
    height: meta.height ?? null,
    blur: await makeBlurDataUrl(output),
  }
}

async function extractPdfIssue(issue) {
  const articleDir = join(ARTICLE_ASSETS_DIR, `mrd${issue.number}`)
  ensureDir(articleDir)
  const totalPages = pageCount(issue.source)
  const toc = parsePdfToc(issue)
  if (!toc.length) throw new Error(`No PDF TOC entries parsed for MRD${issue.number}`)
  const articles = []
  for (let i = 0; i < toc.length; i++) {
    const entry = toc[i]
    const end = i + 1 < toc.length ? toc[i + 1].page - 1 : Math.min(totalPages, entry.page + 30)
    const slug = `mrd${issue.number}-${slugify(entry.title)}`
    const paragraphs = parsePdfBody(issue, entry.page, end, entry.title, entry.author)
    const illustration = await pickPdfIllustration(issue, entry.page, end)
    let coverPath = null
    let coverBlur = null
    let coverWidth = null
    let coverHeight = null
    const contentBlocks = []
    if (illustration) {
      const imageName = `${slug}.jpg`
      const imageInfo = await writeJpeg(illustration.buffer, join(articleDir, imageName), 1200)
      coverPath = `mrd${issue.number}/${imageName}`
      coverBlur = imageInfo.blur
      coverWidth = imageInfo.width
      coverHeight = imageInfo.height
      contentBlocks.push({ kind: 'image', path: coverPath, caption: null })
    }
    for (const paragraph of paragraphs) contentBlocks.push({ kind: 'paragraph', text: paragraph })
    articles.push({
      slug,
      title: entry.title,
      author: entry.author,
      coverPath,
      coverBlur,
      coverWidth,
      coverHeight,
      excerpt: paragraphs[0]?.slice(0, 220) ?? null,
      contentBlocks,
    })
  }
  await writeVolumeCover(issue, await renderPdfCover(issue))
  return articles
}

async function extractEpubIssue(issue) {
  const articleDir = join(ARTICLE_ASSETS_DIR, `mrd${issue.number}`)
  ensureDir(articleDir)
  const extractDir = mkdtempSync(join(tmpdir(), `mrd${issue.number}-epub-`))
  try {
    execFileSync('python3', ['-m', 'zipfile', '-e', issue.source, extractDir], { stdio: 'ignore' })
    const toc = readFileSync(join(extractDir, 'toc.ncx'), 'utf8')
    const entries = getArticleEntries(toc)
    if (!entries.length) throw new Error(`No EPUB TOC entries parsed for MRD${issue.number}`)
    const articles = []
    for (const entry of entries) {
      const xhtml = readFileSync(join(extractDir, entry.source), 'utf8')
      const { leadImage, blocks: sourceBlocks } = parseEpubArticle(extractBody(xhtml))
      const slug = `mrd${issue.number}-${slugify(entry.title)}`
      let coverPath = null
      let coverBlur = null
      let coverWidth = null
      let coverHeight = null
      const contentBlocks = []
      if (leadImage) {
        const sourcePath = join(extractDir, leadImage)
        const imageName = `${slug}.jpg`
        const imageInfo = await writeJpeg(readFileSync(sourcePath), join(articleDir, imageName), 1600)
        coverPath = `mrd${issue.number}/${imageName}`
        coverBlur = imageInfo.blur
        coverWidth = imageInfo.width
        coverHeight = imageInfo.height
        contentBlocks.push({ kind: 'image', path: coverPath, caption: null })
      }
      contentBlocks.push(...sourceBlocks)
      const excerpt = sourceBlocks.find((block) => block.kind === 'paragraph')?.text.slice(0, 220) ?? null
      articles.push({
        slug,
        title: entry.title,
        author: entry.author,
        coverPath,
        coverBlur,
        coverWidth,
        coverHeight,
        excerpt,
        contentBlocks,
      })
    }
    if (issue.coverSource) {
      await writeVolumeCover(issue, readFileSync(issue.coverSource))
    } else {
      const coverPath = getEpubCoverPath(extractDir)
      if (!coverPath) throw new Error(`No EPUB cover found for MRD${issue.number}`)
      await writeVolumeCover(issue, readFileSync(join(extractDir, coverPath)))
    }
    return articles
  } finally {
    rmSync(extractDir, { recursive: true, force: true })
  }
}

async function writeVolumeCover(issue, buffer) {
  ensureDir(COVER_ASSETS_DIR)
  issue.coverInfo = await writeJpeg(buffer, join(COVER_ASSETS_DIR, `mrd-${issue.number}.jpg`), 1800)
}

function copyDigitalFile(issue) {
  if (!issue.digitalSource) return null
  ensureDir(join(DIGITAL_ASSETS_DIR, 'ebook'))
  const ext = extname(issue.digitalSource).toLowerCase() || '.bin'
  const key = `ebook/mrd-${issue.number}${ext}`
  copyFileSync(issue.digitalSource, join(DIGITAL_ASSETS_DIR, key))
  return key
}

function buildArticlesSql(issue, articles) {
  const authors = [...new Set(articles.map((article) => article.author))]
  const lines = [
    `-- Generated by scripts/extract-mrd-issues.mjs for МРД №${issue.number}.`,
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
      ''
    )
  }
  for (const article of articles) {
    lines.push(
      `INSERT INTO "Articles" (slug, title, author_id, cover_path, cover_blur, cover_width, cover_height, excerpt, content_blocks, published_at)`,
      'VALUES (',
      `  ${sqlString(article.slug)},`,
      `  ${sqlString(article.title)},`,
      `  (SELECT id FROM "Authors" WHERE name = ${sqlString(article.author)} ORDER BY id LIMIT 1),`,
      `  ${sqlString(article.coverPath)},`,
      `  ${sqlString(article.coverBlur)},`,
      `  ${article.coverWidth ?? 'NULL'},`,
      `  ${article.coverHeight ?? 'NULL'},`,
      `  ${sqlString(article.excerpt)},`,
      `  ${sqlJson(article.contentBlocks)},`,
      `  ${sqlString(issue.publishedAt)}`,
      ')',
      'ON CONFLICT (slug) DO UPDATE SET',
      '  title = EXCLUDED.title,',
      '  author_id = EXCLUDED.author_id,',
      '  cover_path = EXCLUDED.cover_path,',
      '  cover_blur = EXCLUDED.cover_blur,',
      '  cover_width = EXCLUDED.cover_width,',
      '  cover_height = EXCLUDED.cover_height,',
      '  excerpt = EXCLUDED.excerpt,',
      '  content_blocks = EXCLUDED.content_blocks,',
      '  published_at = EXCLUDED.published_at;',
      ''
    )
  }
  lines.push('COMMIT;', '')
  return lines.join('\n')
}

function buildIssueSql(issue, digitalFilePath) {
  const slug = `mrd-${issue.number}`
  const name = `МРД${issue.number}`
  const lines = [
    `-- МРД №${issue.number} (${issue.year}) — issue of «${PERIODICAL_NAME}».`,
    '-- Generated by scripts/extract-mrd-issues.mjs. Re-runnable.',
    '',
    'BEGIN;',
    '',
    `INSERT INTO "Periodicals" (name, slug, sort_order)`,
    `SELECT ${sqlString(PERIODICAL_NAME)}, ${sqlString(PERIODICAL_SLUG)}, 0`,
    `WHERE NOT EXISTS (SELECT 1 FROM "Periodicals" WHERE slug = ${sqlString(PERIODICAL_SLUG)});`,
    '',
    `SELECT setval('"Titles_id_seq"', COALESCE((SELECT MAX(id) FROM "Titles"), 0) + 1, false);`,
    `SELECT setval('"Ebooks_id_seq"', COALESCE((SELECT MAX(id) FROM "Ebooks"), 0) + 1, false);`,
    `SELECT setval('"PrintedBooks_id_seq"', COALESCE((SELECT MAX(id) FROM "PrintedBooks"), 0) + 1, false);`,
    `SELECT setval('"Titles_Authors_id_seq"', COALESCE((SELECT MAX(id) FROM "Titles_Authors"), 0) + 1, false);`,
    '',
    `INSERT INTO "Titles" (name, slug, cover, cover_blur, is_compilation, age_restriction, lit_form, first_release, status, periodical_id, volume_number, volume_year)`,
    `SELECT ${sqlString(name)}, ${sqlString(slug)}, ${sqlString(`mrd-${issue.number}.jpg`)}, ${sqlString(issue.coverInfo?.blur ?? null)}, true, 18, 'ежегодник', ${sqlString(issue.year)}, 'published',`,
    `       (SELECT id FROM "Periodicals" WHERE slug = ${sqlString(PERIODICAL_SLUG)}), ${issue.number}, ${sqlString(issue.year)}`,
    `WHERE NOT EXISTS (SELECT 1 FROM "Titles" WHERE slug = ${sqlString(slug)});`,
    '',
    `UPDATE "Titles" SET`,
    `  name = ${sqlString(name)},`,
    `  cover = ${sqlString(`mrd-${issue.number}.jpg`)},`,
    `  cover_blur = ${sqlString(issue.coverInfo?.blur ?? null)},`,
    `  is_compilation = true,`,
    `  age_restriction = 18,`,
    `  lit_form = 'ежегодник',`,
    `  first_release = ${sqlString(issue.year)},`,
    `  status = 'published',`,
    `  periodical_id = (SELECT id FROM "Periodicals" WHERE slug = ${sqlString(PERIODICAL_SLUG)}),`,
    `  volume_number = ${issue.number},`,
    `  volume_year = ${sqlString(issue.year)}`,
    `WHERE slug = ${sqlString(slug)};`,
    '',
    `DELETE FROM "PrintedBooks" WHERE title_id = (SELECT id FROM "Titles" WHERE slug = ${sqlString(slug)});`,
    `DELETE FROM "CardBooks" WHERE title_id = (SELECT id FROM "Titles" WHERE slug = ${sqlString(slug)});`,
    `DELETE FROM "Ebooks" WHERE title_id = (SELECT id FROM "Titles" WHERE slug = ${sqlString(slug)});`,
    '',
  ]

  if (issue.number === 6) {
    // The legacy МРД6 title used to carry the periodical slug itself; rename it
    // to mrd-6 BEFORE the INSERT INTO "Titles" so the upsert resolves correctly.
    const insertAt = lines.indexOf(
      `INSERT INTO "Titles" (name, slug, cover, cover_blur, is_compilation, age_restriction, lit_form, first_release, status, periodical_id, volume_number, volume_year)`
    )
    lines.splice(
      insertAt,
      0,
      `-- Migrate the legacy МРД6 title slug (it equalled the periodical slug) to mrd-6.`,
      `UPDATE "Titles" SET slug = ${sqlString(slug)} WHERE slug = ${sqlString(PERIODICAL_SLUG)};`,
      ''
    )
  }

  if (issue.print) {
    lines.push(
      `INSERT INTO "PrintedBooks"`,
      `  (title_id, price, is_published, publish_date, release_date, format, page_count, paper, cover_material, binding, illustrations)`,
      `SELECT (SELECT id FROM "Titles" WHERE slug = ${sqlString(slug)}), ${issue.print.price}, true, ${sqlString(issue.print.publishDate)}, ${sqlString(issue.print.releaseDate)},`,
      `  ${sqlString(issue.print.format)}, ${issue.print.pageCount}, ${sqlString(issue.print.paper)}, ${sqlString(issue.print.coverMaterial)}, ${sqlString(issue.print.binding)}, ${sqlString(issue.print.illustrations)};`,
      ''
    )
  }

  lines.push(
    `INSERT INTO "Ebooks" (title_id, price, is_published, publish_date, release_date, formats, character_count, file_path)`,
    `SELECT (SELECT id FROM "Titles" WHERE slug = ${sqlString(slug)}), 0, true, ${sqlString(issue.publishDate)}, ${sqlString(issue.releaseDate)},`,
    `  ${sqlArray(issue.formats)}, ${issue.characterCount ?? 'NULL'}, ${sqlString(digitalFilePath)};`,
    '',
    `UPDATE "Articles" SET title_id = (SELECT id FROM "Titles" WHERE slug = ${sqlString(slug)}) WHERE slug LIKE ${sqlString(`mrd${issue.number}-%`)};`,
    '',
    `DELETE FROM "Titles_Authors" WHERE title_id = (SELECT id FROM "Titles" WHERE slug = ${sqlString(slug)});`,
    `INSERT INTO "Titles_Authors" (title_id, author_id)`,
    `SELECT DISTINCT a.title_id, a.author_id`,
    `FROM "Articles" a`,
    `WHERE a.slug LIKE ${sqlString(`mrd${issue.number}-%`)} AND a.title_id IS NOT NULL AND a.author_id IS NOT NULL;`,
    '',
    'COMMIT;',
    ''
  )
  return lines.join('\n')
}

function workerListFor(issue, editionKind) {
  if (issue.workers?.all) return issue.workers.all
  return issue.workers?.[editionKind] ?? []
}

function buildWorkersSql() {
  const allWorkers = []
  for (const issue of issues) {
    allWorkers.push(...workerListFor(issue, 'ebook'))
    if (issue.print) allWorkers.push(...workerListFor(issue, 'printed'))
  }
  const uniqueWorkers = []
  const seen = new Set()
  for (const [name, job] of allWorkers) {
    const key = `${name}|${job}`
    if (seen.has(key)) continue
    seen.add(key)
    uniqueWorkers.push([name, job])
  }

  const lines = [
    '-- Production credits for МРД issues. Generated by scripts/extract-mrd-issues.mjs.',
    '-- Re-runnable. Inserts Workers by name+job and links them to issue editions.',
    '',
    'BEGIN;',
    '',
    `SELECT setval('"Workers_id_seq"', COALESCE((SELECT MAX(id) FROM "Workers"), 0) + 1, false);`,
    `SELECT setval('"EbookWorkers_id_seq"', COALESCE((SELECT MAX(id) FROM "EbookWorkers"), 0) + 1, false);`,
    `SELECT setval('"PrintedBookWorkers_id_seq"', COALESCE((SELECT MAX(id) FROM "PrintedBookWorkers"), 0) + 1, false);`,
    '',
  ]
  for (const [name, job] of uniqueWorkers) {
    lines.push(
      `INSERT INTO "Workers" (name, job)`,
      `SELECT ${sqlString(name)}, ${sqlString(job)}`,
      `WHERE NOT EXISTS (SELECT 1 FROM "Workers" WHERE name = ${sqlString(name)} AND job = ${sqlString(job)});`,
      ''
    )
  }

  for (const issue of issues) {
    const slug = `mrd-${issue.number}`
    const ebookWorkers = workerListFor(issue, 'ebook')
    lines.push(
      `DELETE FROM "EbookWorkers" WHERE ebook_id IN (SELECT id FROM "Ebooks" WHERE title_id = (SELECT id FROM "Titles" WHERE slug = ${sqlString(slug)}));`
    )
    ebookWorkers.forEach(([name, job], index) => {
      lines.push(
        `INSERT INTO "EbookWorkers" (ebook_id, worker_id, sort_order)`,
        `SELECT (SELECT id FROM "Ebooks" WHERE title_id = (SELECT id FROM "Titles" WHERE slug = ${sqlString(slug)}) ORDER BY id LIMIT 1),`,
        `       (SELECT id FROM "Workers" WHERE name = ${sqlString(name)} AND job = ${sqlString(job)} ORDER BY id LIMIT 1), ${index}`,
        `WHERE EXISTS (SELECT 1 FROM "Ebooks" WHERE title_id = (SELECT id FROM "Titles" WHERE slug = ${sqlString(slug)}))`,
        `ON CONFLICT (ebook_id, worker_id) DO UPDATE SET sort_order = EXCLUDED.sort_order;`
      )
    })
    lines.push('')

    if (issue.print) {
      const printedWorkers = workerListFor(issue, 'printed')
      lines.push(
        `DELETE FROM "PrintedBookWorkers" WHERE printed_book_id IN (SELECT id FROM "PrintedBooks" WHERE title_id = (SELECT id FROM "Titles" WHERE slug = ${sqlString(slug)}));`
      )
      printedWorkers.forEach(([name, job], index) => {
        lines.push(
          `INSERT INTO "PrintedBookWorkers" (printed_book_id, worker_id, sort_order)`,
          `SELECT (SELECT id FROM "PrintedBooks" WHERE title_id = (SELECT id FROM "Titles" WHERE slug = ${sqlString(slug)}) ORDER BY id LIMIT 1),`,
          `       (SELECT id FROM "Workers" WHERE name = ${sqlString(name)} AND job = ${sqlString(job)} ORDER BY id LIMIT 1), ${index}`,
          `WHERE EXISTS (SELECT 1 FROM "PrintedBooks" WHERE title_id = (SELECT id FROM "Titles" WHERE slug = ${sqlString(slug)}))`,
          `ON CONFLICT (printed_book_id, worker_id) DO UPDATE SET sort_order = EXCLUDED.sort_order;`
        )
      })
      lines.push('')
    }
  }

  lines.push('COMMIT;', '')
  return lines.join('\n')
}

async function main() {
  ensureDir(ARTICLE_ASSETS_DIR)
  ensureDir(COVER_ASSETS_DIR)
  ensureDir(DIGITAL_ASSETS_DIR)

  for (const issue of issues) {
    if (!issue.source || !existsSync(issue.source)) throw new Error(`Missing source for MRD${issue.number}: ${issue.source}`)
    const articles = issue.sourceKind === 'pdf' ? await extractPdfIssue(issue) : await extractEpubIssue(issue)
    const digitalFilePath = copyDigitalFile(issue)
    writeFileSync(join(REPO_ROOT, 'supabase', `seed-articles-mrd${issue.number}.sql`), buildArticlesSql(issue, articles))
    writeFileSync(join(REPO_ROOT, 'supabase', `seed-mrd${issue.number}.sql`), buildIssueSql(issue, digitalFilePath))
    console.log(`MRD${issue.number}: ${articles.length} article(s), cover mrd-${issue.number}.jpg, file ${digitalFilePath}`)
  }
  writeFileSync(join(REPO_ROOT, 'supabase', 'seed-mrd-workers.sql'), buildWorkersSql())
  console.log('Wrote supabase/seed-mrd-workers.sql')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
