'use client'

import { useMemo, useState, type ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Popover from '@radix-ui/react-popover'
import cn from 'classnames'
import type { BookFilters, BookSort } from '@/entities/book/client'
import type { ProductCategory } from '@/types/database'
import styles from './CatalogControls.module.scss'

export type CatalogFilterDraft = {
  categories: ProductCategory[]
  authors: string[]
  years: string[]
}

type Props = {
  filters: BookFilters
  categories: ProductCategory[]
  authors: string[]
  years: string[]
  onApplyFilters: (draft: CatalogFilterDraft) => void
  onSortChange: (sort: BookSort) => void
  className?: string
}

type FilterGroup = 'categories' | 'authors' | 'years'

const categoryLabels: Partial<Record<ProductCategory, string>> = {
  PrintBook: 'Печатное',
  EBook: 'Цифровое',
  AudioBook: 'Аудио',
  'Book2.0': 'Книга 2.0',
}

const sortRows: Array<{ label: string; asc: BookSort; desc: BookSort }> = [
  { label: 'По дате издания', asc: 'year-asc', desc: 'year-desc' },
  { label: 'По фамилии автора', asc: 'author-asc', desc: 'author-desc' },
  { label: 'По цене', asc: 'price-asc', desc: 'price-desc' },
]

export default function CatalogControls({
  filters,
  categories,
  authors,
  years,
  onApplyFilters,
  onSortChange,
  className,
}: Props) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [draft, setDraft] = useState<CatalogFilterDraft>(() => getDraftFromFilters(filters))

  const selectedChips = useMemo(
    () => [
      ...draft.authors.map((value) => ({ group: 'authors' as const, value, label: value })),
      ...draft.categories.map((value) => ({
        group: 'categories' as const,
        value,
        label: getCategoryLabel(value),
      })),
      ...draft.years.map((value) => ({ group: 'years' as const, value, label: value })),
    ],
    [draft],
  )

  function toggleValue(group: FilterGroup, value: string) {
    setDraft((current) => {
      const values = current[group]
      const nextValues = values.includes(value as never)
        ? values.filter((item) => item !== value)
        : [...values, value]

      return {
        ...current,
        [group]: nextValues,
      }
    })
  }

  function removeChip(group: FilterGroup, value: string) {
    setDraft((current) => ({
      ...current,
      [group]: current[group].filter((item) => item !== value),
    }))
  }

  function dismissFilters() {
    setDraft(getDraftFromFilters(filters))
    setIsFilterOpen(false)
  }

  function handleFilterOpenChange(open: boolean) {
    if (open) setDraft(getDraftFromFilters(filters))
    setIsFilterOpen(open)
  }

  function applyFilters() {
    onApplyFilters(draft)
    setIsFilterOpen(false)
  }

  function handleSortChange(sort: BookSort) {
    onSortChange(sort)
    setIsSortOpen(false)
  }

  return (
    <div className={cn(styles.wrapper, className)}>
      <div className={styles.controlBar} aria-label='Фильтры и сортировка каталога'>
        <Dialog.Root open={isFilterOpen} onOpenChange={handleFilterOpenChange}>
          <Dialog.Trigger asChild>
            <button className={styles.controlButton} type='button' aria-label='Открыть фильтры'>
              <FilterIcon />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className={styles.overlay} />
            <Dialog.Content className={styles.filterModal}>
              <div className={styles.modalHeader}>
                <Dialog.Title className={styles.modalTitle}>Фильтры</Dialog.Title>
                <button className={styles.closeButton} type='button' onClick={dismissFilters} aria-label='Закрыть фильтры'>
                  <CloseIcon />
                </button>
              </div>

              <div className={styles.filterPanels}>
                <FilterPanel title='Авторы'>
                  <OptionList
                    values={authors}
                    selectedValues={draft.authors}
                    getLabel={(value) => value}
                    onToggle={(value) => toggleValue('authors', value)}
                  />
                </FilterPanel>

                <FilterPanel title='Тип издания'>
                  <OptionList
                    values={categories}
                    selectedValues={draft.categories}
                    getLabel={getCategoryLabel}
                    onToggle={(value) => toggleValue('categories', value)}
                  />
                </FilterPanel>

                <FilterPanel title='Год издания'>
                  <OptionList
                    values={years}
                    selectedValues={draft.years}
                    getLabel={(value) => value}
                    onToggle={(value) => toggleValue('years', value)}
                  />
                </FilterPanel>
              </div>

              {selectedChips.length > 0 && (
                <div className={styles.chips} aria-label='Выбранные фильтры'>
                  {selectedChips.map((chip) => (
                    <button
                      key={`${chip.group}-${chip.value}`}
                      className={styles.chip}
                      type='button'
                      onClick={() => removeChip(chip.group, chip.value)}
                    >
                      <span>{chip.label}</span>
                      <CloseSmallIcon />
                    </button>
                  ))}
                </div>
              )}

              <div className={styles.modalActions}>
                <button className={styles.actionButton} type='button' onClick={dismissFilters} aria-label='Отменить'>
                  <DismissIcon />
                </button>
                <button className={styles.actionButton} type='button' onClick={applyFilters} aria-label='Применить'>
                  <ApplyIcon />
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <div className={styles.divider} />

        <Popover.Root open={isSortOpen} onOpenChange={setIsSortOpen}>
          <Popover.Trigger asChild>
            <button className={styles.controlButton} type='button' aria-label='Открыть сортировку'>
              <SortIcon />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content className={styles.sortPopover} align='end' sideOffset={10}>
              <div className={styles.sortHeader}>
                <span>Сортировка</span>
                <Popover.Close asChild>
                  <button className={styles.sortCloseButton} type='button' aria-label='Закрыть сортировку'>
                    <CloseSmallIcon />
                  </button>
                </Popover.Close>
              </div>
              <div className={styles.sortList}>
                {sortRows.map((row) => (
                  <div className={styles.sortRow} key={row.label}>
                    <span>{row.label}</span>
                    <div className={styles.sortButtons}>
                      <button
                        className={cn(styles.sortDirection, filters.sort === row.asc && styles.active)}
                        type='button'
                        onClick={() => handleSortChange(row.asc)}
                        aria-label={`${row.label}: по возрастанию`}
                      >
                        △
                      </button>
                      <button
                        className={cn(styles.sortDirection, filters.sort === row.desc && styles.active)}
                        type='button'
                        onClick={() => handleSortChange(row.desc)}
                        aria-label={`${row.label}: по убыванию`}
                      >
                        ▽
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </div>
  )
}

function FilterPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.filterPanel}>
      <h3>{title}</h3>
      {children}
    </section>
  )
}

