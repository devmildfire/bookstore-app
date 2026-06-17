/**
 * One-time: rasterize the box-set illustration SVGs to optimized WebP so they can be served
 * via next/image (resize + AVIF/WebP + lazy) instead of being inlined or served as 100-277 KB
 * vector files. Source = public/boxsets/*.svg → public/boxsets/*.webp.
 *
 * Usage: node scripts/boxsets-svg-to-webp.mjs
 * Idempotent (re-running regenerates the WebP from the SVG source).
 *
 * Display size is ~300×220 in a card; 800 px max edge gives 2× retina headroom and lets
 * next/image downscale per device. q82 is visually lossless for these flat illustrations.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'boxsets')
const MAX_EDGE = 800
const QUALITY = 82

const svgs = readdirSync(DIR).filter((f) => f.toLowerCase().endsWith('.svg')).sort()
const k = (n) => (n / 1024).toFixed(1) + ' KB'

let totalSvg = 0
let totalWebp = 0
for (const f of svgs) {
  const src = readFileSync(join(DIR, f))
  const out = join(DIR, f.replace(/\.svg$/i, '.webp'))
  const webp = await sharp(src, { density: 300 })
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 6 })
    .toBuffer()
  writeFileSync(out, webp)
  totalSvg += src.length
  totalWebp += webp.length
  console.log(`${f.padEnd(24)} ${k(src.length).padStart(10)}  →  ${k(webp.length).padStart(9)}`)
}
console.log('-'.repeat(52))
console.log(`TOTAL ${svgs.length} imgs`.padEnd(24), k(totalSvg).padStart(10), ' → ', k(totalWebp).padStart(9))
