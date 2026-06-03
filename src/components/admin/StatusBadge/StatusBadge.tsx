import cn from 'classnames'
import styles from './StatusBadge.module.scss'

export type BadgeTone = 'neutral' | 'positive' | 'warning' | 'danger' | 'accent'

type Props = {
  children: React.ReactNode
  tone?: BadgeTone
  className?: string
}

export default function StatusBadge({ children, tone = 'neutral', className }: Props) {
  return <span className={cn(styles.badge, styles[tone], className)}>{children}</span>
}
