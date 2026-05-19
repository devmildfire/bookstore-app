import sharp from 'sharp'

/**
 * Produce a tiny base64-encoded JPEG suitable for `next/image`'s
 * `blurDataURL` prop. Output is ~700–1500 bytes regardless of source size.
 *
 * The 10×15 size mirrors a 2:3 cover aspect, but `next/image` scales the
 * placeholder to fit any target box, so it works for author photos, book
 * photos and subscription tiles as well.
 *
 * @param {Buffer | Uint8Array} buffer raw image bytes (JPEG, PNG, WebP, …)
 * @returns {Promise<string>} `data:image/jpeg;base64,…`
 */
export async function makeBlurDataUrl(buffer) {
  const out = await sharp(buffer)
    .resize(10, 15, { fit: 'inside' })
    .jpeg({ quality: 40 })
    .toBuffer()
  return `data:image/jpeg;base64,${out.toString('base64')}`
}
