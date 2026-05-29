'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { addGiftCardToCart } from '@/api/giftCards/addGiftCardToCart'
import { cartQueryKey } from '@/api/cart'
import { useToast } from '@/contexts/toast'
import { formatPrice } from '@/lib/formatPrice'
import type { GiftCardProduct } from '@/entities/giftCardProduct/client'
import styles from './GiftCardTierCard.module.scss'

type Props = {
  product: GiftCardProduct
}

export default function GiftCardTierCard({ product }: Props) {
  const queryClient = useQueryClient()
  const { cartSuccess, error } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [isPending, setIsPending] = useState(false)

  async function handleAdd() {
    setIsPending(true)
    try {
      for (let i = 0; i < quantity; i += 1) {
        await addGiftCardToCart(product)
      }
      await queryClient.invalidateQueries({ queryKey: cartQueryKey })
      cartSuccess('Добавлено в корзину', `${product.name} × ${quantity}`)
    } catch (e) {
      error('Не удалось добавить карту', e instanceof Error ? e.message : undefined)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <article className={styles.card}>
      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.value}>{formatPrice(product.faceValue)}</p>
        <div className={styles.stepper} role='group' aria-label='Количество'>
          <button
            type='button'
            className={styles.stepperBtn}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            disabled={quantity <= 1 || isPending}
            aria-label='Уменьшить количество'
          >
            −
          </button>
          <span className={styles.stepperValue}>{quantity}</span>
          <button
            type='button'
            className={styles.stepperBtn}
            onClick={() => setQuantity((current) => current + 1)}
            disabled={isPending}
            aria-label='Увеличить количество'
          >
            +
          </button>
        </div>
        <button type='button' className={styles.button} onClick={handleAdd} disabled={isPending}>
          {isPending ? 'Добавляем…' : 'Купить'}
        </button>
      </div>
    </article>
  )
}
