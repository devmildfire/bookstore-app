import { describe, it, expect, beforeAll } from 'vitest'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Integration tests run against the real local Supabase stack (CI: `supabase start`,
// keys exported into the env). Skipped when the stack env is absent, so a plain
// `npm test` / local run stays green without Docker. See docs/testing/STRATEGY.md §5.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const hasStack = Boolean(url && anonKey)

describe.skipIf(!hasStack)('get_catalog_books (anon role)', () => {
  // Created in beforeAll so a skipped suite never constructs a client with
  // undefined env (the describe factory still runs at collection time).
  let supabase: SupabaseClient<Database>
  beforeAll(() => {
    supabase = createClient<Database>(url!, anonKey!)
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
