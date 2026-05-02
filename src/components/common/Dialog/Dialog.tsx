'use client'

import type { ReactNode } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import styles from './Dialog.module.scss'

type Props = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: ReactNode
  title: string
  description?: string
  children: ReactNode
}

export default function Dialog({ open, onOpenChange, trigger, title, description, children }: Props) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={styles.overlay} />
        <DialogPrimitive.Content className={styles.content}>
          <DialogPrimitive.Title className={styles.title}>{title}</DialogPrimitive.Title>
          {description && (
            <DialogPrimitive.Description className={styles.description}>{description}</DialogPrimitive.Description>
          )}
          {children}
          <DialogPrimitive.Close className={styles.closeButton} aria-label='Закрыть'>
            <svg width='14' height='14' viewBox='0 0 14 14' fill='none' aria-hidden>
              <path d='M1 1L13 13M13 1L1 13' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
            </svg>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
