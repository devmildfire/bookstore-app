import type { CartItem } from '@/entities/cart/client'
import type { CartQuote } from '@/api/cart/quoteCart'
import { getCartServer, getCartQuoteServer } from '@/api/cart/cartServer'
import CartView from './CartView'

// SSR cart: fetch items + quote server-side using the session cookie (set by
// proxy.ts) and pass them to CartView as props. CartView renders from these
// until the client cart query resolves, so the SSR HTML and the first client
// render both show the full cart — no EmptyCart flash, zero CLS. After the
// client query settles, the live cart (mutations/invalidations) takes over.
//
// Props, not context: CartProvider is a global ancestor (src/app/providers.tsx),
// so page-level data can't reach its render. The consuming component must be a
// descendant of this page — that's CartView.
export default async function CartPage() {
  let items: CartItem[] = []
  let quote: CartQuote | null = null

  try {
    items = await getCartServer()
  } catch {
    // No session or cart — render empty. The client query will retry.
  }

  try {
    quote = await getCartQuoteServer()
  } catch {
    // Quote may fail if cart is empty — that's fine.
  }

  return <CartView initialItems={items} initialQuote={quote} />
}
