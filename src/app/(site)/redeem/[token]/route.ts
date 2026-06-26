import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSiteOrigin } from '@/lib/siteUrl'

const CLAIM_TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,128}$/

type Params = {
  params: Promise<{ token: string }>
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { token } = await params

  if (!CLAIM_TOKEN_PATTERN.test(token)) {
    return NextResponse.redirect(new URL('/profile/gift-cards?redeem_error=1', getSiteOrigin()))
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const { error } = await supabase.auth.signInAnonymously()
    if (error) {
      return NextResponse.redirect(new URL('/profile/gift-cards?redeem_error=1', getSiteOrigin()))
    }
  }

  const { data, error } = await supabase.rpc('redeem_gift_card_token', { p_token: token })
  if (error || !data) {
    return NextResponse.redirect(new URL('/profile/gift-cards?redeem_error=1', getSiteOrigin()))
  }

  return NextResponse.redirect(new URL('/profile/gift-cards?redeemed=1', getSiteOrigin()))
}
