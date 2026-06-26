import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PENDING_ANON_COOKIE } from '@/lib/profile/constants'
import { getSiteOrigin } from '@/lib/siteUrl'

// GET /api/auth/google
//
// Used in place of the older signInWithGoogleAction Server Action.
// Why a plain Route Handler instead: when the client invoked the
// Server Action and then did window.location to navigate to the
// OAuth URL, Firefox would surface "Uncaught TypeError: Error in
// input stream" because the Server Action's RSC response stream
// was aborted mid-read by the navigation. A regular GET → 302 has
// no streaming response for the browser to abort, so the error
// path doesn't exist.
//
// Behavior matches the old Server Action:
//   - generate the Google OAuth URL via supabase.auth.signInWithOAuth
//   - the SDK writes the PKCE code-verifier cookie via the cookies adapter
//   - if the current session is anonymous, stash anon UID in
//     `sb-pending-anon-id` cookie so /auth/callback can run
//     migrate_anonymous_user on the way back
//   - 302 redirect to the OAuth URL
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Trusted public origin — request.nextUrl.origin resolves to the container
  // bind address (0.0.0.0:3000) behind the tunnel, which would send Google an
  // unreachable redirect_to.
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getSiteOrigin()}/auth/callback?next=/profile`,
      skipBrowserRedirect: true,
    },
  })

  if (error || !data?.url) {
    const errorUrl = new URL('/auth/login', getSiteOrigin())
    errorUrl.searchParams.set('auth_error', error?.message ?? 'Google OAuth недоступен')
    return NextResponse.redirect(errorUrl)
  }

  if (user?.is_anonymous) {
    const cookieStore = await cookies()
    cookieStore.set(PENDING_ANON_COOKIE, user.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 600, // 10 min — covers any OAuth round-trip
    })
  }

  // data.url is built from the supabase client's base URL (the internal kong URL,
  // SUPABASE_INTERNAL_URL) which the browser can't reach. Rebuild it on OUR OWN
  // origin under /sb — the middleware forwards /auth/v1/* to Supabase — so no
  // env-specific Supabase host is baked in (one image, any environment). PKCE
  // query preserved. (GoTrue's own OAuth callback to Google still uses its
  // configured external URL; verify that end-to-end during the prod cutover.)
  const src = new URL(data.url)
  const authorizeUrl = new URL(`/sb${src.pathname}${src.search}`, getSiteOrigin())
  return NextResponse.redirect(authorizeUrl.toString())
}
