// Name of the auth-session cookie. The browser supabase client derives it from
// NEXT_PUBLIC_SUPABASE_URL as `sb-<first-hostname-label>-auth-token` (supabase-js
// default: `sb-${new URL(url).hostname.split('.')[0]}-auth-token`).
//
// Our server cookie-clients talk to kong over the INTERNAL url (SUPABASE_INTERNAL_URL,
// http://kong:8000) for performance. Left to derive its own name, the server would
// compute `sb-kong-auth-token` and never find the browser's `sb-api-auth-token`
// cookie — so server-side getUser()/RLS sees no session (empty cart, checkout
// "not_authenticated"). Pin the cookie name to the PUBLIC-url-derived value so it
// matches the browser regardless of which host the server calls. Edge-safe (no
// Node-only imports) so proxy.ts can import it.
function deriveCookieName(url: string | undefined): string {
  // `||` (not `??`) so an empty-string env (e.g. a CI build with the var unset)
  // falls back instead of throwing on `new URL('')`. try/catch guards anything
  // else malformed — at runtime the real public URL is always present.
  try {
    const hostname = new URL(url || 'http://127.0.0.1:54321').hostname
    return `sb-${hostname.split('.')[0]}-auth-token`
  } catch {
    return 'sb-api-auth-token'
  }
}

export const SUPABASE_AUTH_COOKIE_NAME = deriveCookieName(process.env.NEXT_PUBLIC_SUPABASE_URL)
