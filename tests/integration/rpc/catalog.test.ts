import { describe, it, expect, beforeAll } from 'vitest'
import { hasStack, anonClient, type Client } from '../stack'

// Runs against the real local Supabase stack (CI). See docs/testing/STRATEGY.md §5.
describe.skipIf(!hasStack)('get_catalog_books (anon role)', () => {
  // Created in beforeAll so a skipped suite never builds a client (the describe
  // factory still runs at collection time).
  let supabase: Client
  beforeAll(() => {
    supabase = anonClient()
  })

  it('returns a non-empty page of catalog books for the seeded DB', async () => {
    const { data, error } = await supabase.rpc('get_catalog_books', {
      result_limit: 5,
      result_offset: 0,
      product_type_filters: [],
      author_names_filter: [],
      year_filters: [],
    })

    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
    expect((data ?? []).length).toBeGreaterThan(0)
  })

  it('respects result_limit', async () => {
    const { data, error } = await supabase.rpc('get_catalog_books', {
      result_limit: 2,
      result_offset: 0,
      product_type_filters: [],
      author_names_filter: [],
      year_filters: [],
    })

    expect(error).toBeNull()
    expect((data ?? []).length).toBeLessThanOrEqual(2)
  })
})
