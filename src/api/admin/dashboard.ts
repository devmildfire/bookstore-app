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

export type AdminNavCounts = {
  books: number
  authors: number
  boxSets: number
  awards: number
  featured: number
  ordersToShip: number
  promoCodes: number
  giftCards: number
  subscriptions: number
  articles: number
  submissions: number
  partners: number
  team: number
  periodicals: number
}

// Counts shown as chips on the sidebar nav items. Totals for catalog/editorial
// entities; actionable counts (orders to ship, new submissions) for the rest.
export async function getAdminNavCounts(): Promise<AdminNavCounts> {
  const admin = createAdminClient()
  const headCount = (table: string) =>
    admin.from(table as 'Titles').select('id', { count: 'exact', head: true })

  const [
    books,
    authors,
    boxSets,
    awards,
    featured,
    orders,
    promo,
    giftCards,
    subscriptions,
    articles,
    submissions,
    partners,
    team,
    periodicals,
  ] = await Promise.all([
    headCount('Titles'),
    headCount('Authors'),
    headCount('BoxSets'),
    headCount('Awards'),
    headCount('featured_books'),
    admin
      .from('Orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'paid')
      .eq('fulfillment_status', 'processing'),
    headCount('PromoCodes'),
    headCount('GiftCardProducts'),
    headCount('Subscriptions'),
    headCount('Articles'),
    getStorySubmissions(),
    headCount('Partners'),
    admin.from('Workers').select('id', { count: 'exact', head: true }).eq('is_team_member', true),
    headCount('Periodicals'),
  ])

  return {
    books: books.count ?? 0,
    authors: authors.count ?? 0,
    boxSets: boxSets.count ?? 0,
    awards: awards.count ?? 0,
    featured: featured.count ?? 0,
    ordersToShip: orders.count ?? 0,
    promoCodes: promo.count ?? 0,
    giftCards: giftCards.count ?? 0,
    subscriptions: subscriptions.count ?? 0,
    articles: articles.count ?? 0,
    submissions: submissions.length,
    partners: partners.count ?? 0,
    team: team.count ?? 0,
    periodicals: periodicals.count ?? 0,
  }
}
