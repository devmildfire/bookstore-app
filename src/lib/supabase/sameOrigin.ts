// Shared constants for the same-origin Supabase proxy. The browser only ever
// talks to its own origin under `/sb/*`; the middleware (src/proxy.ts) rewrites
// that to the real Supabase (runtime SUPABASE_INTERNAL_URL) and injects the real
// anon key. Both values below are CONSTANTS — safe to bake into the bundle — so a
// single image runs in every environment (per-env routing + key live in runtime
// env, never the build). See docs/plans/cicd-single-image-and-edge-tests.md.
//
// Dependency-free on purpose so both the browser client and the middleware can
// import it without pulling server-only code into the client bundle.

export const SUPABASE_PROXY_PREFIX = '/sb'

// The browser ships this placeholder as its anon key; the /sb proxy swaps it for
// the real (runtime) key. A constant → single-image-safe.
export const PLACEHOLDER_ANON_KEY = 'sb_proxy_placeholder_anon_key'
