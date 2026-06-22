import { describe, it, expect } from 'vitest'
import { paymentStatusLabel, fulfillmentLabel, libraryShippingLabel, itemLink, formatOrderDate } from './orderDisplay'
import type { OrderItem } from '@/entities/order/client'

const item = (over: Partial<OrderItem>): OrderItem => ({
  id: 1,
  bookId: 'PrintBook-1',
  name: 'Книга',
  price: 1000,
  quantity: 1,
  category: 'PrintBook',
  boxSetName: null,
  coverUrl: null,
  titleSlug: 'murlo',
  ...over,
})

describe('paymentStatusLabel', () => {
  it('maps each order status to Russian', () => {
    expect(paymentStatusLabel('paid')).toBe('Оплачен')
    expect(paymentStatusLabel('pending')).toBe('Ожидает оплаты')
    expect(paymentStatusLabel('failed')).toBe('Ошибка оплаты')
    expect(paymentStatusLabel('cancelled')).toBe('Отменён')
  })
})

describe('fulfillmentLabel', () => {
  it('maps each fulfillment state to Russian', () => {
    expect(fulfillmentLabel('processing')).toBe('В обработке')
    expect(fulfillmentLabel('shipped')).toBe('В пути')
    expect(fulfillmentLabel('delivered')).toBe('Доставлен')
    expect(fulfillmentLabel('completed')).toBe('Выполнен')
  })
})

describe('libraryShippingLabel', () => {
  it('uses card-edition nouns for Book2.0', () => {
    expect(libraryShippingLabel('shipped', 'Book2.0')).toBe('Карточное издание в пути')
    expect(libraryShippingLabel('delivered', 'Book2.0')).toBe('Карточное издание доставлено')
  })

  it('uses printed-copy nouns for PrintBook', () => {
    expect(libraryShippingLabel('processing', 'PrintBook')).toBe('Печатный экземпляр готовится к отправке')
    expect(libraryShippingLabel('completed', 'PrintBook')).toBe('Печатный экземпляр доставлен')
  })
})

describe('itemLink', () => {
  it('links books and box-sets to the book page (or null without a slug)', () => {
    expect(itemLink(item({ category: 'PrintBook', titleSlug: 'murlo' }))).toBe('/books/murlo')
    expect(itemLink(item({ category: 'BoxSet', titleSlug: 'set-1' }))).toBe('/books/set-1')
    expect(itemLink(item({ category: 'EBook', titleSlug: null }))).toBeNull()
  })

  it('links gift cards and subscriptions to their cabinet sections', () => {
    expect(itemLink(item({ category: 'GiftCard' }))).toBe('/profile/gift-cards')
    expect(itemLink(item({ category: 'Subscription' }))).toBe('/profile/subscriptions')
  })

  it('links a known course to its page, else null', () => {
    expect(itemLink(item({ category: 'Course', bookId: 'Course-abzac-masterclass' }))).toBe('/abzac')
    expect(itemLink(item({ category: 'Course', bookId: 'Course-unknown' }))).toBeNull()
  })
})

describe('formatOrderDate', () => {
  it('formats an ISO date in Russian long form', () => {
    expect(formatOrderDate('2026-06-22T00:00:00Z')).toMatch(/2026/)
  })
})
