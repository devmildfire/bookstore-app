import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// RLS enforcement against the real local Supabase stack (CI). The browser ships
// the anon key, so these policies are the security boundary: catalog is public
// to read but never anon-writable, and user-scoped rows are owner-isolated.
// See AGENTS.md "RLS invariant" + data-architecture audit F1. Skipped w/o stack.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const hasStack = Boolean(url && anonKey && serviceKey)

describe.skipIf(!hasStack)('RLS enforcement', () => {
  let anon: SupabaseClient<Database> // anon key, no session
  let userA: SupabaseClient<Database>
  let userB: SupabaseClient<Database>
  let admin: SupabaseClient<Database>
  let uidA: string
  let uidB: string

  beforeAll(async () => {
    anon = createClient<Database>(url!, anonKey!)
    admin = createClient<Database>(url!, serviceKey!)
    userA = createClient<Database>(url!, anonKey!)
    userB = createClient<Database>(url!, anonKey!)
    uidA = (await userA.auth.signInAnonymously()).data.user!.id
    uidB = (await userB.auth.signInAnonymously()).data.user!.id
  })

  afterAll(async () => {
    for (const uid of [uidA, uidB]) if (uid) await admin.auth.admin.deleteUser(uid)
  })

  it('catalog tables are publicly readable', async () => {
    const { data, error } = await anon.from('Titles').select('id').limit(1)
    expect(error).toBeNull()
    expect((data ?? []).length).toBeGreaterThan(0)
  })

  it('blocks anonymous writes to catalog tables (browser anon key cannot mutate)', async () => {
    const titles = await anon.from('Titles').insert({ name: 'pwned', slug: 'rls-probe-title' })
    expect(titles.error?.code).toBe('42501')
    const authors = await anon.from('Authors').insert({ name: 'pwned' })
    expect(authors.error?.code).toBe('42501')
  })

  it('blocks cart writes without a session (Cart requires auth.uid)', async () => {
    const { error } = await anon.from('Cart').insert({ id: 'EBook-41', name: 'x', price: 1, category: 'EBook' })
    expect(error?.code).toBe('42501')
  })

  it('isolates user-scoped rows to their owner', async () => {
    const { error: insErr } = await userA.from('Cart').insert({ id: 'EBook-41', name: 'x', price: 1, category: 'EBook' })
    expect(insErr).toBeNull()

    // userA sees only their own row; userB sees none of userA's.
    const { data: aCart } = await userA.from('Cart').select('id')
    const { data: bCart } = await userB.from('Cart').select('id')
    expect((aCart ?? []).length).toBe(1)
    expect(bCart ?? []).toEqual([])
  })
})
