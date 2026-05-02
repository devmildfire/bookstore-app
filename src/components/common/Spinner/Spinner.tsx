import cn from 'classnames'
import styles from './Spinner.module.scss'

type Props = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Spinner({ size = 'md', className }: Props) {
  return (
    <span
      className={cn(styles.spinner, styles[size], className)}
      role='status'
      aria-label='Загрузка'
    />
  )
}
