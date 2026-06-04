import { createAdminClient } from '@/lib/supabase/server'
import { getStorySubmissions } from '@/api/admin/submissions'

export type AdminDashboardStats = {
  ordersToShip: number
  draftBooks: number
  newSubmissions: number
}

// Counts for the dashboard cards. ordersToShip = paid orders still in
// "processing" fulfillment (physical orders awaiting shipment).
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const admin = createAdminClient()

  const [orders, drafts, submissions] = await Promise.all([
    admin
      .from('Orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'paid')
      .eq('fulfillment_status', 'processing'),
    admin.from('Titles').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    getStorySubmissions(),
  ])

  return {
    ordersToShip: orders.count ?? 0,
    draftBooks: drafts.count ?? 0,
    newSubmissions: submissions.length,
  }
}