function OptionList<T extends string>({
  values,
  selectedValues,
  getLabel,
  onToggle,
}: {
  values: T[]
  selectedValues: T[]
  getLabel: (value: T) => string
  onToggle: (value: T) => void
}) {
  return (
    <div className={styles.optionList}>
      {values.map((value) => (
        <label className={styles.option} key={value}>
          <input
            type='checkbox'
            checked={selectedValues.includes(value)}
            onChange={() => onToggle(value)}
          />
          <span>{getLabel(value)}</span>
        </label>
      ))}
    </div>
  )
}

function getDraftFromFilters(filters: BookFilters): CatalogFilterDraft {
  return {
    categories: filters.categories,
    authors: filters.authors,
    years: filters.years,
  }
}

function getCategoryLabel(category: ProductCategory): string {
  return categoryLabels[category] ?? category
}

function FilterIcon() {
  return (
    <svg width='34' height='34' viewBox='0 0 34 34' fill='none' aria-hidden>
      <path d='M10 7V27M24 7V27' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
      <circle cx='10' cy='19' r='4' stroke='currentColor' strokeWidth='1.5' />
      <circle cx='24' cy='13' r='4' stroke='currentColor' strokeWidth='1.5' />
    </svg>
  )
}

function SortIcon() {
  return (
    <svg width='34' height='34' viewBox='0 0 34 34' fill='none' aria-hidden>
      <path d='M12 7V27M12 27L7 22M12 27L17 22' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
      <path d='M22 27V7M22 7L17 12M22 7L27 12' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width='34' height='34' viewBox='0 0 34 34' fill='none' aria-hidden>
      <path d='M8 8L26 26M26 8L8 26' stroke='currentColor' strokeWidth='1.2' strokeLinecap='round' />
    </svg>
  )
}

function CloseSmallIcon() {
  return (
    <svg width='15' height='15' viewBox='0 0 15 15' fill='none' aria-hidden>
      <path d='M3.5 3.5L11.5 11.5M11.5 3.5L3.5 11.5' stroke='currentColor' strokeLinecap='round' />
    </svg>
  )
}

function DismissIcon() {
  return (
    <svg width='50' height='50' viewBox='0 0 50 50' fill='none' aria-hidden>
      <circle cx='25' cy='25' r='24.5' stroke='currentColor' opacity='0.35' />
      <path d='M17 18L33 32M33 18L17 32' stroke='currentColor' strokeWidth='1.4' strokeLinecap='round' />
    </svg>
  )
}

function ApplyIcon() {
  return (
    <svg width='50' height='50' viewBox='0 0 50 50' fill='none' aria-hidden>
      <circle cx='25' cy='25' r='24.5' stroke='currentColor' opacity='0.35' />
      <path d='M15 25H34M34 25L27 18M34 25L27 32' stroke='currentColor' strokeWidth='1.4' strokeLinecap='round' />
    </svg>
  )
}
