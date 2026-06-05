'use client'

import { useId } from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import cn from 'classnames'
import styles from './Checkbox.module.scss'

type Props = {
  label?: string
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  id?: string
  name?: string
  className?: string
}

export default function Checkbox({
  label,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  id,
  name,
  className,
}: Props) {
  const generatedId = useId()
  const checkboxId = id ?? generatedId

  return (
    <div className={cn(styles.wrapper, className)}>
      <CheckboxPrimitive.Root
        id={checkboxId}
        name={name}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={styles.root}
      >
        <CheckboxPrimitive.Indicator className={styles.indicator}>
          <svg width='10' height='8' viewBox='0 0 10 8' fill='none' aria-hidden>
            <path d='M1 4L3.5 6.5L9 1' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <label htmlFor={checkboxId} className={styles.label}>
          {label}
        </label>
      )}
    </div>
  )
}
