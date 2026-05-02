'use client'

import type { ReactNode } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import styles from './Popover.module.scss'

type Props = {
  trigger: ReactNode
  children: ReactNode
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function Popover({ trigger, children, align = 'start', side = 'bottom', open, onOpenChange }: Props) {
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content className={styles.content} align={align} side={side} sideOffset={6}>
          {children}
          <PopoverPrimitive.Arrow className={styles.arrow} />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
