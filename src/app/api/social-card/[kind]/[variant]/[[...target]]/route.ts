import { readFile } from 'fs/promises'
import { join } from 'path'
import { ImageResponse } from 'next/og'
import {
  SOCIAL_CARD_CACHE_CONTROL,
  SOCIAL_CARD_VARIANTS,
  isSocialCardKind,
  isSocialCardVariant,
} from '@/lib/socialCards/cardTypes'
import { renderSocialCard } from '@/lib/socialCards/renderSocialCard'
import { resolveSocialCard } from '@/lib/socialCards/resolveSocialCard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = {
  kind: string
  variant: string
  target?: string[]
}

type Context = {
  params: Promise<Params>
}

type ImageFont = NonNullable<ConstructorParameters<typeof ImageResponse>[1]>['fonts']

let fontsPromise: Promise<ImageFont> | null = null

function loadFonts(): Promise<ImageFont> {
  // Cheque (display) + Montserrat 400/700 (kicker / subtitle / description).
  // Loaded once and cached at module level.
  fontsPromise ??= Promise.all([
    readFile(join(process.cwd(), 'src/app/fonts/Chequeblack.ttf')),
    readFile(join(process.cwd(), 'public/fonts/Montserrat-Regular.ttf')),
    readFile(join(process.cwd(), 'public/fonts/Montserrat-Bold.ttf')),
  ]).then(([cheque, montserrat, montserratBold]) => [
    { name: 'Cheque', data: cheque, weight: 400, style: 'normal' },
    { name: 'Montserrat', data: montserrat, weight: 400, style: 'normal' },
    { name: 'Montserrat', data: montserratBold, weight: 700, style: 'normal' },
  ])
  return fontsPromise
}

export async function GET(_request: Request, { params }: Context): Promise<Response> {
  const { kind, variant, target } = await params

  if (!isSocialCardKind(kind) || !isSocialCardVariant(variant)) {
    return new Response('Social card variant not found', { status: 404 })
  }

  const config = SOCIAL_CARD_VARIANTS[variant]
  const card = await resolveSocialCard(kind, target ?? [])
  const fonts = await loadFonts()

  // Render EAGERLY (to a buffer) so any satori failure is catchable. Some source
  // cover/photo images are huge (e.g. a 3200×4800 PNG) and make satori throw mid-
  // render — streaming that aborts the response and the gateway returns 502. If the
  // render fails, retry once WITHOUT the image so the card always renders (text-only)
  // instead of 502-ing. See docs/plans/social-share-cards.md.
  const toPng = (c: typeof card) =>
    new ImageResponse(renderSocialCard(c, config), {
      width: config.width,
      height: config.height,
      fonts,
    }).arrayBuffer()

  let png: ArrayBuffer
  try {
    png = await toPng(card)
  } catch {
    png = await toPng({ ...card, imageUrl: null })
  }

  return new Response(png, {
    headers: { 'Cache-Control': SOCIAL_CARD_CACHE_CONTROL, 'Content-Type': 'image/png' },
  })
}
