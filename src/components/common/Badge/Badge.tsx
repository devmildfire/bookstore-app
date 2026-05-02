import type { ReactNode } from 'react'
import cn from 'classnames'
import styles from './Badge.module.scss'

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info'

type Props = {
  variant?: Variant
  children: ReactNode
  className?: string
}

export default function Badge({ variant = 'default', children, className }: Props) {
  return <span className={cn(styles.badge, styles[variant], className)}>{children}</span>
}
