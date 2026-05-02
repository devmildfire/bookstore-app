'use client'

import { useState } from 'react'
import Button from '@/components/common/Button'
import styles from './AddToCartButton.module.scss'

type Props = {
  bookId: string
  inStock: boolean
  bookName: string
}

export default function AddToCartButton({ bookId, inStock, bookName }: Props) {
  const [isPending, setIsPending] = useState(false)

  const handleClick = () => {
    setIsPending(true)
    // TODO: Implement actual add-to-cart logic in Phase 7
    console.log('Add to cart:', bookId)
    setTimeout(() => setIsPending(false), 500)
  }

  if (!inStock) {
    return (
      <Button variant='secondary' disabled className={styles.button}>
        Нет в наличии
      </Button>
    )
  }

  return (
    <Button
      variant='primary'
      size='lg'
      loading={isPending}
      onClick={handleClick}
      className={styles.button}
      aria-label={`Добавить «${bookName}» в корзину`}
    >
      {isPending ? 'Добавляется...' : 'В корзину'}
    </Button>
  )
}
