import { createClient } from '@/lib/supabase/server'

// The signed-in user's recurring subscriptions (RLS scopes to owner), joined
// with the plan they're for. Used by the /profile/subscriptions cabinet.

export type UserSubscription = {
  id: number
  status: string
  amount: number
  nextChargeAt: string
  currentPeriodStart: string
  planName: string
  planSlug: string
}

export async function getUserSubscriptionsServer(): Promise<UserSubscription[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('UserSubscriptions')
    .select('id, status, amount, next_charge_at, current_period_start, Subscriptions!inner(name, slug)')
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map((row) => {
    const plan = Array.isArray(row.Subscriptions) ? row.Subscriptions[0] : row.Subscriptions
    return {
      id: row.id,
      status: row.status,
      amount: row.amount,
      nextChargeAt: row.next_charge_at,
      currentPeriodStart: row.current_period_start,
      planName: plan?.name ?? 'Подписка',
      planSlug: plan?.slug ?? '',
    }
  })
}
