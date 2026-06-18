// Lazy browser-client accessor. Importing `@/lib/supabase/client` statically pulls @supabase/ssr
// (~47 KB gz) into whatever chunk imports it — and the cart query functions (imported eagerly by
// CartProvider for the badge) thus shipped Supabase on every page. This helper dynamic-imports the
// client module, so @supabase/ssr loads as its own chunk only when a query/auth call actually runs
// (on mount, post-hydration) instead of sitting in the eager first-load bundle. createClient is a
// browser singleton, so repeated calls reuse the same instance.
export async function getBrowserClient() {
  const { createClient } = await import('./client')
  return createClient()
}
