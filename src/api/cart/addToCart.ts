import { createClient } from '@/lib/supabase/client'
import { isSinglePurchaseCategory } from '@/consts/products'
import type { AddToCartInput } from '@/entities/cart/validation'

// `quantity` is the number of units to add in a single call. Callers used to
// loop `addToCart(item)` N times, but each call did SELECT-then-INSERT/UPDATE
// non-atomically — parallel invocations from the AddToCartModal raced and
// only the first INSERT survived (the rest lost to the PK unique violation),
// or competing UPDATEs all read the same `existing.quantity` and overwrote
// each other. Passing `quantity` in a single call collapses the loop into
// one round-trip and removes the race.
export async function addToCart(item: AddToCartInput, quantity = 1): Promise<void> {
  if (quantity <= 0) return
  const supabase = createClient()

  const { data: existing } = await supabase
    .from('Cart')
    .select('id, quantity')
    .eq('id', item.id)
    .maybeSingle()

  if (existing) {
    // Digital products, subscriptions and courses are 1-per-buyer — never increment.
    if (isSinglePurchaseCategory(item.category)) return

    const { error } = await supabase
      .from('Cart')
      .update({ quantity: (existing.quantity ?? 1) + quantity })
      .eq('id', item.id)

    if (error) throw new Error(`Не удалось обновить корзину: ${error.message}`)
    return
  }

  // 1-per-buyer items always insert a single unit.
  const insertQty = isSinglePurchaseCategory(item.category) ? 1 : quantity

  const { error } = await supabase
    .from('Cart')
    .insert({
      id: item.id,
      name: item.name,
      subtitle: item.subtitle ?? null,
      price: item.price,
      quantity: insertQty,
      picture: item.picture ?? null,
      discount: item.discount ?? null,
      category: item.category,
    })

  if (error) throw new Error(`Не удалось добавить в корзину: ${error.message}`)
}
