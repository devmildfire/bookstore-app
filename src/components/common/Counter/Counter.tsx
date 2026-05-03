'use client'

import { memo } from 'react'
import cn from 'classnames'
import styles from './Counter.module.scss'

export type CounterProps = {
  className?: string
  value: number
  onIncrement: () => void
  onDecrement: () => void
}

const Counter = memo(function Counter({
  className,
  value,
  onIncrement,
  onDecrement,
}: CounterProps) {
  return (
    <div className={cn(styles.wrapper, className)}>
      <button
        type="button"
        className={styles.button}
        onClick={onDecrement}
        aria-label="Уменьшить количество"
      >
        −
      </button>
      <div className={styles.value}>{value}</div>
      <button
        type="button"
        className={styles.button}
        onClick={onIncrement}
        aria-label="Увеличить количество"
      >
        +
      </button>
    </div>
  )
})

export default Counter
