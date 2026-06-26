import type { CartItem } from '@/entities/cart/client'
import type { CartQuote } from '@/api/cart/quoteCart'
import { getCartServer, getCartQuoteServer } from '@/api/cart/cartServer'
import { CartInitialDataProvider } from './cartInitialData'
import CartView from './CartView'

// SSR cart: fetch items + quote server-side using the session cookie
// (set by proxy.ts). CartProvider reads the initial data and uses it
// as initialData in useQuery, so the client renders with items on
// first paint — no loading state, no EmptyCart flash, zero CLS.
// Mutations (add/remove/update/promo) still use TanStack Query client-side.
export default async function CartPage() {
  let items: CartItem[] = []
  let quote: CartQuote | null = null

  try {
    items = await getCartServer()
  } catch {
    // No session or cart — render empty. Client useQuery will retry.
  }

  try {
    quote = await getCartQuoteServer()
  } catch {
    // Quote may fail if cart is empty — that's fine.
  }

  return (
    <CartInitialDataProvider items={items} quote={quote}>
      <CartView />
    </CartInitialDataProvider>
  )
}
