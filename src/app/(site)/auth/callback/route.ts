import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { Database } from '@/types/supabase'
import { PENDING_ANON_COOKIE } from '@/lib/profile/constants'
import { getSiteOrigin } from '@/lib/siteUrl'
import { SUPABASE_AUTH_COOKIE_NAME } from '@/lib/supabase/authCookie'

// Server-side OAuth callback. Receives the PKCE `code` from Supabase after
// the provider flow completes, exchanges it for a session server-side, and
// writes the new auth cookies directly onto the redirect response so the
// browser arrives at the next page already authenticated.
//
// We can't use the shared @/lib/supabase/server helper here because Route
// Handler cookies set via `cookies().set()` are not always preserved across
// a `NextResponse.redirect`. Attaching cookies to the response object
// explicitly avoids that footgun.

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const errorParam = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')
  const next = url.searchParams.get('next') ?? '/profile'

  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/profile'

  if (errorParam) {
    // GoTrue redirects here with ?error=...&error_description=... (no code)
    // when OAuth fails before token exchange. With the anon→signInWithOAuth
    // dispatch, the identity-collision case GoTrue used to raise here no
    // longer happens — every error reaching this branch is something we
    // genuinely don't expect (Google denied, network, malformed request),
    // so pass the raw description through and let the login page render it.
    const errorUrl = new URL('/auth/login', getSiteOrigin())
    errorUrl.searchParams.set('auth_error', errorDescription ?? errorParam)
    return NextResponse.redirect(errorUrl)
  }

  if (!code) {
    return NextResponse.redirect(new URL(safeNext, getSiteOrigin()))
  }

  const response = NextResponse.redirect(new URL(safeNext, getSiteOrigin()))

  const supabase = createServerClient<Database>(
    // Server-side code exchange — internal kong URL when set (no hairpin).
    process.env.SUPABASE_INTERNAL_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: SUPABASE_AUTH_COOKIE_NAME },
      cookies: {
        // See proxy.ts for the why — keeps cookies small to avoid chunking.
        encode: 'tokens-only',
        getAll() {
          return request.cookies.getAll()
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>,
          headers: Record<string, string> = {}
        ) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
          Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v))
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    const errorUrl = new URL('/auth/login', getSiteOrigin())
    errorUrl.searchParams.set('auth_error', error.message)
    return NextResponse.redirect(errorUrl)
  }

  // Anon → OAuth handoff: if the pre-redirect anon UID differs from the
  // resolved user, move the anon's cart/orders onto the new UID and drop the
  // anon row. Best-effort — a failure here logs server-side and the user
  // still completes the sign-in (mirrors loginAction → migrateAnonymousUserAction).
  const pendingAnonId = request.cookies.get(PENDING_ANON_COOKIE)?.value
  const resolvedUserId = data?.user?.id
  if (pendingAnonId && resolvedUserId && pendingAnonId !== resolvedUserId) {
    try {
      const { error: rpcError } = await supabase.rpc(
        'migrate_anonymous_user',
        { from_user_id: pendingAnonId, to_user_id: resolvedUserId }
      )
      if (rpcError) {
        console.error('[/auth/callback] migrate_anonymous_user failed:', rpcError.message)
      }
    } catch (e) {
      console.error('[/auth/callback] migrate_anonymous_user threw:', e)
    }
  }
  if (pendingAnonId) {
    response.cookies.set(PENDING_ANON_COOKIE, '', { path: '/', maxAge: 0 })
  }

  return response
}
