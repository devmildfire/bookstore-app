import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { EmailOtpType } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import { SITE_ORIGIN } from '@/lib/siteUrl'
import { SUPABASE_AUTH_COOKIE_NAME } from '@/lib/supabase/authCookie'

// Verifies the token_hash from auth emails (signup / email_change / recovery)
// rendered by the Send-Email hook, sets the resulting session on the redirect
// response, and forwards to `next`. Cookies are attached to the response object
// directly — Route Handler `cookies().set()` isn't always preserved across a
// redirect (same reason as /auth/callback). See docs/plans/email-system.md P1.

const VALID_TYPES: EmailOtpType[] = ['signup', 'email_change', 'recovery', 'magiclink', 'invite', 'email']

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const tokenHash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type') as EmailOtpType | null
  const next = url.searchParams.get('next') ?? '/profile'
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/profile'

  if (!tokenHash || !type || !VALID_TYPES.includes(type)) {
    const errorUrl = new URL('/auth/login', SITE_ORIGIN)
    errorUrl.searchParams.set('auth_error', 'Ссылка недействительна или устарела')
    return NextResponse.redirect(errorUrl)
  }

  // On success we land on `next` (the cabinet for signup/email_change). Mark it
  // so the destination can show a one-time "email confirmed" success modal.
  // Recovery goes to the reset-password screen — no success modal there.
  const successUrl = new URL(safeNext, SITE_ORIGIN)
  if (type !== 'recovery') successUrl.searchParams.set('email_confirmed', '1')
  const response = NextResponse.redirect(successUrl)

  const supabase = createServerClient<Database>(
    // Server-side token verification — internal kong URL when set (no hairpin).
    process.env.SUPABASE_INTERNAL_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: SUPABASE_AUTH_COOKIE_NAME },
      cookies: {
        encode: 'tokens-only',
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
  if (error) {
    const errorUrl = new URL('/auth/login', SITE_ORIGIN)
    errorUrl.searchParams.set('auth_error', error.message)
    return NextResponse.redirect(errorUrl)
  }

  return response
}
