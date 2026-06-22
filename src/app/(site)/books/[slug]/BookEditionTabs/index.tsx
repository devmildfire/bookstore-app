'use client'

import { useState } from 'react'
import Image from 'next/image'
import cn from '@/utils/cn'
import { useCart } from '@/contexts/cart'
import { useToast } from '@/contexts/toast'
import ProductTypeIcon from '@/components/common/icons/ProductTypeIcon'
import Carousel from '@/components/common/Carousel'
import { formatProductPrice } from '@/lib/formatPrice'
import type { EditionPhotos } from '@/api/books/getBookPhotos'
import type { Book } from '@/entities/book/client'
import type { ProductCategory } from '@/types/database'
import TabBarFrame from './TabBarFrame'
import EditionCredits from './EditionCredits'
import styles from './BookEditionTabs.module.scss'

type Props = {
  books: Book[]
  /** Photos grouped by edition; each edition tab renders its own carousel. */
  editionPhotos?: EditionPhotos
  /** Used for image alt text. */
  bookName?: string
}

const TAB_ORDER: ProductCategory[] = ['PrintBook', 'Book2.0', 'AudioBook', 'EBook']

const EDITION_LABELS: Record<string, string> = {
  PrintBook: 'ПЕЧАТНОЕ ИЗДАНИЕ',
  'Book2.0': 'КНИГА 2.0',
  AudioBook: 'АУДИОКНИГА MP3',
  EBook: 'ЦИФРОВОЕ ИЗДАНИЕ',
}

const dateFmt = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
const numFmt = new Intl.NumberFormat('ru-RU')

