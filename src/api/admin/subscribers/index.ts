import { createAdminClient } from '@/lib/supabase/server'

export type SubscriberStatus = 'pending' | 'active' | 'unsubscribed'

export type AdminSubscriber = {
  id: string
  email: string
  status: SubscriberStatus
  source: string | null
  createdAt: string
  confirmedAt: string | null
}

type SubscriberRow = {
  id: string
  email: string
  status: SubscriberStatus
  source: string | null
  created_at: string
  confirmed_at: string | null
}

// Read-only subscriber list for the admin panel. The Subscribers table is not in
// the generated Supabase types (kept out on purpose — RLS-locked, accessed via
// SECURITY DEFINER functions), so the table name is supplied via the same
// dynamic-`from` cast pattern used in getOrders, and rows are cast explicitly.
export async function getAdminSubscribers(): Promise<AdminSubscriber[]> {
  const admin = createAdminClient()
  const { data, error } = await (admin.from as unknown as (t: string) => ReturnType<typeof admin.from>)(
    'Subscribers'
  )
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Не удалось загрузить подписчиков: ${error.message}`)

  return ((data ?? []) as unknown as SubscriberRow[]).map((r) => ({
    id: r.id,
    email: r.email,
    status: r.status,
    source: r.source,
    createdAt: r.created_at,
    confirmedAt: r.confirmed_at,
  }))
}
