import type { CartItem } from '@/entities/cart/client'
import { getCartServer, getCartHasPhysicalServer } from '@/api/cart/cartServer'
import CheckoutView from './CheckoutView'

// SSR the cart so the correct form (delivery vs email-only) renders on first
// paint. Without this the server renders EmailOnlyForm (cart empty server-side),
// then the client query resolves and swaps in the taller DeliveryForm for a
// physical cart — a layout shift. Props, not context: see cart/page.tsx.
export default async function CheckoutPage() {
  let items: CartItem[] = []
  let hasPhysical = false

  try {
    items = await getCartServer()
    hasPhysical = await getCartHasPhysicalServer(items)
  } catch {
    // No session or cart — CheckoutView's redirect handles the empty case
    // once the client query settles.
  }

  return <CheckoutView initialItems={items} initialHasPhysical={hasPhysical} />
}