function formatDate(value: string | null): string | null {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return dateFmt.format(d)
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h === 0) return `${m}м`
  return `${h}ч. ${m}м`
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} Гб`
  if (bytes >= 1_000_000) return `${Math.round(bytes / 1_000_000)} Мб`
  if (bytes >= 1_000) return `${Math.round(bytes / 1_000)} Кб`
  return `${bytes} б`
}

type DetailRow = { label: string; values: (string | null)[] }

// Each category contributes its own labeled rows. Null values are skipped so a
// partially-populated edition still renders without empty rows.
function buildRows(book: Book): DetailRow[] {
  const rows: DetailRow[] = []
  const releaseDate = formatDate(book.publishedAt)
  if (releaseDate) rows.push({ label: 'Дата релиза:', values: [releaseDate] })

  if (book.category === 'PrintBook') {
    rows.push({ label: 'Формат:', values: [book.format] })
    rows.push({ label: 'Объём:', values: [book.pageCount != null ? `${book.pageCount} стр.` : null] })
    rows.push({ label: 'Бумага:', values: [book.paper] })
    rows.push({ label: 'Обложка:', values: [book.coverMaterial] })
    rows.push({ label: 'Переплёт:', values: [book.binding] })
    rows.push({ label: 'Иллюстрации:', values: [book.illustrations] })
  } else if (book.category === 'Book2.0') {
    // All four sit under a single "Формат:" label per Figma.
    rows.push({
      label: 'Формат:',
      values: [book.format, book.printingTechnique, book.paper, book.packaging],
    })
  } else if (book.category === 'AudioBook') {
    rows.push({
      label: 'Длительность:',
      values: [book.durationSeconds != null ? formatDuration(book.durationSeconds) : null],
    })
    rows.push({
      label: 'Вес файла:',
      values: [book.fileSizeBytes != null ? formatFileSize(book.fileSizeBytes) : null],
    })
  } else if (book.category === 'EBook') {
    rows.push({ label: 'Форматы:', values: [book.formats?.join(' ') ?? null] })
    rows.push({
      label: 'Кол-во символов:',
      values: [book.characterCount != null ? numFmt.format(book.characterCount) : null],
    })
  }

  // «Над изданием работали» is rendered as a dedicated collapsible, full-width
  // credits block (EditionCredits) — not crammed into the narrow detail column.

  return rows
    .map((row) => ({ ...row, values: row.values.filter((v): v is string => Boolean(v)) }))
    .filter((row) => row.values.length > 0)
}

const NOTES: Partial<Record<ProductCategory, { primary?: string; secondary?: string }>> = {
  PrintBook: {
    primary: 'Цифровое издание в подарок.',
    secondary: 'Условия доставки обсуждаются индивидуально.',
  },
  'Book2.0': {
    primary: 'Отправка по России включена в стоимость.',
  },
}

const HAS_DEMO_BUTTON: Partial<Record<ProductCategory, boolean>> = {
  PrintBook: false,
  'Book2.0': true,
  AudioBook: true,
  EBook: true,
}

export default function BookEditionTabs({ books, editionPhotos = {}, bookName = '' }: Props) {
  const tabs = TAB_ORDER.filter((cat) => books.some((b) => b.category === cat))
  const [active, setActive] = useState<ProductCategory>(tabs[0])
  const { addItem } = useCart()
  const { cartSuccess } = useToast()

  if (tabs.length === 0) return null

  const book = books.find((b) => b.category === active)!
  const rows = buildRows(book)
  const notes = NOTES[book.category]
  const activePhotos = editionPhotos[active] ?? []

  function handleAddToCart() {
    addItem({
      id: book.id,
      name: book.name,
      subtitle: EDITION_LABELS[book.category] ?? book.category,
      price: book.price,
      picture: book.coverUrl ?? undefined,
      discount: book.discount ?? undefined,
      category: book.category,
    })
    cartSuccess('Добавлено в корзину')
  }

  const activeIndex = tabs.indexOf(active)

  return (
    <section className={styles.root}>
      <div className={styles.tabBar} role="tablist" aria-label="Формат издания">
        <TabBarFrame tabCount={tabs.length} activeIndex={activeIndex} />
        {tabs.map((cat) => (
          <button
            key={cat}
            id={`tab-${cat}`}
            role="tab"
            aria-selected={cat === active}
            aria-controls="edition-panel"
            className={cn(styles.tab, cat === active && styles.tabActive)}
            onClick={() => setActive(cat)}
          >
            <ProductTypeIcon
              category={cat}
              size={53}
              className={cn(styles.icon, cat === active && styles.iconActive)}
            />
          </button>
        ))}
      </div>

      <div
        id="edition-panel"
        role="tabpanel"
        aria-labelledby={`tab-${active}`}
        className={styles.panel}
      >
        <div className={styles.panelContent}>
          <h2 className={styles.editionTitle}>{EDITION_LABELS[active] ?? active}</h2>
          <p className={styles.price}>{formatProductPrice(book.price)}</p>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.addToCartBtn}
              onClick={handleAddToCart}
              disabled={!book.inStock}
            >
              {book.inStock ? 'Добавить в корзину' : 'Нет в наличии'}
            </button>
            {HAS_DEMO_BUTTON[book.category] && (() => {
              // Book2.0 resolves its demo from the sibling EBook if it has no own demo.
              const demoUrl = book.demoUrl ?? (book.category === 'Book2.0' ? books.find((b) => b.category === 'EBook')?.demoUrl : null)
              return (
                <button
                  type="button"
                  className={styles.demoBtn}
                  disabled={!demoUrl}
                  aria-label={demoUrl ? 'Скачать демо-версию' : 'Демо-версия (скоро)'}
                  onClick={() => { if (demoUrl) window.open(demoUrl, '_blank') }}
                >
                  Демо-версия
                </button>
              )
            })()}
            {notes && (
              <div className={styles.notes}>
                {notes.primary && <p className={styles.notePrimary}>{notes.primary}</p>}
                {notes.secondary && <p className={styles.noteSecondary}>{notes.secondary}</p>}
              </div>
            )}
          </div>

          {rows.length > 0 && (
            <dl className={styles.details}>
              {rows.map((row) => (
                <div key={row.label} className={styles.detailRow}>
                  <dt className={styles.detailLabel}>{row.label}</dt>
                  <dd className={styles.detailValue}>
                    {row.values.map((v, i) => (
                      <div key={i}>{v}</div>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <EditionCredits key={active} workers={book.workers} />

          {activePhotos.length > 0 && (
            <div className={styles.carouselWrap}>
              <Carousel
                ariaLabel={`Фотографии книги: ${bookName}`}
                slides={activePhotos.map((photo, i) => (
                  <Image
                    key={photo.url}
                    src={photo.url}
                    alt={`${bookName} — фото ${i + 1}`}
                    width={500}
                    height={500}
                    sizes="(max-width: 532px) 280px, (max-width: 767px) 360px, (max-width: 1200px) 420px, 500px"
                    placeholder={photo.blurDataURL ? 'blur' : 'empty'}
                    blurDataURL={photo.blurDataURL ?? undefined}
                  />
                ))}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
