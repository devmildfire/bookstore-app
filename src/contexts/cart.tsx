'use client'

import { createContext, useContext, useCallback, useMemo, type ReactNode } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { getCart, cartQueryKey, addToCart, removeFromCart, updateCartQuantity, clearCart } from '@/api/cart'
import {
  activePromoQueryKey,
  applyPromoCode,
  cartTitleIdsQueryKey,
  getActivePromo,
  getCartWithTitleIds,
  removePromoCode,
  type ApplyPromoResult,
} from '@/api/promo'
import { calculateCartTotals } from '@/lib/cartTotals'
import type { CartItem, CartState } from '@/entities/cart/client'
import type { AddToCartInput } from '@/entities/cart/validation'
import type { AppliedPromo } from '@/entities/promo/client'

type CartContextValue = CartState & {
  addItem: (item: AddToCartInput) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearItems: () => void
  isPending: boolean
  // Promo
  appliedPromo: AppliedPromo | null
  applyPromo: (code: string) => Promise<ApplyPromoResult>
  removePromo: () => void
  discountAmount: number
  finalTotal: number
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

  const { data: appliedPromo = null } = useQuery({
    queryKey: activePromoQueryKey,
    queryFn: getActivePromo,
  })

  // Only fetch title-id mapping when a title-target item code is applied —
  // otherwise we never need it.
  const needsTitleIds = appliedPromo?.kind === 'item' && appliedPromo.targetTitleId != null

  const { data: cartTitleIds = [] } = useQuery({
    queryKey: cartTitleIdsQueryKey,
    queryFn: getCartWithTitleIds,
    enabled: needsTitleIds,
  })

  const addMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey })
      queryClient.invalidateQueries({ queryKey: cartTitleIdsQueryKey })
    },
  })

  const removeMutation = useMutation({
    mutationFn: removeFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey })
      queryClient.invalidateQueries({ queryKey: cartTitleIdsQueryKey })
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
      queryClient.invalidateQueries({ queryKey: cartTitleIdsQueryKey })
    },
  })

  const applyPromoMutation = useMutation({
    mutationFn: applyPromoCode,
    onSuccess: (result) => {
      if (result.status === 'ok') {
        queryClient.invalidateQueries({ queryKey: activePromoQueryKey })
        queryClient.invalidateQueries({ queryKey: cartTitleIdsQueryKey })
      }
    },
  })

  const removePromoMutation = useMutation({
    mutationFn: removePromoCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activePromoQueryKey })
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

  const applyPromo = useCallback(
    (code: string) => applyPromoMutation.mutateAsync(code),
    [applyPromoMutation]
  )

  const removePromo = useCallback(
    () => removePromoMutation.mutate(),
    [removePromoMutation]
  )

  const state = calculateState(items)

  const matchedCartIds = useMemo(() => {
    if (!needsTitleIds || appliedPromo?.targetTitleId == null) return new Set<string>()
    const targetTitle = appliedPromo.targetTitleId
    return new Set(cartTitleIds.filter((r) => r.titleId === targetTitle).map((r) => r.cartId))
  }, [needsTitleIds, appliedPromo, cartTitleIds])

  const totals = useMemo(
    () => calculateCartTotals(items, appliedPromo, matchedCartIds),
    [items, appliedPromo, matchedCartIds]
  )

  const isPending =
    addMutation.isPending ||
    removeMutation.isPending ||
    updateMutation.isPending ||
    clearMutation.isPending ||
    applyPromoMutation.isPending ||
    removePromoMutation.isPending

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity: updateQuantityFn,
        clearItems,
        isPending,
        appliedPromo,
        applyPromo,
        removePromo,
        discountAmount: totals.discountAmount,
        finalTotal: totals.total,
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
