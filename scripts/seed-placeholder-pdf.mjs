// Generates a placeholder PDF and uploads it to the local `digital-files`
// Supabase Storage bucket at `ebooks/50.pdf`, then sets
// `Ebooks.file_path = 'ebooks/50.pdf'` for ebook id 50 (Белый цветок).
//
// Re-runnable — overwrites the storage object and the DB row.
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
// (or just .env). The PDF is generated via the python3 reportlab installed
// on the dev machine; if you don't have reportlab, install with:
//   pip install --user reportlab

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// Node has a built-in --env-file flag; use it to avoid adding `dotenv`.
// Run with: node --env-file=.env scripts/seed-placeholder-pdf.mjs

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env')
  process.exit(1)
}

const EBOOK_ID = 50
const STORAGE_PATH = `ebooks/${EBOOK_ID}.pdf`
const TMP_PDF = join(tmpdir(), `chtivo-placeholder-${EBOOK_ID}.pdf`)

// ─── 1. Generate the PDF with reportlab ─────────────────────────────────────
const pythonScript = `
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import sys, os

# Try to register a system font that supports Cyrillic.
for candidate in [
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    '/usr/share/fonts/TTF/DejaVuSans.ttf',
]:
    if os.path.exists(candidate):
        pdfmetrics.registerFont(TTFont('DejaVu', candidate))
        font_name = 'DejaVu'
        break
else:
    font_name = 'Helvetica'

c = canvas.Canvas(sys.argv[1], pagesize=A4)
W, H = A4

c.setFont(font_name, 28)
c.drawString(60, H - 100, 'Тестовая книга')
c.setFont(font_name, 14)
c.drawString(60, H - 140, 'Это плейсхолдер для отладки скачивания.')
c.drawString(60, H - 170, 'Реальный файл будет загружен через админ-панель позже.')
c.setFont(font_name, 10)
c.drawString(60, 60, 'chtivo.spb.ru — Белый цветок (ebook id 50)')
c.showPage()
c.save()
`

console.log('Generating placeholder PDF…')
const py = spawnSync('python3', ['-c', pythonScript, TMP_PDF], { stdio: 'inherit' })
if (py.status !== 0) {
  console.error('python3 reportlab failed')
  process.exit(1)
}

const pdfBytes = readFileSync(TMP_PDF)
console.log(`Generated ${pdfBytes.length} bytes at ${TMP_PDF}`)

// ─── 2. Upload to Supabase Storage ──────────────────────────────────────────
const uploadUrl = `${SUPABASE_URL}/storage/v1/object/digital-files/${STORAGE_PATH}`
console.log(`Uploading to ${uploadUrl} …`)

const res = await fetch(uploadUrl, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${SERVICE_KEY}`,
    apikey: SERVICE_KEY,
    'Content-Type': 'application/pdf',
    'x-upsert': 'true',
  },
  body: pdfBytes,
})

if (!res.ok) {
  const body = await res.text()
  console.error(`Upload failed (${res.status}): ${body}`)
  process.exit(1)
}

console.log('Upload OK.')

// ─── 3. Set Ebooks.file_path = 'ebooks/50.pdf' for ebook id 50 ──────────────
console.log(`Updating Ebooks.file_path for ebook ${EBOOK_ID} …`)
const sql = `UPDATE "Ebooks" SET file_path = '${STORAGE_PATH}' WHERE id = ${EBOOK_ID};`
const psql = spawnSync(
  'psql',
  ['-h', '127.0.0.1', '-p', '54322', '-U', 'postgres', '-d', 'postgres', '-c', sql],
  { stdio: 'inherit', env: { ...process.env, PGPASSWORD: 'postgres' } }
)
if (psql.status !== 0) {
  console.error('psql failed; set the file_path manually if you have a different DB setup.')
  process.exit(1)
}

// ─── 4. Cleanup ─────────────────────────────────────────────────────────────
if (existsSync(TMP_PDF)) unlinkSync(TMP_PDF)
console.log('Done.')
