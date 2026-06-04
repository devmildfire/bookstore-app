'use client'

import Image from 'next/image'
import { useCart } from '@/contexts/cart'
import { useToast } from '@/contexts/toast'
import LikeButton from '@/components/common/LikeButton'
import type { BoxSet } from '@/entities/boxSet/client'
import cn from 'classnames'
import styles from './BoxSetsSection.module.scss'

const fmt = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

type Props = {
  boxSet: BoxSet
  isOpen: boolean
  onToggle: () => void
}

export default function BoxSetCard({ boxSet, isOpen, onToggle }: Props) {
  const { addItem, isPending } = useCart()
  const { cartSuccess } = useToast()

  function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation()
    addItem({
      id: boxSet.cartId,
      name: boxSet.name,
      subtitle: 'Бокс-сет',
      price: boxSet.price,
      picture: null,
      discount: boxSet.discount,
      category: 'BoxSet',
    })
    cartSuccess('Добавлено в корзину', boxSet.name)
  }

  return (
    <div
      className={cn(styles.card, isOpen && styles.cardOpen)}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle() } }}
      aria-expanded={isOpen}
      aria-label={isOpen ? `Свернуть ${boxSet.name}` : `Развернуть ${boxSet.name}`}
    >
      <div className={styles.imageWrap}>
        {boxSet.imageSvg ? (
          // Trusted, admin-uploaded SVG from the box-sets bucket — inlined so it
          // scales and themes cleanly.
          <span
            className={styles.imageSvg}
            role="img"
            aria-label={boxSet.name}
            dangerouslySetInnerHTML={{ __html: boxSet.imageSvg }}
          />
        ) : (
          boxSet.imageUrl && (
            <Image src={boxSet.imageUrl} alt={boxSet.name} width={160} height={160} className={styles.image} />
          )
        )}
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.name}>{boxSet.name}</h3>
        {boxSet.description && (
          <p className={styles.description}>{boxSet.description}</p>
        )}
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.price}>{fmt.format(boxSet.price)}</span>

        <button
          type="button"
          className={styles.iconBtn}
          onClick={handleAddToCart}
          disabled={isPending}
          aria-label="Добавить в корзину"
        >
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
          </svg>
        </button>

        <LikeButton type='box_set' itemId={boxSet.id} size={20} />
      </div>
    </div>
  )
}
