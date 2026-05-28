'use client'

import cn from 'classnames'
import type { ReactNode } from 'react'
import styles from './Marquee.module.scss'

type Props = {
  children: ReactNode
  speed?: number
  className?: string
  itemClassName?: string
  ariaLabel?: string
  reverse?: boolean
}

export default function Marquee({ children, speed = 60, className, itemClassName, ariaLabel, reverse = false }: Props) {
  return (
    <div className={cn(styles.viewport, className)} role='region' aria-label={ariaLabel}>
      <div
        className={cn(styles.track, reverse && styles.reverse)}
        style={{ '--marquee-duration': `${speed}s` } as React.CSSProperties}
      >
        <div className={cn(styles.row, itemClassName)} aria-hidden={false}>
          {children}
        </div>
        <div className={cn(styles.row, itemClassName)} aria-hidden={true}>
          {children}
        </div>
      </div>
    </div>
  )
}
