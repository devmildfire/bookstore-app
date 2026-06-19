'use client'

import { createContext, useContext, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { useToastState } from '@/hooks/useToast'
import type { ToastItem, ToastVariant } from '@/hooks/useToast'

// The Radix toast machinery (@radix-ui/react-toast + shared dismissable-layer/portal) is ~5 KB gz
// of JS that, on a no-interaction page view, never runs — yet it used to hydrate eagerly in the
// global provider (Chrome Coverage: loaded, ~0% executed). Mount it lazily on the first toast.
const Toaster = dynamic(() => import('@/components/common/Toast/Toaster'), { ssr: false })

type ToastContextValue = {
  toast: (item: Omit<ToastItem, 'id'>) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  cartSuccess: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, addToast, removeToast } = useToastState()

  const toast = (item: Omit<ToastItem, 'id'>) => addToast(item)
  const success = (title: string, description?: string) => addToast({ title, description, variant: 'success' })
  const error = (title: string, description?: string) => addToast({ title, description, variant: 'error' })
  const cartSuccess = (title: string, description?: string) =>
    addToast({ title, description, variant: 'success', action: 'cart' })

  return (
    <ToastContext.Provider value={{ toast, success, error, cartSuccess }}>
      {children}
      {toasts.length > 0 && <Toaster toasts={toasts} onRemove={removeToast} />}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export type { ToastVariant }
