'use client'

import { forwardRef, useId } from 'react'
import cn from 'classnames'
import styles from './Textarea.module.scss'

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
  hint?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  { label, error, hint, className, id, ...props },
  ref
) {
  const generatedId = useId()
  const textareaId = id ?? generatedId

  return (
    <div className={cn(styles.wrapper, { [styles.hasError]: !!error }, className)}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
        </label>
      )}
      <textarea ref={ref} id={textareaId} className={styles.textarea} {...props} />
      {error && <span className={styles.error}>{error}</span>}
      {!error && hint && <span className={styles.hint}>{hint}</span>}
    </div>
  )
})

export default Textarea
