// Extract МРД №1 (2020) stories from the print PDF into Articles seed SQL +
// illustrations. The PDF has a clean «Содержание» (title | author + page) and
// one lead illustration per story; body text is recovered from pdftotext
// -layout (first-line indentation marks paragraphs; soft line-end hyphens are
// rejoined; running footers / page numbers / captions are dropped).
//
//   node scripts/extract-mrd1-from-pdf.mjs [pdfPath]
// Outputs: storage-assets/articles/mrd1/<slug>.jpg, supabase/seed-articles-mrd1.sql

import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { makeBlurDataUrl } from './_blur.mjs'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(SCRIPT_DIR, '..')
const PDF = process.argv[2] ?? '/home/mildfire/Downloads/MoguchijRusskijDinozavr.pdf'
const PREFIX = 'mrd1'
const PUBLISHED_AT = '2020-12-30T12:00:00.000Z'
const OUT_IMG = join(REPO_ROOT, 'storage-assets', 'articles', PREFIX)
const OUT_SQL = join(REPO_ROOT, 'supabase', `seed-articles-${PREFIX}.sql`)

const CYRILLIC = { а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya' }
const slugify = (v) => v.toLowerCase().split('').map((c) => CYRILLIC[c] ?? c).join('').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const sqlStr = (v) => (v == null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`)
const sqlJson = (v) => `${sqlStr(JSON.stringify(v))}::jsonb`

function pageCount() {
  const info = execFileSync('pdfinfo', [PDF], { encoding: 'utf8' })
  return Number(info.match(/Pages:\s*(\d+)/)?.[1] ?? 0)
}

// ── Table of contents → [{ title, author, page }] ──
function parseToc() {
  const txt = execFileSync('pdftotext', ['-layout', '-f', '1', '-l', '8', PDF, '-'], { encoding: 'utf8' })
  const after = txt.split(/Содержание/).slice(1).join('Содержание')
  const lines = after.split('\n').map((l) => l.trim()).filter(Boolean)
  const entries = []
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(.+?)\s*\|\s*(.+)$/)
    if (!m) continue
    // the page number is the next purely-numeric line
    let page = null
    for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
      const pm = lines[j].match(/^(\d{1,3})$/)
      if (pm) { page = Number(pm[1]); break }
    }
    if (page) entries.push({ title: m[1].trim(), author: m[2].trim(), page })
  }
  return entries
}

// ── Body paragraphs from a page range ──
function parseBody(start, end, title, author) {
  const txt = execFileSync('pdftotext', ['-layout', '-f', String(start), '-l', String(end), PDF, '-'], { encoding: 'utf8' })
  const titleUp = title.toUpperCase()
  const paras = []
  let cur = ''
  let pendingHyphen = false
  const flush = () => { if (cur.trim()) paras.push(cur.trim()); cur = ''; pendingHyphen = false }

  for (const rawLine of txt.split('\n')) {
    const line = rawLine.replace(/\f/g, '')
    const t = line.trim()
    const indent = line.length - line.trimStart().length
    if (!t) { flush(); continue }
    if (/^\d{1,3}$/.test(t)) continue                     // page number
    if (/\s\|\s/.test(t)) continue                        // running footer "Title | Author"
    if (/^Иллюстрация\b/i.test(t)) continue               // image caption
    if (t === titleUp || t === title || t === author) continue // title-page heading
    if (indent > 12) continue                              // centered headings / decorations
    const startsPara = indent >= 2 && indent <= 12         // first-line indent (1-space lines are justification noise)
    if (startsPara) flush()
    // append with soft-hyphen handling
    if (pendingHyphen) cur = cur.replace(/-$/, '') + t
    else cur = cur ? `${cur} ${t}` : t
    pendingHyphen = /-$/.test(t)
  }
  flush()
  return paras.filter((p) => p.length > 1)
}

// ── Lead illustration: largest image in the article's first pages ──
async function pickIllustration(start, end) {
  const dir = mkdtempSync(join(tmpdir(), 'mrd1img-'))
  const last = Math.min(start + 3, end)
  execFileSync('pdfimages', ['-png', '-p', '-f', String(start), '-l', String(last), PDF, join(dir, 'i')], { stdio: 'ignore' })
  let best = null
  for (const f of readdirSync(dir).sort()) {
    if (!f.endsWith('.png')) continue
    const buf = readFileSync(join(dir, f))
    const meta = await sharp(buf).metadata()
    const w = meta.width ?? 0, hgt = meta.height ?? 0
    if (w < 600 || hgt < 300) continue        // skip small decorative marks
    const area = w * hgt
    if (!best || area > best.area) best = { buf, w, h: hgt, area }
  }
  rmSync(dir, { recursive: true, force: true })
  return best
}

function buildSql(articles) {
  const authors = [...new Set(articles.map((a) => a.author))]
  const L = [
    `-- Generated by scripts/extract-mrd1-from-pdf.mjs from the МРД №1 (2020) PDF.`,
    `-- Re-runnable. Inserts missing authors by name and upserts Articles by slug.`,
    '', 'BEGIN;', '',
    `SELECT setval('"Authors_id_seq"', COALESCE((SELECT MAX(id) FROM "Authors"), 0) + 1, false);`,
    `SELECT setval('"Articles_id_seq"', COALESCE((SELECT MAX(id) FROM "Articles"), 0) + 1, false);`,
    '',
  ]
  for (const a of authors) L.push(`INSERT INTO "Authors" (name) SELECT ${sqlStr(a)} WHERE NOT EXISTS (SELECT 1 FROM "Authors" WHERE name = ${sqlStr(a)});`, '')
  for (const a of articles) {
    L.push(
      `INSERT INTO "Articles" (slug, title, author_id, cover_path, cover_blur, cover_width, cover_height, excerpt, content_blocks, published_at)`,
      `VALUES (`,
      `  ${sqlStr(a.slug)}, ${sqlStr(a.title)},`,
      `  (SELECT id FROM "Authors" WHERE name = ${sqlStr(a.author)} ORDER BY id LIMIT 1),`,
      `  ${sqlStr(a.coverPath)}, ${sqlStr(a.coverBlur)}, ${a.coverWidth ?? 'NULL'}, ${a.coverHeight ?? 'NULL'},`,
      `  ${sqlStr(a.excerpt)}, ${sqlJson(a.contentBlocks)}, ${sqlStr(PUBLISHED_AT)}`,
      `) ON CONFLICT (slug) DO UPDATE SET`,
      `  title=EXCLUDED.title, author_id=EXCLUDED.author_id, cover_path=EXCLUDED.cover_path,`,
      `  cover_blur=EXCLUDED.cover_blur, cover_width=EXCLUDED.cover_width, cover_height=EXCLUDED.cover_height,`,
      `  excerpt=EXCLUDED.excerpt, content_blocks=EXCLUDED.content_blocks, published_at=EXCLUDED.published_at;`,
      '',
    )
  }
  L.push('COMMIT;', '')
  return L.join('\n')
}

async function main() {
  mkdirSync(OUT_IMG, { recursive: true })
  const total = pageCount()
  const toc = parseToc()
  if (!toc.length) throw new Error('No TOC entries parsed')
  const articles = []
  for (let i = 0; i < toc.length; i++) {
    const { title, author, page } = toc[i]
    const end = i + 1 < toc.length ? toc[i + 1].page - 1 : Math.min(total, page + 30)
    const slug = `${PREFIX}-${slugify(title)}`
    const paras = parseBody(page, end, title, author)

    const ill = await pickIllustration(page, end)
    let coverPath = null, coverBlur = null, coverWidth = null, coverHeight = null
    const blocks = []
    if (ill) {
      const out = await sharp(ill.buf).resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer()
      const meta = await sharp(out).metadata()
      const fname = `${slug}.jpg`
      writeFileSync(join(OUT_IMG, fname), out)
      coverPath = `${PREFIX}/${fname}`
      coverWidth = meta.width ?? null
      coverHeight = meta.height ?? null
      coverBlur = await makeBlurDataUrl(out)
      blocks.push({ kind: 'image', path: coverPath, caption: null })
    }
    for (const p of paras) blocks.push({ kind: 'paragraph', text: p })
    const excerpt = paras[0]?.slice(0, 220) ?? null
    articles.push({ slug, title, author, coverPath, coverBlur, coverWidth, coverHeight, excerpt, contentBlocks: blocks })
    console.log(`- ${title} | ${author} (pp.${page}-${end}, ${paras.length} paras${ill ? `, ill ${ill.w}×${ill.h}` : ', NO IMAGE'})`)
  }
  writeFileSync(OUT_SQL, buildSql(articles))
  console.log(`\nWrote ${articles.length} articles → ${OUT_SQL}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
