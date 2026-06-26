'use client'

import { createContext, useContext } from 'react'
import type { CartItem } from '@/entities/cart/client'
import type { CartQuote } from '@/api/cart/quoteCart'

type CartInit = {
  items: CartItem[]
  quote: CartQuote | null
}

const CartInitialData = createContext<CartInit>({ items: [], quote: null })

export function CartInitialDataProvider({ children, items, quote }: { children: React.ReactNode } & CartInit) {
  return <CartInitialData.Provider value={{ items, quote }}>{children}</CartInitialData.Provider>
}

export function useCartInitialData() {
  return useContext(CartInitialData)
}
