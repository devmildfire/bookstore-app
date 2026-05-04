'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import cn from 'classnames'
import { useSearch } from '@/hooks/useSearch'
import SearchIcon from '@/assets/icons/search.svg'
import CrossIcon from '@/assets/icons/cross.svg'
import styles from './HeaderSearchBar.module.scss'

type Props = {
  expanded: boolean
  onExpand: () => void
  onCollapse: () => void
}

function formatAgeRestriction(age: number | null): string {
  if (age === null || age === undefined) return ''
  return `${age}+`
}

function formatMetaLine(book: {
  year: string | null
  litForm: string | null
  ageRestriction: number | null
}): string {
  const parts: string[] = []
  if (book.year) parts.push(book.year)
  if (book.litForm) parts.push(book.litForm)
  if (book.ageRestriction !== null && book.ageRestriction !== undefined) {
    parts.push(formatAgeRestriction(book.ageRestriction))
  }
  return parts.join(' \u00B7 ')
}

export default function HeaderSearchBar({ expanded, onExpand, onCollapse }: Props) {
  const [query, setQuery] = useState('')
  const { results, isLoading } = useSearch(query)
  const hasQuery = query.length >= 3
  const isDropdownOpen = hasQuery && !isLoading
  const mobileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (expanded && mobileInputRef.current) {
      mobileInputRef.current.focus()
    }
  }, [expanded])

  const handleClose = useCallback(() => {
    setQuery('')
    onCollapse()
  }, [onCollapse])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.currentTarget.value)
  }

  function renderResults(onClickResult: () => void) {
    if (isLoading) {
      return <div className={styles.loadingState}>Поиск...</div>
    }

    if (results.length === 0) {
      return <div className={styles.emptyState}>Ничего не найдено...</div>
    }

    return (
      <ul className={styles.resultsList}>
        <li className={styles.resultsHeading}>Издания</li>
        {results.map((book) => (
          <li key={book.id}>
            <Link
              href={`/books/${book.slug}`}
              className={styles.resultItem}
              onClick={onClickResult}
            >
              <div className={styles.resultCover}>
                {book.coverUrl ? (
                  <Image
                    src={book.coverUrl}
                    alt={book.name}
                    fill
                    sizes='58px'
                    className={styles.resultImage}
                  />
                ) : (
                  <div className={styles.resultCoverPlaceholder} aria-hidden />
                )}
              </div>
              <div className={styles.resultInfo}>
                <span className={styles.resultTitle}>{book.name}</span>
                <span className={styles.resultAuthor}>{book.authorName}</span>
                <span className={styles.resultMeta}>{formatMetaLine(book)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <>
      {/* Desktop inline search — hidden on phone */}
      <div className={styles.desktopSearch}>
        <div className={cn(styles.block, isDropdownOpen && styles.blockOpen)}>
          <div className={styles.searchField}>
            <SearchIcon className={styles.searchIcon} aria-hidden />
            <input
              type='search'
              className={styles.input}
              placeholder=''
              value={query}
              onChange={handleChange}
              aria-label='Поиск книг'
            />
            {query.length > 0 && (
              <button
                type='button'
                className={styles.clearBtn}
                onClick={() => setQuery('')}
                aria-label='Очистить поиск'
              >
                <CrossIcon className={styles.clearIcon} />
              </button>
            )}
          </div>

          {isDropdownOpen && (
            <>
              <div className={styles.separator} aria-hidden />
              <div className={styles.dropdownContent}>
                {renderResults(() => setQuery(''))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile overlay — replaces entire header row on phone */}
      {expanded && (
        <div className={styles.mobileOverlay}>
          <div className={cn(styles.block, isDropdownOpen && styles.blockOpen)}>
            <div className={styles.mobileSearchField}>
              <SearchIcon className={styles.mobileSearchIcon} aria-hidden />
              <input
                ref={mobileInputRef}
                type='search'
                className={styles.mobileInput}
                placeholder=''
                value={query}
                onChange={handleChange}
                aria-label='Поиск книг'
                autoFocus
              />
              <button
                type='button'
                className={styles.mobileCloseBtn}
                onClick={handleClose}
                aria-label='Закрыть поиск'
              >
                <CrossIcon className={styles.mobileCloseIcon} />
              </button>
            </div>

            {isDropdownOpen && (
              <>
                <div className={styles.separator} aria-hidden />
                <div className={styles.dropdownContent}>
                  {renderResults(handleClose)}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}