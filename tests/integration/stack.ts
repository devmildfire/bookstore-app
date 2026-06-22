import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Shared helpers for integration tests that run against the real local Supabase
// stack (CI only). `hasStack` gates every suite with describe.skipIf so a plain
// `npm test` without the stack stays green.
export const url = process.env.NEXT_PUBLIC_SUPABASE_URL
export const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
export const hasStack = Boolean(url && anonKey && serviceKey)

export type Client = SupabaseClient<Database>

/** Anon key, no session (e.g. catalog read, RLS-denial probes). */
export const anonClient = (): Client => createClient<Database>(url!, anonKey!)

/** Service role — bypasses RLS; used for teardown (deleting test users cascades their rows). */
export const adminClient = (): Client => createClient<Database>(url!, serviceKey!)

/**
 * A fresh anonymous-authed client + its uid (cart/orders/RLS scope to auth.uid).
 * Delete the uid via `adminClient()` in afterAll — the FK cascade wipes its rows.
 */
export async function signInAnon(): Promise<{ client: Client; uid: string }> {
  const client = anonClient()
  const { data, error } = await client.auth.signInAnonymously()
  if (error) throw error
  return { client, uid: data.user!.id }
}
