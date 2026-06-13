'use client'

import { forwardRef, useId } from 'react'
import cn from 'classnames'
import styles from './Textarea.module.scss'

// The one multiline field for the whole app (storefront + admin). Forwards a ref
// and every native <textarea> attribute. Same two-mode ergonomics as Input:
// bare (no label/error/hint) renders just the <textarea>; otherwise the labelled
// field block.
type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
  hint?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  { label, error, hint, className, id, ...rest },
  ref
) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const wrapped = !!(label || error || hint)

  const textarea = (
    <textarea
      ref={ref}
      id={textareaId}
      className={cn(styles.textarea, !wrapped && className)}
      {...rest}
    />
  )

  if (!wrapped) return textarea

  return (
    <div className={cn(styles.wrapper, { [styles.hasError]: !!error }, className)}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
        </label>
      )}
      {textarea}
      {error && <span className={styles.error}>{error}</span>}
      {!error && hint && <span className={styles.hint}>{hint}</span>}
    </div>
  )
})

export default Textarea
