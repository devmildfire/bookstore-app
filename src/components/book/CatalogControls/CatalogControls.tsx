'use client'

import { useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Popover from '@radix-ui/react-popover'
import cn from 'classnames'
import type { BookFilters, BookSort } from '@/entities/book/client'
import type { ProductCategory } from '@/types/database'
import Scroller from '@/components/common/Scroller'
import { FilterIcon, SortIcon, CloseIcon, CloseSmallIcon, DismissIcon, ApplyIcon } from './icons'
import { FilterPanel, SelectedChips, AuthorSearch, AuthorList, PlainOptionList } from './FilterParts'
import {
  type CatalogFilterDraft,
  type FilterGroup,
  type PanelId,
  sortRows,
  getDraftFromFilters,
  getCategoryLabel,
} from './helpers'
import styles from './CatalogControls.module.scss'

export type { CatalogFilterDraft }

type Props = {
  filters: BookFilters
  categories: ProductCategory[]
  authors: string[]
  years: string[]
  onApplyFilters: (draft: CatalogFilterDraft) => void
  onSortChange: (sort: BookSort) => void
  className?: string
}

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

              <Scroller className={styles.filterPanels} axis='vertical'>
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
              </Scroller>

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
