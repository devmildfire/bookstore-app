'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useToastState } from '@/hooks/useToast'
import type { ToastItem, ToastVariant } from '@/hooks/useToast'
import Toaster from '@/components/common/Toast/Toaster'

type ToastContextValue = {
  toast: (item: Omit<ToastItem, 'id'>) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, addToast, removeToast } = useToastState()

  const toast = (item: Omit<ToastItem, 'id'>) => addToast(item)
  const success = (title: string, description?: string) => addToast({ title, description, variant: 'success' })
  const error = (title: string, description?: string) => addToast({ title, description, variant: 'error' })

  return (
    <ToastContext.Provider value={{ toast, success, error }}>
      {children}
      <Toaster toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export type { ToastVariant }
