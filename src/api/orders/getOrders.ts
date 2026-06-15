import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { normalizeOrder } from '@/entities/order/normalize'
import { getCoverUrl, getGiftCardImageUrl, getSubscriptionImageUrl } from '@/lib/storage'
import { ABZAC_COURSE } from '@/consts/abzacCourse'
import type { Database } from '@/types/supabase'
import type { Order } from '@/entities/order/client'
import type { OrderItemServerRow, OrderServerRow } from '@/entities/order/server'

export const ordersQueryKey = ['orders'] as const
export const orderHistoryQueryKey = ['order-history'] as const

// bookId is shaped '<Category>-<editionId>' (create_pending_order RPC). editionId is
// the unified Editions.id; we look up its title_id once and join Titles for the cover.
const EDITION_KINDS = new Set<string>(['EBook', 'AudioBook', 'PrintBook', 'Book2.0'])

// Gift card items don't go through the title/edition lookup — their
// bookId is `GiftCard-<GiftCardProducts.id>` and the cover image lives
// in the `articles` bucket via `GiftCardProducts.image_path`.
const GIFT_CARD_CATEGORY = 'GiftCard'

// Subscriptions resolve like gift cards: bookId is `Subscription-<Subscriptions.id>`
// and the cover lives in the `subscriptions` bucket via `Subscriptions.image`.
const SUBSCRIPTION_CATEGORY = 'Subscription'

// Courses are standalone cart products (no edition/title row); their cover is a
// static asset keyed by the full bookId. Single source of truth: the const.
const COURSE_CATEGORY = 'Course'
const COURSE_COVERS: Record<string, string | null> = {
  [ABZAC_COURSE.id]: ABZAC_COURSE.picture ?? null,
}

type Enriched = { coverUrl: string | null; titleSlug: string | null }

// Paid orders only. This is the ownership source for the library ("Мои книги")
// and courses — an unpaid order must never grant access to its items.
export async function getOrders(): Promise<Order[]> {
  return loadOrders(createClient(), ['paid'])
}

// Full order history for the cabinet's "Заказы" view, INCLUDING unpaid
// (pending) / failed / cancelled orders. A buyer who closed the payment page
// must still see the order exists and that it is NOT paid — otherwise they may
// assume the purchase went through. Never feed this into the library views.
export async function getOrderHistory(): Promise<Order[]> {
  return loadOrders(createClient(), null)
}

// Client-agnostic core — takes the Supabase client so it can run with the
// browser client (getOrders/getOrderHistory) or the cookie-based server client
// (getOrdersServer/getOrderHistoryServer, for prefetch + hydrate).
export async function loadOrders(
  supabase: SupabaseClient<Database>,
  statuses: readonly string[] | null
): Promise<Order[]> {
  // Resolve the current user explicitly and filter by user_id in the
  // WHERE clause as defense-in-depth. RLS on Orders / OrderItems also
  // enforces this (migration 20260522130000), but a future regression
  // shouldn't immediately leak.
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('Orders')
    .select('*')
    .eq('user_id', user.id)
  // `null` = every status (full history); an explicit list narrows it.
  if (statuses) query = query.in('status', statuses)

  const { data: orders, error: ordersError } = await query.order('created_at', {
    ascending: false,
  })

  if (ordersError) {
    throw new Error(`Не удалось загрузить заказы: ${ordersError.message}`)
  }
  if (!orders || orders.length === 0) return []

  const orderIds = orders.map((o) => o.id)
  const { data: items, error: itemsError } = await supabase
    .from('OrderItems')
    .select('*')
    .in('order_id', orderIds)

  if (itemsError) {
    throw new Error(`Не удалось загрузить товары заказов: ${itemsError.message}`)
  }

  const enrichedByItemId = await fetchItemEnrichments(supabase, items ?? [])

  const itemsByOrder = new Map<number, OrderItemServerRow[]>()
  for (const item of items ?? []) {
    const list = itemsByOrder.get(item.order_id) ?? []
    list.push(item)
    itemsByOrder.set(item.order_id, list)
  }

  // Map each subscription-anchoring order → its recurring status, so the order
  // history can show «Активна / Отменена» on the subscription line.
  const subscriptionStatusByOrder = new Map<number, string>()
  const { data: subs } = await supabase
    .from('UserSubscriptions')
    .select('anchor_order_id, status')
    .in('anchor_order_id', orderIds)
  for (const row of (subs ?? []) as Array<{ anchor_order_id: number; status: string }>) {
    subscriptionStatusByOrder.set(row.anchor_order_id, row.status)
  }

  return (orders as OrderServerRow[]).map((row) =>
    normalizeOrder(
      row,
      itemsByOrder.get(row.id) ?? [],
      enrichedByItemId,
      subscriptionStatusByOrder.get(row.id) ?? null
    )
  )
}

