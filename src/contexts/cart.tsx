'use client'

import { createContext, useContext, useCallback, useMemo, useState, type ReactNode } from 'react'
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
import { boxSetPhysicalFlagsQueryKey, getBoxSetPhysicalFlags } from '@/api/orders'
import { getUserGiftCards, userGiftCardsQueryKey } from '@/api/giftCards/getUserGiftCards'
import { calculateCartTotals } from '@/lib/cartTotals'
import type { CartItem, CartState } from '@/entities/cart/client'
import type { AddToCartInput } from '@/entities/cart/validation'
import type { AppliedPromo } from '@/entities/promo/client'
import type { GiftCard } from '@/entities/giftCard/client'

// Physical-on-its-face categories — no per-item lookup needed.
const ALWAYS_PHYSICAL = new Set<string>(['PrintBook', 'Book2.0'])

export type SelectedGiftCardPayment = {
  id: string
  amount: number
}

type CartContextValue = CartState & {
  addItem: (item: AddToCartInput, quantity?: number) => void
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
  giftCardEligibleTotal: number
  // Gift cards — selection lives in the cart so it survives navigation
  // from /cart → /checkout and feeds straight into place_order.
  availableGiftCards: GiftCard[]
  selectedGiftCardIds: ReadonlySet<string>
  toggleGiftCard: (cardId: string) => void
  clearGiftCardSelection: () => void
  giftCardPayments: SelectedGiftCardPayment[]
  giftCardAppliedTotal: number
  amountDue: number
  // Checkout helpers
  hasPhysicalItems: boolean
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

  // User's gift-card wallet — used by the cart-page picker. Empty for users
  // with no purchased/claimed cards; tiny payload either way.
  const { data: userGiftCardsData } = useQuery({
    queryKey: userGiftCardsQueryKey,
    queryFn: getUserGiftCards,
  })
  const userGiftCards = useMemo<GiftCard[]>(() => userGiftCardsData ?? [], [userGiftCardsData])

  const [selectedGiftCardIds, setSelectedGiftCardIds] = useState<ReadonlySet<string>>(() => new Set())

  // Only fetch title-id mapping when a title-target item code is applied —
  // otherwise we never need it.
  const needsTitleIds = appliedPromo?.kind === 'item' && appliedPromo.targetTitleId != null

  const { data: cartTitleIds = [] } = useQuery({
    queryKey: cartTitleIdsQueryKey,
    queryFn: getCartWithTitleIds,
    enabled: needsTitleIds,
  })

  // BoxSet physicality — only fetch when the cart actually has BoxSet items.
  const boxSetIds = useMemo(() => {
    const ids: number[] = []
    for (const item of items) {
      if (item.category === 'BoxSet') {
        const editionId = Number(item.id.split('-').slice(1).join('-'))
        if (Number.isFinite(editionId)) ids.push(editionId)
      }
    }
    return ids
  }, [items])

  const { data: boxSetFlags } = useQuery({
    queryKey: boxSetPhysicalFlagsQueryKey(boxSetIds),
    queryFn: () => getBoxSetPhysicalFlags(boxSetIds),
    enabled: boxSetIds.length > 0,
  })

  const addMutation = useMutation({
    mutationFn: ({ item, quantity }: { item: AddToCartInput; quantity: number }) =>
      addToCart(item, quantity),
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
    (item: AddToCartInput, quantity = 1) => addMutation.mutate({ item, quantity }),
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

  // Only `active` cards with balance > 0 can pay; cards already pending/depleted
  // are filtered out so the UI never offers them.
  const availableGiftCards = useMemo(
    () => userGiftCards.filter((card) => card.status === 'active' && card.balance > 0),
    [userGiftCards]
  )

  // Largest-balance-first so a single selected card consumes as much of the
  // eligible total as possible; mirrors the previous picker behaviour.
  const giftCardPayments = useMemo<SelectedGiftCardPayment[]>(() => {
    const eligible = Math.min(totals.giftCardEligibleTotal, totals.total)
    if (eligible <= 0) return []

    const selected = availableGiftCards
      .filter((card) => selectedGiftCardIds.has(card.id))
      .sort((a, b) => b.balance - a.balance)

    let remaining = eligible
    const payments: SelectedGiftCardPayment[] = []
    for (const card of selected) {
      if (remaining <= 0) break
      const amount = Math.min(card.balance, remaining)
      if (amount > 0) {
        payments.push({ id: card.id, amount })
        remaining -= amount
      }
    }
    return payments
  }, [availableGiftCards, selectedGiftCardIds, totals.giftCardEligibleTotal, totals.total])

  const giftCardAppliedTotal = giftCardPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const amountDue = Math.max(0, totals.total - giftCardAppliedTotal)

  const toggleGiftCard = useCallback((cardId: string) => {
    setSelectedGiftCardIds((current) => {
      const next = new Set(current)
      if (next.has(cardId)) next.delete(cardId)
      else next.add(cardId)
      return next
    })
  }, [])

  const clearGiftCardSelection = useCallback(() => {
    setSelectedGiftCardIds(new Set())
  }, [])

  const hasPhysicalItems = useMemo(() => {
    for (const item of items) {
      if (ALWAYS_PHYSICAL.has(item.category)) return true
      if (item.category === 'BoxSet') {
        const editionId = Number(item.id.split('-').slice(1).join('-'))
        if (boxSetFlags?.get(editionId)) return true
      }
    }
    return false
  }, [items, boxSetFlags])

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
        giftCardEligibleTotal: totals.giftCardEligibleTotal,
        availableGiftCards,
        selectedGiftCardIds,
        toggleGiftCard,
        clearGiftCardSelection,
        giftCardPayments,
        giftCardAppliedTotal,
        amountDue,
        hasPhysicalItems,
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
