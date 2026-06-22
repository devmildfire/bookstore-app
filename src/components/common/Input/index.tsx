'use client'

import { forwardRef, useId } from 'react'
import cn from '@/utils/cn'
import styles from './Input.module.scss'

// The one text input for the whole app (storefront + admin). Forwards a ref and
// every native <input> attribute, so it drops straight into react-hook-form
// (`{...register('field')}`).
//
// Two ergonomic modes, one component:
//  - Bare: no label/error/hint → renders just the <input>, so it sits inside a
//    caller-provided <label> without an extra wrapper (the common form pattern).
//  - Wrapped: pass label/error/hint → renders the labelled field block.
//
// For type='number' it renders a numeric text field (type=text + inputMode) and
// strips non-numeric characters on input — a native number input keeps an
// invalid-input buffer that can still show typed letters.
type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, hint, className, id, type, inputMode, onInput, ...rest },
  ref
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const wrapped = !!(label || error || hint)
  const isNumber = type === 'number'

  const handleInput: React.InputEventHandler<HTMLInputElement> | undefined = isNumber
    ? (e) => {
        const el = e.currentTarget
        const cleaned = el.value.replace(/[^\d.]/g, '')
        if (el.value !== cleaned) el.value = cleaned
        onInput?.(e)
      }
    : onInput

  const input = (
    <input
      ref={ref}
      id={inputId}
      type={isNumber ? 'text' : type}
      inputMode={isNumber ? 'decimal' : inputMode}
      onInput={handleInput}
      className={cn(styles.input, !wrapped && className)}
      {...rest}
    />
  )

  if (!wrapped) return input

  return (
    <div className={cn(styles.wrapper, { [styles.hasError]: !!error }, className)}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      {input}
      {error && <span className={styles.error}>{error}</span>}
      {!error && hint && <span className={styles.hint}>{hint}</span>}
    </div>
  )
})

export default Input
