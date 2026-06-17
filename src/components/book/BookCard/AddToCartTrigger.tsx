'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import CartPlusIcon from '@/components/common/icons/CartPlusIcon'
import type { Book } from '@/entities/book/client'
import styles from './BookCard.module.scss'

// Lazy — keep the modal out of the card's initial client bundle.
const AddToCartModal = dynamic(() => import('@/components/book/AddToCartModal'), { ssr: false })

type Props = Pick<Book, 'editions' | 'name' | 'authorNames' | 'coverUrl' | 'inStock'>

// The only interactive part of a BookCard: the add-to-cart button + its modal. Split out as a
// client leaf so the card body (cover, prices, link) can render on the server.
export default function AddToCartTrigger({ editions, name, authorNames, coverUrl, inStock }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className={styles.cartBtn}
        onClick={() => inStock && setModalOpen(true)}
        disabled={!inStock}
        aria-label={`Добавить «${name}» в корзину`}
      >
        <CartPlusIcon size={22} />
      </button>

      {modalOpen && (
        <AddToCartModal
          editions={editions}
          titleName={name}
          authorNames={authorNames}
          coverUrl={coverUrl}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}
