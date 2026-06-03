import sharp from 'sharp'

// Server-side LQIP generation for admin image uploads. Mirrors
// scripts/_blur.mjs (resize 10×15, JPEG q40) so admin-uploaded images get the
// same blur placeholders the sync scripts produce. Output is ~700–1500 bytes.
export async function makeBlurDataUrl(buffer: Buffer): Promise<string> {
  const out = await sharp(buffer).resize(10, 15, { fit: 'inside' }).jpeg({ quality: 40 }).toBuffer()
  return `data:image/jpeg;base64,${out.toString('base64')}`
}
