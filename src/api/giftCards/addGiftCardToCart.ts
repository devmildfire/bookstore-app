import { addToCart } from '@/api/cart'
import type { GiftCardProduct } from '@/entities/giftCardProduct/client'

export async function addGiftCardToCart(product: GiftCardProduct): Promise<void> {
  await addToCart({
    id: product.cartId,
    name: product.name,
    subtitle: 'Карта даров',
    price: product.faceValue,
    picture: null,
    discount: null,
    category: 'GiftCard',
  })
}
