import { describe, it, expect } from 'vitest'
import { formatPrice, formatProductPrice } from './formatPrice'

// ru-RU groups thousands with a non-breaking space (U+00A0) and we glue the ₽
// straight onto the digits (no separating space) — see formatPrice.ts.
describe('formatPrice', () => {
  it('formats small amounts with no grouping', () => {
    expect(formatPrice(0)).toBe('0₽')
    expect(formatPrice(99)).toBe('99₽')
  })

  it('groups thousands with a non-breaking space', () => {
    expect(formatPrice(1234)).toBe('1 234₽')
    expect(formatPrice(1000000)).toBe('1 000 000₽')
  })

  it('rounds to whole rubles', () => {
    expect(formatPrice(1250.5)).toBe('1 251₽')
    expect(formatPrice(0.4)).toBe('0₽')
  })

  it('passes negatives through (caller is responsible for sign semantics)', () => {
    expect(formatPrice(-5)).toBe('-5₽')
  })
})

describe('formatProductPrice', () => {
  it('renders "Бесценно" for free/zero/negative product prices', () => {
    expect(formatProductPrice(0)).toBe('Бесценно')
    expect(formatProductPrice(-100)).toBe('Бесценно')
  })

  it('formats positive prices like formatPrice', () => {
    expect(formatProductPrice(1234)).toBe('1 234₽')
  })
})
