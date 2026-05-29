'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useCart } from '@/contexts/cart'
import { useToast } from '@/contexts/toast'
import { useBookProducts } from '@/hooks/useBookProducts'
import ProductTypeIcon from '@/components/common/icons/ProductTypeIcon'
import { DIGITAL_CATEGORIES } from '@/consts/products'
import type { Book } from '@/entities/book/client'
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

const fmt = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

type Props = {
  slug: string
  titleName: string
  authorNames: string[]
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

export default function AddToCartModal({ slug, titleName, authorNames, isOpen, onClose }: Props) {
  const { data: products = [], isLoading } = useBookProducts(slug, isOpen)
  const { addItem } = useCart()
  const { cartSuccess } = useToast()
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  function handleOpenChange(open: boolean) {
    if (!open) {
      setQuantities({})
      onClose()
    }
  }

  function setQty(bookId: string, value: number) {
    setQuantities((prev) => ({ ...prev, [bookId]: Math.max(0, value) }))
  }

  function getQty(book: Book) {
    return quantities[book.id] ?? 0
  }

  const totalItems = Object.values(quantities).reduce((s, q) => s + q, 0)
  const totalPrice = products.reduce((s, b) => s + (quantities[b.id] ?? 0) * b.price, 0)

  function handleConfirm() {
    for (const book of products) {
      const qty = quantities[book.id] ?? 0
      if (qty <= 0) continue
      addItem(
        {
          id: book.id,
          name: book.name,
          subtitle: CATEGORY_LABELS[book.category] ?? book.category,
          price: book.price,
          picture: book.coverUrl,
          discount: book.discount,
          category: book.category,
        },
        qty,
      )
    }
    cartSuccess('Добавлено в корзину', `«${titleName}» — ${totalItems} шт.`)
    setQuantities({})
    onClose()
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content} aria-describedby={undefined}>
          <Dialog.Close className={styles.closeBtn} aria-label="Закрыть">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Dialog.Close>

          <Dialog.Title className={styles.title}>{titleName}</Dialog.Title>
          <p className={styles.author}>{formatAuthors(authorNames)}</p>

          <p className={styles.sectionLabel}>Выберите тип издания</p>

          <div className={styles.rows}>
            {isLoading && (
              <div className={styles.loading}>Загрузка...</div>
            )}
            {!isLoading && products.map((book) => (
              <div
                key={book.id}
                className={`${styles.row} ${!book.inStock ? styles.rowSoldOut : ''}`}
              >

                <div className={styles.itemAndStepper}>

                  <div className={styles.itemAndLabel}>

                    <div className={styles.rowIcon}>
                      <ProductTypeIcon category={book.category} size={52} />
                    </div>

                    <span className={styles.rowLabel}>
                      {CATEGORY_LABELS[book.category] ?? book.category}
                      {!book.inStock && (
                        <span className={styles.soldOutTag}>нет в наличии</span>
                      )}
                    </span>

                  </div>

                  {DIGITAL_CATEGORIES.has(book.category) ? (
                    <button
                      type="button"
                      className={`${styles.toggleBtn} ${getQty(book) > 0 ? styles.toggleBtnActive : ''}`}
                      onClick={() => setQty(book.id, getQty(book) > 0 ? 0 : 1)}
                      disabled={!book.inStock}
                      aria-label={getQty(book) > 0 ? 'Убрать' : 'Добавить'}
                    >
                      {getQty(book) > 0 ? (
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
                        onClick={() => setQty(book.id, getQty(book) - 1)}
                        disabled={!book.inStock || getQty(book) === 0}
                        aria-label="Уменьшить"
                      >
                        −
                      </button>
                      <span className={styles.stepperVal}>{getQty(book)}</span>
                      <button
                        type="button"
                        className={styles.stepperBtn}
                        onClick={() => setQty(book.id, getQty(book) + 1)}
                        disabled={!book.inStock}
                        aria-label="Увеличить"
                      >
                        +
                      </button>
                    </div>
                  )}

                </div>


                <div className={styles.rowPrices}>
                  {book.originalPrice && (
                    <span className={styles.rowOriginalPrice}>{fmt.format(book.originalPrice)}</span>
                  )}
                  <span className={styles.rowPrice}>{fmt.format(book.price)}</span>
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
              <span className={styles.totalPrice}>{totalItems > 0 ? fmt.format(totalPrice) : '—'}</span>
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
