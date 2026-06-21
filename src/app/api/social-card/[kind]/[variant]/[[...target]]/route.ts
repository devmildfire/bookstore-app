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
  fontsPromise ??= readFile(join(process.cwd(), 'src/app/fonts/Chequeblack.ttf')).then((cheque) => [
    {
      name: 'Cheque',
      data: cheque,
      weight: 400,
      style: 'normal',
    },
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
  const response = new ImageResponse(renderSocialCard(card, config), {
    width: config.width,
    height: config.height,
    fonts: await loadFonts(),
  })

  response.headers.set('Cache-Control', SOCIAL_CARD_CACHE_CONTROL)
  response.headers.set('Content-Type', 'image/png')

  return response
}
