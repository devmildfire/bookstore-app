'use client'

import { useState } from 'react'
import cn from 'classnames'
import { MinusIcon, PlusIcon } from '@/components/admin/icons'
import styles from './NumberStepper.module.scss'

// Hard-edged −/+ number stepper replacing native <input type=number>. Renders a
// real named number input so it submits in forms. Works controlled
// (value + onChange) or uncontrolled (defaultValue) like a native input.
type Props = {
  name?: string
  id?: string
  value?: number | ''
  defaultValue?: number | string
  onChange?: (value: number | '') => void
  min?: number
  max?: number
  step?: number
  wide?: boolean
  disabled?: boolean
  required?: boolean
  'aria-label'?: string
}

export default function NumberStepper({
  name,
  id,
  value,
  defaultValue,
  onChange,
  min = 0,
  max = 999999,
  step = 1,
  wide,
  disabled,
  required,
  'aria-label': ariaLabel,
}: Props) {
  const controlled = value !== undefined
  const [inner, setInner] = useState<number | ''>(() => {
    const d = defaultValue ?? ''
    return d === '' ? '' : Number(d)
  })
  const [focus, setFocus] = useState(false)

  const v: number | '' = controlled ? (value === '' || value == null ? '' : Number(value)) : inner
  const clamp = (n: number) => Math.max(min, Math.min(max, n))
  const commit = (next: number | '') => {
    if (!controlled) setInner(next)
    onChange?.(next)
  }
  const bump = (delta: number) => commit(clamp((typeof v === 'number' ? v : 0) + delta))

  return (
    <div className={cn(styles.stepper, wide && styles.wide, focus && styles.focus, disabled && styles.disabled)}>
      <button
        type='button'
        aria-label='Уменьшить'
        onClick={() => bump(-step)}
        disabled={disabled || (v !== '' && v <= min)}
      >
        <MinusIcon />
      </button>
      {/* Text input with a numeric filter rather than type=number: type=number
          keeps an invalid-input buffer that can still display typed letters. We
          strip non-digits on every change so only digits ever appear. */}
      <input
        id={id}
        name={name}
        type='text'
        inputMode='numeric'
        size={1}
        value={v}
        disabled={disabled}
        required={required}
        aria-label={ariaLabel}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '')
          commit(digits === '' ? '' : clamp(Number(digits)))
        }}
      />
      <button
        type='button'
        aria-label='Увеличить'
        onClick={() => bump(step)}
        disabled={disabled || (v !== '' && v >= max)}
      >
        <PlusIcon />
      </button>
    </div>
  )
}
