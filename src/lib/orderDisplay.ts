import type { ProductCategory } from '@/types/database'
import type { FulfillmentStatus, OrderItem, OrderStatus } from '@/entities/order/client'

// Shared labels + helpers for the profile order/library views.

export const CATEGORY_LABEL: Partial<Record<ProductCategory, string>> = {
  EBook: 'Электронная книга',
  AudioBook: 'Аудиокнига',
  'Book2.0': 'Карточная книга',
  PrintBook: 'Печатная книга',
  BoxSet: 'Бокс-сет',
  GiftCard: 'Подарочная карта',
  Subscription: 'Подписка',
  Course: 'Курс',
}

// In-app readable/downloadable editions.
export const DIGITAL_CATEGORIES = new Set<ProductCategory>(['EBook', 'AudioBook', 'Book2.0'])
// Everything that counts as a "book" for the «Мои книги» library (incl. physical).
export const BOOK_CATEGORIES = new Set<ProductCategory>([
  'EBook',
  'AudioBook',
  'Book2.0',
  'PrintBook',
])

// Course product id → its page. Only the single Абзац course exists today.
const COURSE_LINKS: Record<string, string> = {
  'Course-abzac-masterclass': '/abzac',
}

export function formatOrderDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export function paymentStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'paid':
      return 'Оплачен'
    case 'pending':
      return 'Ожидает оплаты'
    case 'failed':
      return 'Ошибка оплаты'
    case 'cancelled':
      return 'Отменён'
  }
}

export function fulfillmentLabel(f: FulfillmentStatus): string {
  switch (f) {
    case 'processing':
      return 'В обработке'
    case 'shipped':
      return 'В пути'
    case 'delivered':
      return 'Доставлен'
    case 'completed':
      return 'Выполнен'
  }
}

// Where an order line links to — its product in the relevant section.
export function itemLink(item: OrderItem): string | null {
  if (BOOK_CATEGORIES.has(item.category) || item.category === 'BoxSet') {
    return item.titleSlug ? `/books/${item.titleSlug}` : null
  }
  if (item.category === 'Course') return COURSE_LINKS[item.bookId] ?? null
  if (item.category === 'GiftCard') return '/profile/gift-cards'
  if (item.category === 'Subscription') return '/profile/subscriptions'
  return null
}
