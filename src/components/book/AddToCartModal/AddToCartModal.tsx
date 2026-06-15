'use client'

import { useState } from 'react'
import Modal from '@/components/common/Modal'
import { useCart } from '@/contexts/cart'
import { useToast } from '@/contexts/toast'
import ProductTypeIcon from '@/components/common/icons/ProductTypeIcon'
import { DIGITAL_CATEGORIES } from '@/consts/products'
import { formatPrice, formatProductPrice } from '@/lib/formatPrice'
import type { BookEdition } from '@/entities/book/client'
import type { ProductCategory } from '@/types/database'
import styles from './AddToCartModal.module.scss'

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  'PrintBook':    'ПЕЧАТНОЕ ИЗДАНИЕ',
  'EBook':        'ЦИФРОВОЕ ИЗДАНИЕ',
  'Book2.0':      'КНИГА 2.0',
  'AudioBook':    'АУДИОКНИГА',
  'GiftCard':     'ПОДАРОЧНАЯ КАРТА',
  'BoxSet':       'НАБОР',
  'Subscription': 'ПОДПИСКА',
  'Course':       'КУРС',
}


type Props = {
  // Editions are provided by the card (fetched server-side via attachEditions),
  // so the modal opens instantly with no client round-trip.
  editions: BookEdition[]
  titleName: string
  authorNames: string[]
  coverUrl: string | null
  isOpen: boolean
  onClose: () => void
}

// Max names to spell out before collapsing the rest. Anthologies (Худшее
// etc.) carry 40+ contributors; the full list was filling the entire
// modal body.
const AUTHORS_PREVIEW = 3

function formatAuthors(authorNames: string[]): string {
  if (authorNames.length === 0) return 'Автор не указан'
  if (authorNames.length <= AUTHORS_PREVIEW + 1) return authorNames.join(', ')
  return `${authorNames.slice(0, AUTHORS_PREVIEW).join(', ')} и другие`
}

export default function AddToCartModal({ editions, titleName, authorNames, coverUrl, isOpen, onClose }: Props) {
  const { addItem } = useCart()
  const { cartSuccess } = useToast()
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  function handleOpenChange(open: boolean) {
    if (!open) {
      setQuantities({})
      onClose()
    }
  }

  function setQty(editionId: string, value: number) {
    setQuantities((prev) => ({ ...prev, [editionId]: Math.max(0, value) }))
  }

  function getQty(edition: BookEdition) {
    return quantities[edition.id] ?? 0
  }

  const totalItems = Object.values(quantities).reduce((s, q) => s + q, 0)
  const totalPrice = editions.reduce((s, e) => s + (quantities[e.id] ?? 0) * e.price, 0)

  function handleConfirm() {
    for (const edition of editions) {
      const qty = quantities[edition.id] ?? 0
      if (qty <= 0) continue
      addItem(
        {
          id: edition.id,
          name: titleName,
          subtitle: CATEGORY_LABELS[edition.category] ?? edition.category,
          price: edition.price,
          picture: coverUrl,
          discount: edition.discount,
          category: edition.category,
        },
        qty,
      )
    }
    cartSuccess('Добавлено в корзину', `«${titleName}» — ${totalItems} шт.`)
    setQuantities({})
    onClose()
  }

  return (
    <Modal open={isOpen} onOpenChange={handleOpenChange} title={titleName} size='md'>
          <p className={styles.author}>{formatAuthors(authorNames)}</p>

          <p className={styles.sectionLabel}>Выберите тип издания</p>

          <div className={styles.rows}>
            {editions.map((edition) => (
              <div
                key={edition.id}
                className={`${styles.row} ${!edition.inStock ? styles.rowSoldOut : ''}`}
              >

                <div className={styles.itemAndStepper}>

                  <div className={styles.itemAndLabel}>

                    <div className={styles.rowIcon}>
                      <ProductTypeIcon category={edition.category} size={52} />
                    </div>

                    <span className={styles.rowLabel}>
                      {CATEGORY_LABELS[edition.category] ?? edition.category}
                      {!edition.inStock && (
                        <span className={styles.soldOutTag}>нет в наличии</span>
                      )}
                    </span>

                  </div>

                  {DIGITAL_CATEGORIES.has(edition.category) ? (
                    <button
                      type="button"
                      className={`${styles.toggleBtn} ${getQty(edition) > 0 ? styles.toggleBtnActive : ''}`}
                      onClick={() => setQty(edition.id, getQty(edition) > 0 ? 0 : 1)}
                      disabled={!edition.inStock}
                      aria-label={getQty(edition) > 0 ? 'Убрать' : 'Добавить'}
                    >
                      {getQty(edition) > 0 ? (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                          <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      ) : '+'}
                    </button>
                  ) : (
                    <div className={styles.stepper}>
                      <button
                        type="button"
                        className={styles.stepperBtn}
                        onClick={() => setQty(edition.id, getQty(edition) - 1)}
                        disabled={!edition.inStock || getQty(edition) === 0}
                        aria-label="Уменьшить"
                      >
                        −
                      </button>
                      <span className={styles.stepperVal}>{getQty(edition)}</span>
                      <button
                        type="button"
                        className={styles.stepperBtn}
                        onClick={() => setQty(edition.id, getQty(edition) + 1)}
                        disabled={!edition.inStock}
                        aria-label="Увеличить"
                      >
                        +
                      </button>
                    </div>
                  )}

                </div>


                <div className={styles.rowPrices}>
                  {edition.originalPrice && (
                    <span className={styles.rowOriginalPrice}>{formatPrice(edition.originalPrice)}</span>
                  )}
                  <span className={styles.rowPrice}>{formatProductPrice(edition.price)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.footer}>
            <div className={styles.total}>
              <span className={styles.totalLabel}>Итог:</span>
              {totalItems > 0 && (
                <span className={styles.totalItems}>{totalItems} шт.</span>
              )}
              <span className={styles.totalPrice}>{totalItems > 0 ? formatProductPrice(totalPrice) : '—'}</span>
            </div>

            <button
              type="button"
              className={styles.confirmBtn}
              disabled={totalItems === 0}
              onClick={handleConfirm}
            >
              Добавить в корзину
            </button>
          </div>
    </Modal>
  )
}
