'use client'

import * as ToastPrimitive from '@radix-ui/react-toast'
import Link from 'next/link'
import cn from 'classnames'
import type { ToastItem } from '@/hooks/useToast'
import CartIconBadge from '@/components/common/CartIconBadge'
import styles from './Toast.module.scss'

type Props = {
  toasts: ToastItem[]
  onRemove: (id: string) => void
}

export default function Toaster({ toasts, onRemove }: Props) {
  return (
    <ToastPrimitive.Provider swipeDirection='right'>
      {toasts.map((toast) => (
        <ToastPrimitive.Root
          key={toast.id}
          open
          onOpenChange={(open) => {
            if (!open) onRemove(toast.id)
          }}
          className={cn(styles.toast, toast.variant && styles[toast.variant])}
          duration={4000}
        >
          <div className={styles.body}>
            <ToastPrimitive.Title className={styles.title}>{toast.title}</ToastPrimitive.Title>
            {toast.description && (
              <ToastPrimitive.Description className={styles.description}>{toast.description}</ToastPrimitive.Description>
            )}
          </div>

          {toast.action === 'cart' && (
            <ToastPrimitive.Action altText='Перейти в корзину' asChild>
              <Link
                href='/cart'
                className={styles.cartAction}
                aria-label='Перейти в корзину'
                onClick={() => onRemove(toast.id)}
              >
                <CartIconBadge variant='toast' />
              </Link>
            </ToastPrimitive.Action>
          )}

          <ToastPrimitive.Close className={styles.close} aria-label='Закрыть'>
            <svg width='12' height='12' viewBox='0 0 12 12' fill='none' aria-hidden>
              <path d='M1 1L11 11M11 1L1 11' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
            </svg>
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className={styles.viewport} />
    </ToastPrimitive.Provider>
  )
}
