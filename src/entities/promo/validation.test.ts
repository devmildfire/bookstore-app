import { describe, it, expect } from 'vitest'
import { promoCodeInputSchema } from './validation'

describe('promoCodeInputSchema', () => {
  it('trims and upper-cases valid codes', () => {
    expect(promoCodeInputSchema.parse('  summer25 ')).toBe('SUMMER25')
    expect(promoCodeInputSchema.parse('white30')).toBe('WHITE30')
  })

  it('rejects an empty / whitespace-only code', () => {
    expect(promoCodeInputSchema.safeParse('').success).toBe(false)
    expect(promoCodeInputSchema.safeParse('   ').success).toBe(false)
  })

  it('rejects a code longer than 64 chars', () => {
    expect(promoCodeInputSchema.safeParse('A'.repeat(65)).success).toBe(false)
    expect(promoCodeInputSchema.safeParse('A'.repeat(64)).success).toBe(true)
  })
})
