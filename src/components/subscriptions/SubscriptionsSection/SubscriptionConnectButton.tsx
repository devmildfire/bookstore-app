'use client'

import Link from 'next/link'
import cn from 'classnames'
import { useCart } from '@/contexts/cart'
import { useToast } from '@/contexts/toast'
import type { Subscription } from '@/entities/subscription'
import styles from './SubscriptionsSection.module.scss'

type Props = Pick<Subscription, 'cartId' | 'name' | 'price' | 'imageUrl' | 'discount'>

// Client leaf: the "Подключить" button (add to cart) / "В корзине" link. Reads cart state,
// so it must be client — split out so the subscription card body renders on the server.
export default function SubscriptionConnectButton({ cartId, name, price, imageUrl, discount }: Props) {
  const { items, addItem, isPending } = useCart()
  const { cartSuccess } = useToast()
  const inCart = items.some((item) => item.id === cartId)

  function handleAddToCart() {
    if (inCart) return
    addItem({
      id: cartId,
      name,
      subtitle: 'Подписка',
      price,
      picture: imageUrl,
      discount,
      category: 'Subscription',
    })
    cartSuccess('Добавлено в корзину', name)
  }

  return inCart ? (
    <Link href="/cart" className={cn(styles.connectBtn, styles.connectBtnInCart)}>
      В корзине
    </Link>
  ) : (
    <button type="button" className={styles.connectBtn} onClick={handleAddToCart} disabled={isPending}>
      Подключить
    </button>
  )
}
