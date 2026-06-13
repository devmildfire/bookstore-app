import type { ReactNode } from 'react'
import cn from 'classnames'
import styles from './Badge.module.scss'

// The one badge for the whole app (storefront + admin). A small uppercase pill
// with a leading tone dot. Pick the colour with `tone`.
export type BadgeTone = 'neutral' | 'positive' | 'warning' | 'danger' | 'accent'

type Props = {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}

export default function Badge({ children, tone = 'neutral', className }: Props) {
  return <span className={cn(styles.badge, styles[tone], className)}>{children}</span>
}
