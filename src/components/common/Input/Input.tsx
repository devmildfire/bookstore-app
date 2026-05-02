'use client'

import { forwardRef, useId } from 'react'
import cn from 'classnames'
import styles from './Input.module.scss'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, hint, className, id, ...props },
  ref
) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={cn(styles.wrapper, { [styles.hasError]: !!error }, className)}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <input ref={ref} id={inputId} className={styles.input} {...props} />
      {error && <span className={styles.error}>{error}</span>}
      {!error && hint && <span className={styles.hint}>{hint}</span>}
    </div>
  )
})

export default Input