// For each OrderItem, look up the title (and its cover) by walking
// bookId → edition row → title row. One query per edition table + one
// query for Titles, no matter how many items. Gift card items are
// resolved separately against GiftCardProducts.
async function fetchItemEnrichments(
  supabase: SupabaseClient<Database>,
  items: OrderItemServerRow[]
): Promise<Map<number, Enriched>> {
  const byEdition = new Map<number, number[]>() // editionId → itemIds
  const giftCardItemsByProductId = new Map<number, number[]>()
  const subscriptionItemsByProductId = new Map<number, number[]>()
  const courseItemCovers: Array<{ itemId: number; coverUrl: string | null }> = []
  for (const item of items) {
    const [category, editionIdStr] = item.book_id.split('-', 2)

    if (category === COURSE_CATEGORY) {
      courseItemCovers.push({ itemId: item.id, coverUrl: COURSE_COVERS[item.book_id] ?? null })
      continue
    }

    if (category === GIFT_CARD_CATEGORY) {
      const productId = Number(editionIdStr)
      if (!Number.isFinite(productId)) continue
      const list = giftCardItemsByProductId.get(productId) ?? []
      list.push(item.id)
      giftCardItemsByProductId.set(productId, list)
      continue
    }

    if (category === SUBSCRIPTION_CATEGORY) {
      const productId = Number(editionIdStr)
      if (!Number.isFinite(productId)) continue
      const list = subscriptionItemsByProductId.get(productId) ?? []
      list.push(item.id)
      subscriptionItemsByProductId.set(productId, list)
      continue
    }

    const editionId = Number(editionIdStr)
    if (!EDITION_KINDS.has(category) || !Number.isFinite(editionId)) continue
    const existing = byEdition.get(editionId)
    if (existing) existing.push(item.id)
    else byEdition.set(editionId, [item.id])
  }

  // One query: edition id → title_id (Editions.id is globally unique now).
  const editionTitleIds = new Map<number, number>()
  if (byEdition.size > 0) {
    const { data } = await supabase
      .from('Editions')
      .select('id, title_id')
      .in('id', Array.from(byEdition.keys()))
    for (const row of (data ?? []) as Array<{ id: number; title_id: number | null }>) {
      if (row.title_id !== null) editionTitleIds.set(row.id, row.title_id)
    }
  }

  const titleIds = Array.from(new Set(editionTitleIds.values()))
  const titleInfo = new Map<number, Enriched>()
  if (titleIds.length > 0) {
    const { data } = await supabase
      .from('Titles')
      .select('id, slug, cover')
      .in('id', titleIds)
    for (const row of (data ?? []) as Array<{ id: number; slug: string | null; cover: string | null }>) {
      titleInfo.set(row.id, {
        coverUrl: getCoverUrl(row.cover),
        titleSlug: row.slug,
      })
    }
  }

  const enrichedByItemId = new Map<number, Enriched>()
  for (const [editionId, itemIds] of byEdition.entries()) {
    const titleId = editionTitleIds.get(editionId)
    const info = titleId !== undefined ? titleInfo.get(titleId) : undefined
    const value: Enriched = info ?? { coverUrl: null, titleSlug: null }
    for (const itemId of itemIds) enrichedByItemId.set(itemId, value)
  }

  // Courses: static cover, resolved without any DB query.
  for (const { itemId, coverUrl } of courseItemCovers) {
    enrichedByItemId.set(itemId, { coverUrl, titleSlug: null })
  }

  // Gift cards: lookup product images in a single query.
  if (giftCardItemsByProductId.size > 0) {
    const productIds = Array.from(giftCardItemsByProductId.keys())
    const { data } = await supabase
      .from('GiftCardProducts')
      .select('id, image_path')
      .in('id', productIds)
    const coverByProductId = new Map<number, string | null>()
    for (const row of (data ?? []) as Array<{ id: number; image_path: string | null }>) {
      coverByProductId.set(row.id, getGiftCardImageUrl(row.image_path))
    }
    for (const [productId, itemIds] of giftCardItemsByProductId.entries()) {
      const coverUrl = coverByProductId.get(productId) ?? null
      for (const itemId of itemIds) {
        enrichedByItemId.set(itemId, { coverUrl, titleSlug: null })
      }
    }
  }

  // Subscriptions: lookup cover images in a single query.
  if (subscriptionItemsByProductId.size > 0) {
    const productIds = Array.from(subscriptionItemsByProductId.keys())
    const { data } = await supabase
      .from('Subscriptions')
      .select('id, image')
      .in('id', productIds)
    const coverByProductId = new Map<number, string | null>()
    for (const row of (data ?? []) as Array<{ id: number; image: string | null }>) {
      coverByProductId.set(row.id, getSubscriptionImageUrl(row.image))
    }
    for (const [productId, itemIds] of subscriptionItemsByProductId.entries()) {
      const coverUrl = coverByProductId.get(productId) ?? null
      for (const itemId of itemIds) {
        enrichedByItemId.set(itemId, { coverUrl, titleSlug: null })
      }
    }
  }

  return enrichedByItemId
}
