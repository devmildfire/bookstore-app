import cn from 'classnames'
import styles from './Skeleton.module.scss'

type Variant = 'text' | 'rect' | 'circle'

type Props = {
  width?: string | number
  height?: string | number
  variant?: Variant
  className?: string
}

export default function Skeleton({ width, height, variant = 'text', className }: Props) {
  return (
    <span
      className={cn(styles.skeleton, styles[variant], className)}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      aria-hidden
    />
  )
}
