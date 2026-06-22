'use client'

import { useState, useCallback } from 'react'

export type ToastVariant = 'default' | 'success' | 'error'

export type ToastAction = 'cart'

export type ToastItem = {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
  action?: ToastAction
}

export type ToastState = {
  toasts: ToastItem[]
  addToast: (toast: Omit<ToastItem, 'id'>) => void
  removeToast: (id: string) => void
}

export function useToastState(): ToastState {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { ...toast, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}
