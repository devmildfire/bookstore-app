import { getBrowserClient } from './lazyClient'

// Memoized so concurrent first-ops (e.g. the cart query + an add-to-cart click) share one sign-in.
let signInPromise: Promise<void> | null = null

// The proxy sets this non-HttpOnly hint cookie once a session (anon or real) exists. Reading it
// lets us skip the sign-in path entirely for returning visitors without importing the auth client.
function hasSessionCookie(): boolean {
  return typeof document !== 'undefined' && document.cookie.split('; ').includes('bookstore_has_session=1')
}

// Guarantee an anonymous (or real) Supabase session exists before an RLS-scoped op runs.
//
// The anon sign-in used to fire on mount in providers.tsx, which pulled @supabase/ssr + auth-js
// (~43 KB gz, the full GoTrueClient) into every cookieless first paint — i.e. exactly what a PSI
// trace measures, even though a passive visitor never signs in or touches the cart. We now defer
// it: the first cart/promo/gift-card op (which only happens after interaction or on a cart route)
// creates the session on demand. The memoized promise also closes the first-add-to-cart race —
// the write awaits the same in-flight sign-in instead of hitting the Cart table unauthenticated.
export async function ensureAnonSession(): Promise<void> {
  if (hasSessionCookie()) return
  if (!signInPromise) {
    signInPromise = (async () => {
      const { createAuthClient } = await import('./client')
      const supabase = createAuthClient()
      const { data } = await supabase.auth.getSession()
      if (data.session) return
      const { error } = await supabase.auth.signInAnonymously()
      if (error) {
        // Let a later op retry the sign-in rather than wedging on a failed promise.
        signInPromise = null
        throw error
      }
    })()
  }
  return signInPromise
}

// Browser Supabase client with the anon session ensured first. Use this (not getBrowserClient) for
// any RLS-scoped read/write — cart, promo, gift cards. Public reads (e.g. catalog search) can keep
// getBrowserClient, since they don't need a session.
export async function getAuthedClient() {
  await ensureAnonSession()
  return getBrowserClient()
}
