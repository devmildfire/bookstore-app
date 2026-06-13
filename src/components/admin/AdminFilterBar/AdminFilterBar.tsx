import Link from 'next/link'
import { SearchIcon } from '@/components/common/icons'
import styles from './AdminFilterBar.module.scss'

// The one search/filter toolbar for every admin list, per the handoff
// `.toolbar`/`.search-field`. A GET form: the search field grows to fill, extra
// filter controls (native <select>s) are passed as children and auto-styled,
// then a submit button and a conditional "Сбросить" reset link.
type Props = {
  /** Current path the reset link points at, e.g. '/admin/books'. */
  resetHref: string
  /** Whether any filter is active (controls whether "Сбросить" shows). */
  hasFilters: boolean
  searchName?: string
  searchDefaultValue?: string
  searchPlaceholder: string
  submitLabel?: string
  /** Extra filter controls (e.g. status <select>s), rendered after the search. */
  children?: React.ReactNode
}

export default function AdminFilterBar({
  resetHref,
  hasFilters,
  searchName = 'q',
  searchDefaultValue,
  searchPlaceholder,
  submitLabel = 'Найти',
  children,
}: Props) {
  return (
    <form className={styles.toolbar} method='get'>
      <div className={styles.searchField}>
        <SearchIcon className={styles.searchIcon} />
        <input
          type='search'
          name={searchName}
          defaultValue={searchDefaultValue}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
        />
      </div>
      {children}
      <button type='submit' className={styles.apply}>
        {submitLabel}
      </button>
      {hasFilters && (
        <Link href={resetHref} className={styles.reset}>
          Сбросить
        </Link>
      )}
    </form>
  )
}
