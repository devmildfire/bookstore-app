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

// Book editions that carry their own downloadable digital file: the pure-digital
// EBook/AudioBook, plus the card book (Book2.0 — a physical USB/key-card whose
// media IS a digital edition). A PrintBook has no own file but is gifted one.
export const DOWNLOADABLE_BOOK_CATEGORIES = new Set<ProductCategory>([
  'EBook',
  'AudioBook',
  'Book2.0',
])
// Physical book editions that ship to the buyer (and thus have a shipping
// state): the printed copy and the card book. A card book ALSO downloads.
export const SHIPPED_BOOK_CATEGORIES = new Set<ProductCategory>(['PrintBook', 'Book2.0'])
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

// Friendlier, book-centric phrasing for the «Мои книги» library, where a
// physical copy's shipping state is shown alongside the digital download. The
// noun matches the edition: a printed copy vs a card book (USB/key-card).
export function libraryShippingLabel(f: FulfillmentStatus, category: ProductCategory): string {
  const isCard = category === 'Book2.0'
  const noun = isCard ? 'Карточное издание' : 'Печатный экземпляр'
  switch (f) {
    case 'processing':
      return `${noun} готовится к отправке`
    case 'shipped':
      return `${noun} в пути`
    case 'delivered':
    case 'completed':
      return isCard ? 'Карточное издание доставлено' : 'Печатный экземпляр доставлен'
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
