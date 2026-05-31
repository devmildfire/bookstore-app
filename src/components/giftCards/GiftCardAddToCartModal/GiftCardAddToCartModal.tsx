'use client'

import { useState } from 'react'
import Image from 'next/image'
import * as Dialog from '@radix-ui/react-dialog'
import Modal from '@/components/common/Modal'
import { useQueryClient } from '@tanstack/react-query'
import { addGiftCardToCart } from '@/api/giftCards/addGiftCardToCart'
import { cartQueryKey } from '@/api/cart'
import { useToast } from '@/contexts/toast'
import { formatPrice } from '@/lib/formatPrice'
import type { GiftCardProduct } from '@/entities/giftCardProduct/client'
import styles from './GiftCardAddToCartModal.module.scss'

type Props = {
  product: GiftCardProduct
  isOpen: boolean
  onClose: () => void
}

export default function GiftCardAddToCartModal({ product, isOpen, onClose }: Props) {
  const queryClient = useQueryClient()
  const { cartSuccess, error } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [isPending, setIsPending] = useState(false)

  function handleOpenChange(open: boolean) {
    if (!open) {
      setQuantity(1)
      onClose()
    }
  }

  async function handleConfirm() {
    setIsPending(true)
    try {
      await addGiftCardToCart(product, quantity)
      await queryClient.invalidateQueries({ queryKey: cartQueryKey })
      cartSuccess('Добавлено в корзину', `${product.name} × ${quantity}`)
      setQuantity(1)
      onClose()
    } catch (e) {
      error('Не удалось добавить карту', e instanceof Error ? e.message : undefined)
    } finally {
      setIsPending(false)
    }
  }

  const total = quantity * product.faceValue

  return (
    <Modal open={isOpen} onOpenChange={handleOpenChange} size='sm'>
        <div className={styles.center}>
          {product.imageUrl && (
            <div className={styles.imageWrap}>
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className={styles.image}
                sizes='(max-width: 532px) 90vw, 380px'
              />
            </div>
          )}

          <Dialog.Title className={styles.title}>{product.name}</Dialog.Title>
          <p className={styles.value}>{formatPrice(product.faceValue)}</p>

          <div className={styles.stepperRow}>
            <span className={styles.stepperLabel}>Количество</span>
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
          </div>

          <div className={styles.footer}>
            <div className={styles.total}>
              <span className={styles.totalLabel}>Итог:</span>
              <span className={styles.totalPrice}>{formatPrice(total)}</span>
            </div>
            <button
              type='button'
              className={styles.confirmBtn}
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? 'Добавляем…' : 'Добавить в корзину'}
            </button>
          </div>
        </div>
    </Modal>
  )
}
