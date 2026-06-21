import { type ReactNode } from 'react'
import cn from 'classnames'
import Scroller from '@/components/common/Scroller'
import { CloseSmallIcon, SearchIcon } from './icons'
import type { FilterGroup } from './helpers'
import styles from './CatalogControls.module.scss'

export function FilterPanel({
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

export function SelectedChips<T extends string>({
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

export function AuthorSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
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

export function AuthorList({
  values,
  selectedValues,
  onToggle,
}: {
  values: string[]
  selectedValues: string[]
  onToggle: (value: string) => void
}) {
  return (
    <Scroller className={styles.plainOptionList} axis='vertical'>
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
    </Scroller>
  )
}

export function PlainOptionList<T extends string>({
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
    <Scroller className={styles.plainOptionList} axis='vertical'>
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
    </Scroller>
  )
}
