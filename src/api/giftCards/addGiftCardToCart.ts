import { addToCart } from '@/api/cart'
import type { GiftCardProduct } from '@/entities/giftCardProduct'

export async function addGiftCardToCart(product: GiftCardProduct, quantity = 1): Promise<void> {
  await addToCart(
    {
      id: product.cartId,
      name: product.name,
      subtitle: 'Карта даров',
      price: product.faceValue,
      picture: product.imageUrl,
      discount: null,
      category: 'GiftCard',
    },
    quantity,
  )
}
