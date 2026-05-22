'use client'

import cn from 'classnames'
import { useCart } from '@/contexts/cart'
import Cart from '@/assets/icons/shop-cart.svg'
import styles from './CartIconBadge.module.scss'

type Variant = 'header' | 'toast'

type Props = {
  variant?: Variant
  className?: string
}

export default function CartIconBadge({ variant = 'header', className }: Props) {
  const { itemCount } = useCart()
  return (
    <span className={cn(styles.root, styles[variant], className)}>
      <Cart className={styles.icon} />
      {itemCount > 0 && (
        <span className={styles.badge}>{itemCount > 99 ? '99+' : itemCount}</span>
      )}
    </span>
  )
}
