import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getServerQueryClient } from '@/lib/query/getServerQueryClient'
import { getCartServer, getCartQuoteServer } from '@/api/cart/cartServer'
import { cartQueryKey } from '@/api/cart/getCart'
import { cartQuoteQueryKey } from '@/api/cart/quoteCart'
import CartView from './CartView'

// SSR cart: prefetch cart items + quote server-side using the session cookie
// (set by proxy.ts). The client-side useQuery with the same key hydrates
// instantly — no loading state, no EmptyCart flash, zero CLS from content swap.
// Mutations (add/remove/update/promo) still use TanStack Query client-side.
export default async function CartPage() {
  const qc = getServerQueryClient()

  try {
    await qc.prefetchQuery({ queryKey: cartQueryKey, queryFn: getCartServer })
    await qc.prefetchQuery({ queryKey: cartQuoteQueryKey, queryFn: getCartQuoteServer })
  } catch {
    // Session may not exist (no cart cookie, first visit). The client
    // useQuery will fall back to its empty default and render EmptyCart.
  }

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <CartView />
    </HydrationBoundary>
  )
}
