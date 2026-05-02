'use client'

import { useId } from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import cn from 'classnames'
import styles from './Select.module.scss'

type Option = {
  value: string
  label: string
}

type Props = {
  value?: string
  onValueChange?: (value: string) => void
  options: Option[]
  placeholder?: string
  disabled?: boolean
  label?: string
  error?: string
  className?: string
}

export default function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Выберите...',
  disabled,
  label,
  error,
  className,
}: Props) {
  const id = useId()

  return (
    <div className={cn(styles.wrapper, { [styles.hasError]: !!error }, className)}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectPrimitive.Trigger id={id} className={styles.trigger}>
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon className={styles.icon}>
            <svg width='12' height='8' viewBox='0 0 12 8' fill='none' aria-hidden>
              <path d='M1 1L6 6L11 1' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content className={styles.content} position='popper' sideOffset={4}>
            <SelectPrimitive.Viewport className={styles.viewport}>
              {options.map((opt) => (
                <SelectPrimitive.Item key={opt.value} value={opt.value} className={styles.item}>
                  <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className={styles.itemIndicator}>
                    <svg width='10' height='8' viewBox='0 0 10 8' fill='none' aria-hidden>
                      <path d='M1 4L3.5 6.5L9 1' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                    </svg>
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}
