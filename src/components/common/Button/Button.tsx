'use client'

import { forwardRef } from 'react'
import cn from 'classnames'
import Spinner from '@/components/common/Spinner'
import styles from './Button.module.scss'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, children, className, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(styles.button, styles[variant], styles[size], { [styles.loading]: loading }, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size='sm' className={styles.buttonSpinner} />}
      {children}
    </button>
  )
})

export default Button
