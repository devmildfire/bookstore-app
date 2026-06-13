'use client'

import { useEffect, useId, useRef, useState } from 'react'
import cn from 'classnames'
import { ChevronDownIcon, CheckIcon } from '@/components/common/icons'
import Scroller from '@/components/common/Scroller/Scroller'
import styles from './Select.module.scss'

// The one dropdown for the whole app (storefront + admin). Custom (not native /
// not Radix) because admin forms need empty-string values and a hidden <input>
// for plain GET / Server-Action submits, which Radix Select can't do.
//
// Works controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`,
// + optional `name` → hidden input for forms). Optional `label`/`error` wrap it
// as a labelled field.
export type SelectOption = { value: string; label: string }

type Props = {
  options: SelectOption[]
  /** Controlled value. Omit for uncontrolled (seeded by defaultValue). */
  value?: string
  defaultValue?: string
  /** Called with the picked value. `onChange` is an accepted alias. */
  onValueChange?: (value: string) => void
  onChange?: (value: string) => void
  /** Renders a hidden <input name> so the value submits in a plain form. */
  name?: string
  placeholder?: string
  disabled?: boolean
  ariaLabel?: string
  label?: string
  error?: string
  className?: string
}

export default function Select({
  options,
  value,
  defaultValue = '',
  onValueChange,
  onChange,
  name,
  placeholder,
  disabled,
  ariaLabel,
  label,
  error,
  className,
}: Props) {
  const id = useId()
  const isControlled = value !== undefined
  const [internal, setInternal] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = isControlled ? value : internal
  const selected = options.find((o) => o.value === current)

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
    if (!isControlled) setInternal(v)
    onValueChange?.(v)
    onChange?.(v)
    setOpen(false)
  }

  const dropdown = (
    <div className={cn(styles.select, open && styles.open)} ref={ref}>
      {name && <input type='hidden' name={name} value={current ?? ''} />}
      <button
        type='button'
        id={label ? id : undefined}
        className={styles.trigger}
        aria-haspopup='listbox'
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={cn(styles.value, !selected && styles.placeholder)}>
          {selected?.label ?? placeholder ?? ''}
        </span>
        <ChevronDownIcon className={styles.chev} />
      </button>
      {open && (
        <Scroller className={styles.menu} axis='vertical'>
          <ul className={styles.menuList} role='listbox'>
            {options.map((o) => (
              <li
                key={o.value}
                role='option'
                aria-selected={o.value === current}
                className={cn(styles.option, o.value === current && styles.selected)}
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

  if (!label && !error && !className) return dropdown

  return (
    <div className={cn(styles.wrapper, { [styles.hasError]: !!error }, className)}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      {dropdown}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}
