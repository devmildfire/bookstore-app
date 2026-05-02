import cn from 'classnames'
import styles from './Skeleton.module.scss'

type Props = {
  width?: string | number
  height?: string | number
  rounded?: boolean
  className?: string
}

export default function Skeleton({ width, height, rounded = false, className }: Props) {
  return (
    <span
      className={cn(styles.skeleton, { [styles.rounded]: rounded }, className)}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      aria-hidden
    />
  )
}
