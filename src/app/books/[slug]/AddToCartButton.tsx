'use client'

import Button from '@/components/common/Button'
import { useCart } from '@/contexts/cart'
import styles from './AddToCartButton.module.scss'

type Props = {
  bookId: string
  inStock: boolean
  bookName: string
  price: number
  picture?: string | null
  category: string
}

export default function AddToCartButton({ bookId, inStock, bookName, price, picture, category }: Props) {
  const { addItem, isPending } = useCart()

  const handleClick = () => {
    addItem({ id: bookId, name: bookName, price, picture, category })
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
