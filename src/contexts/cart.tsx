'use client'

import { createContext, useContext, useCallback, type ReactNode } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { getCart, cartQueryKey, addToCart, removeFromCart, updateCartQuantity, clearCart } from '@/api/cart'
import type { CartItem, CartState } from '@/entities/cart/client'
import type { AddToCartInput } from '@/entities/cart/validation'

type CartContextValue = CartState & {
  addItem: (item: AddToCartInput) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearItems: () => void
  isPending: boolean
}

const CartContext = createContext<CartContextValue | null>(null)

function calculateState(items: CartItem[]): CartState {
  return {
    items,
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  }
}

type Props = {
  children: ReactNode
}

export function CartProvider({ children }: Props) {
  const queryClient = useQueryClient()

  const { data: items = [] } = useQuery({
    queryKey: cartQueryKey,
    queryFn: getCart,
  })

  const addMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey })
    },
  })

  const removeMutation = useMutation({
    mutationFn: removeFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      updateCartQuantity(id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey })
    },
  })

  const clearMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey })
    },
  })

  const addItem = useCallback(
    (item: AddToCartInput) => addMutation.mutate(item),
    [addMutation]
  )

  const removeItem = useCallback(
    (id: string) => removeMutation.mutate(id),
    [removeMutation]
  )

  const updateQuantityFn = useCallback(
    (id: string, quantity: number) => updateMutation.mutate({ id, quantity }),
    [updateMutation]
  )

  const clearItems = useCallback(
    () => clearMutation.mutate(),
    [clearMutation]
  )

  const state = calculateState(items)
  const isPending =
    addMutation.isPending ||
    removeMutation.isPending ||
    updateMutation.isPending ||
    clearMutation.isPending

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity: updateQuantityFn,
        clearItems,
        isPending,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
