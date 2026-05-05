import { createClient } from '@/lib/supabase/client'
import type { AddToCartInput } from '@/entities/cart/validation'

export async function addToCart(item: AddToCartInput): Promise<void> {
  const supabase = createClient()

  // Check if item already exists in cart
  const { data: existing } = await supabase
    .from('Cart')
    .select('id, quantity')
    .eq('id', item.id)
    .single()

  if (existing) {
    // Update quantity
    const { error } = await supabase
      .from('Cart')
      .update({ quantity: (existing.quantity ?? 1) + 1 })
      .eq('id', item.id)

    if (error) throw new Error(`Не удалось обновить корзину: ${error.message}`)
  } else {
    // Insert new item
    const { error } = await supabase
      .from('Cart')
      .insert({
        id: item.id,
        name: item.name,
        subtitle: item.subtitle ?? null,
        price: item.price,
        quantity: 1,
        picture: item.picture ?? null,
        category: item.category,
      })

    if (error) throw new Error(`Не удалось добавить в корзину: ${error.message}`)
  }
}
