import { describe, it, expect } from 'vitest'
import { DIGITAL_CATEGORIES, isSinglePurchaseCategory } from './products'

describe('DIGITAL_CATEGORIES', () => {
  it('contains only the file-based editions (Book2.0 is physical)', () => {
    expect(DIGITAL_CATEGORIES.has('EBook')).toBe(true)
    expect(DIGITAL_CATEGORIES.has('AudioBook')).toBe(true)
    expect(DIGITAL_CATEGORIES.has('Book2.0')).toBe(false)
    expect(DIGITAL_CATEGORIES.has('PrintBook')).toBe(false)
  })
})

describe('isSinglePurchaseCategory', () => {
  it('is true for digital files, subscriptions and courses', () => {
    expect(isSinglePurchaseCategory('EBook')).toBe(true)
    expect(isSinglePurchaseCategory('AudioBook')).toBe(true)
    expect(isSinglePurchaseCategory('Subscription')).toBe(true)
    expect(isSinglePurchaseCategory('Course')).toBe(true)
  })

  it('is false for physical / multi-quantity products', () => {
    expect(isSinglePurchaseCategory('PrintBook')).toBe(false)
    expect(isSinglePurchaseCategory('Book2.0')).toBe(false)
    expect(isSinglePurchaseCategory('GiftCard')).toBe(false)
    expect(isSinglePurchaseCategory('BoxSet')).toBe(false)
  })
})
