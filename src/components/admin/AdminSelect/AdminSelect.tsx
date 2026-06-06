'use client'

import { useState, useRef, useEffect } from 'react'
import cn from 'classnames'
import { ChevronDownIcon, CheckIcon } from '@/components/admin/icons'
import Scroller from '@/components/common/Scroller/Scroller'
import styles from './AdminSelect.module.scss'

// Custom admin dropdown, ported from the handoff `.cselect`: a styled trigger
// (label left, chevron at the right padding, sized to the text) opening a dark
// popover whose selected option shows a red check. Renders a hidden <input> so
// it submits inside a plain GET/Server-Action form, and supports empty-string
// values (which Radix Select can't). Used for every admin dropdown except the
// storefront header, which has its own.
export type AdminSelectOption = { value: string; label: string }

type Props = {
  name: string
  options: AdminSelectOption[]
  defaultValue?: string
  ariaLabel?: string
  onChange?: (value: string) => void
}

export default function AdminSelect({ name, options, defaultValue = '', ariaLabel, onChange }: Props) {
  const [value, setValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = options.find((o) => o.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function pick(v: string) {
    setValue(v)
    onChange?.(v)
    setOpen(false)
  }

  return (
    <div className={cn(styles.select, open && styles.open)} ref={ref}>
      <input type='hidden' name={name} value={value} />
      <button
        type='button'
        className={styles.trigger}
        aria-haspopup='listbox'
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.value}>{current?.label ?? ''}</span>
        <ChevronDownIcon className={styles.chev} />
      </button>
      {open && (
        <Scroller className={styles.menu} axis='vertical'>
          <ul className={styles.menuList} role='listbox'>
            {options.map((o) => (
              <li
                key={o.value}
                role='option'
                aria-selected={o.value === value}
                className={cn(styles.option, o.value === value && styles.selected)}
                onClick={() => pick(o.value)}
              >
                <span>{o.label}</span>
                <CheckIcon className={styles.check} />
              </li>
            ))}
          </ul>
        </Scroller>
      )}
    </div>
  )
}
