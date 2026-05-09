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
type PanelId = 'authors' | 'categories' | 'years'

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
  const [authorSearch, setAuthorSearch] = useState('')
  const [collapsedPanels, setCollapsedPanels] = useState<PanelId[]>([])
  const [draft, setDraft] = useState<CatalogFilterDraft>(() => getDraftFromFilters(filters))

  const filteredAuthors = useMemo(() => {
    const search = authorSearch.trim().toLowerCase()
    if (!search) return authors

    return authors.filter((author) => author.toLowerCase().includes(search))
  }, [authorSearch, authors])

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

  function closeFilters() {
    setDraft(getDraftFromFilters(filters))
    setAuthorSearch('')
    setIsFilterOpen(false)
  }

  function clearFilters() {
    setDraft({
      categories: [],
      authors: [],
      years: [],
    })
    setAuthorSearch('')
  }

  function handleFilterOpenChange(open: boolean) {
    if (open) {
      setDraft(getDraftFromFilters(filters))
      setAuthorSearch('')
    }
    setIsFilterOpen(open)
  }

  function applyFilters() {
    setIsFilterOpen(false)
    setTimeout(() => onApplyFilters(draft), 0)
  }

  function handleSortChange(sort: BookSort) {
    onSortChange(sort)
    setIsSortOpen(false)
  }

  function togglePanel(panel: PanelId) {
    setCollapsedPanels((current) =>
      current.includes(panel) ? current.filter((item) => item !== panel) : [...current, panel],
    )
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
                <button className={styles.closeButton} type='button' onClick={closeFilters} aria-label='Закрыть фильтры'>
                  <CloseIcon />
                </button>
              </div>

              <div className={styles.filterPanels}>
                <div>
                  <FilterPanel
                    title='Авторы'
                    isCollapsed={collapsedPanels.includes('authors')}
                    onToggle={() => togglePanel('authors')}
                  >
                    <AuthorSearch
                      value={authorSearch}
                      onChange={setAuthorSearch}
                    />
                    <AuthorList
                      values={filteredAuthors}
                      selectedValues={draft.authors}
                      onToggle={(value) => toggleValue('authors', value)}
                    />
                  </FilterPanel>
                  <SelectedChips
                    group='authors'
                    values={draft.authors}
                    getLabel={(value) => value}
                    onRemove={removeChip}
                  />
                </div>

                <div>
                  <FilterPanel
                    title='Тип издания'
                    isCollapsed={collapsedPanels.includes('categories')}
                    onToggle={() => togglePanel('categories')}
                  >
                    <PlainOptionList
                      values={categories}
                      selectedValues={draft.categories}
                      getLabel={getCategoryLabel}
                      onToggle={(value) => toggleValue('categories', value)}
                    />
                  </FilterPanel>
                  <SelectedChips
                    group='categories'
                    values={draft.categories}
                    getLabel={getCategoryLabel}
                    onRemove={removeChip}
                  />
                </div>

                <div>
                  <FilterPanel
                    title='Год издания'
                    isCollapsed={collapsedPanels.includes('years')}
                    onToggle={() => togglePanel('years')}
                  >
                    <PlainOptionList
                      values={years}
                      selectedValues={draft.years}
                      getLabel={(value) => value}
                      onToggle={(value) => toggleValue('years', value)}
                    />
                  </FilterPanel>
                  <SelectedChips
                    group='years'
                    values={draft.years}
                    getLabel={(value) => value}
                    onRemove={removeChip}
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.actionButton} type='button' onClick={clearFilters} aria-label='Сбросить фильтры'>
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

function FilterPanel({
  title,
  isCollapsed,
  onToggle,
  children,
}: {
  title: string
  isCollapsed: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <section className={cn(styles.filterPanel, isCollapsed && styles.collapsed)}>
      <button className={styles.filterPanelHeader} type='button' onClick={onToggle} aria-expanded={!isCollapsed}>
        <h3>{title}</h3>
        <span aria-hidden>▾</span>
      </button>
      {!isCollapsed && children}
    </section>
  )
}

function SelectedChips<T extends string>({
  group,
  values,
  getLabel,
  onRemove,
}: {
  group: FilterGroup
  values: T[]
  getLabel: (value: T) => string
  onRemove: (group: FilterGroup, value: string) => void
}) {
  if (values.length === 0) return null

  return (
    <div className={styles.chips} aria-label='Выбранные фильтры'>
      {values.map((value) => (
        <button
          key={`${group}-${value}`}
          className={styles.chip}
          type='button'
          onClick={() => onRemove(group, value)}
        >
          <span>{getLabel(value)}</span>
          <CloseSmallIcon />
        </button>
      ))}
    </div>
  )
}

function AuthorSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className={styles.authorSearch}>
      <span className={styles.visuallyHidden}>Поиск автора</span>
      <input
        type='search'
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder='А'
      />
      <SearchIcon />
    </label>
  )
}

function AuthorList({
  values,
  selectedValues,
  onToggle,
}: {
  values: string[]
  selectedValues: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className={styles.plainOptionList}>
      {values.map((value) => (
        <button
          className={cn(styles.plainOption, selectedValues.includes(value) && styles.selected)}
          key={value}
          type='button'
          onClick={() => onToggle(value)}
        >
          {value}
        </button>
      ))}
    </div>
  )
}

