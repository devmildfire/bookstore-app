import { describe, it, expect } from 'vitest'
import { addToCartSchema } from './validation'

const valid = {
  id: 'PrintBook-1',
  name: 'Мурло',
  price: 1000,
  category: 'PrintBook' as const,
}

describe('addToCartSchema', () => {
  it('accepts a minimal valid item', () => {
    expect(addToCartSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts optional nullable fields', () => {
    const result = addToCartSchema.safeParse({
      ...valid,
      subtitle: null,
      picture: null,
      discount: 10,
    })
    expect(result.success).toBe(true)
  })

  it('rejects an empty id or name', () => {
    expect(addToCartSchema.safeParse({ ...valid, id: '' }).success).toBe(false)
    expect(addToCartSchema.safeParse({ ...valid, name: '' }).success).toBe(false)
  })

  it('rejects a negative price', () => {
    expect(addToCartSchema.safeParse({ ...valid, price: -1 }).success).toBe(false)
  })

  it('rejects an unknown category', () => {
    expect(addToCartSchema.safeParse({ ...valid, category: 'Magazine' }).success).toBe(false)
  })
})