function PlainOptionList<T extends string>({
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
    <div className={styles.plainOptionList}>
      {values.map((value) => (
        <button
          className={cn(styles.plainOption, selectedValues.includes(value) && styles.selected)}
          key={value}
          type='button'
          onClick={() => onToggle(value)}
        >
          {getLabel(value)}
        </button>
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

function SearchIcon() {
  return (
    <svg width='16' height='16' viewBox='0 0 16 16' fill='none' aria-hidden>
      <circle cx='7' cy='7' r='4.5' stroke='currentColor' />
      <path d='M10.5 10.5L14 14' stroke='currentColor' strokeLinecap='round' />
    </svg>
  )
}

function DismissIcon() {
  return (
    <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.5">
        <path d="M18.8509 13.1242C18.6434 13.4827 18.7658 13.9415 19.1242 14.1491C19.4827 14.3566 19.9415 14.2342 20.1491 13.8758L18.8509 13.1242ZM23.2644 6.99792L22.6153 6.62214V6.62214L23.2644 6.99792ZM26.7285 7.00206L26.0785 7.37629V7.37629L26.7285 7.00206ZM34.305 21.2242C34.705 21.3319 35.1165 21.095 35.2242 20.695L36.979 14.1771C37.0867 13.7771 36.8498 13.3656 36.4498 13.2579C36.0498 13.1502 35.6383 13.3871 35.5306 13.7871L33.9708 19.5808L28.1771 18.021C27.7771 17.9133 27.3656 18.1502 27.2579 18.5502C27.1502 18.9502 27.3871 19.3617 27.7871 19.4694L34.305 21.2242ZM20.1491 13.8758L23.9134 7.37369L22.6153 6.62214L18.8509 13.1242L20.1491 13.8758ZM26.0785 7.37629L33.85 20.8742L35.15 20.1258L27.3784 6.62784L26.0785 7.37629ZM23.9134 7.37369C24.3956 6.54094 25.5984 6.54238 26.0785 7.37629L27.3784 6.62784C26.3221 4.79325 23.676 4.79007 22.6153 6.62214L23.9134 7.37369Z" fill="currentColor"/>
        <path d="M38.2708 25.1656C38.0662 24.8054 37.6084 24.6792 37.2482 24.8838C36.888 25.0883 36.7619 25.5461 36.9664 25.9063L38.2708 25.1656ZM41.3284 32.0693L41.9806 31.6989V31.6989L41.3284 32.0693ZM39.5749 35.0568L39.5803 34.3068V34.3068L39.5749 35.0568ZM23.4735 34.4111C23.1785 34.7019 23.1751 35.1767 23.4659 35.4717L28.2045 40.2788C28.4953 40.5738 28.9702 40.5772 29.2652 40.2864C29.5602 39.9956 29.5636 39.5207 29.2728 39.2257L25.0606 34.9528L29.3336 30.7407C29.6285 30.4499 29.6319 29.975 29.3412 29.68C29.0504 29.3851 28.5755 29.3816 28.2805 29.6724L23.4735 34.4111ZM36.9664 25.9063L40.6762 32.4396L41.9806 31.6989L38.2708 25.1656L36.9664 25.9063ZM39.5803 34.3068L24.0054 34.1952L23.9946 35.6952L39.5696 35.8068L39.5803 34.3068ZM40.6762 32.4396C41.1514 33.2764 40.5425 34.3137 39.5803 34.3068L39.5696 35.8068C41.6865 35.8219 43.0259 33.5398 41.9806 31.6989L40.6762 32.4396Z" fill="currentColor"/>
        <path d="M18.9613 36.1959C19.3754 36.1853 19.7025 35.841 19.6919 35.4269C19.6813 35.0129 19.337 34.6858 18.9229 34.6964L18.9613 36.1959ZM11.4314 35.6382L11.4506 36.3879V36.3879L11.4314 35.6382ZM9.62324 32.6834L10.2821 33.0417V33.0417L9.62324 32.6834ZM17.7828 18.7875C17.6654 18.3903 17.2482 18.1635 16.851 18.2809L10.3778 20.194C9.98056 20.3114 9.75372 20.7286 9.87111 21.1258C9.98851 21.523 10.4057 21.7499 10.8029 21.6325L16.5569 19.9319L18.2574 25.6859C18.3748 26.0831 18.792 26.31 19.1893 26.1926C19.5865 26.0752 19.8133 25.658 19.6959 25.2608L17.7828 18.7875ZM18.9229 34.6964L11.4122 34.8884L11.4506 36.3879L18.9613 36.1959L18.9229 34.6964ZM10.2821 33.0417L17.7225 19.3584L16.4047 18.6418L8.96435 32.3251L10.2821 33.0417ZM11.4122 34.8884C10.4503 34.913 9.82247 33.887 10.2821 33.0417L8.96435 32.3251C7.95309 34.1849 9.33432 36.442 11.4506 36.3879L11.4122 34.8884Z" fill="currentColor"/>
        <circle cx="25" cy="25" r="24.5" stroke="currentColor"/>
      </g>
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
