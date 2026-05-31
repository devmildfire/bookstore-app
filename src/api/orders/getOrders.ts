import { createClient } from '@/lib/supabase/client'
import { normalizeOrder } from '@/entities/order/normalize'
import { getCoverUrl, getGiftCardImageUrl } from '@/lib/storage'
import type { Order } from '@/entities/order/client'
import type { OrderItemServerRow, OrderServerRow } from '@/entities/order/server'

export const ordersQueryKey = ['orders'] as const

// bookId is shaped '<Category>-<editionId>' (place_order RPC). Each
// edition table has a title_id we join against Titles to get the cover.
const EDITION_TABLE: Record<string, 'CardBooks' | 'Ebooks' | 'Audiobooks' | 'PrintedBooks'> = {
  EBook: 'Ebooks',
  AudioBook: 'Audiobooks',
  'Book2.0': 'CardBooks',
  PrintBook: 'PrintedBooks',
}

// Gift card items don't go through the title/edition lookup — their
// bookId is `GiftCard-<GiftCardProducts.id>` and the cover image lives
// in the `articles` bucket via `GiftCardProducts.image_path`.
const GIFT_CARD_CATEGORY = 'GiftCard'

type Enriched = { coverUrl: string | null; titleSlug: string | null }

export async function getOrders(): Promise<Order[]> {
  const supabase = createClient()

  // Resolve the current user explicitly and filter by user_id in the
  // WHERE clause as defense-in-depth. RLS on Orders / OrderItems also
  // enforces this (migration 20260522130000), but a future regression
  // shouldn't immediately leak.
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: orders, error: ordersError } = await supabase
    .from('Orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

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

  return (orders as OrderServerRow[]).map((row) =>
    normalizeOrder(row, itemsByOrder.get(row.id) ?? [], enrichedByItemId)
  )
}

// For each OrderItem, look up the title (and its cover) by walking
// bookId → edition row → title row. One query per edition table + one
// query for Titles, no matter how many items. Gift card items are
// resolved separately against GiftCardProducts.
async function fetchItemEnrichments(
  supabase: ReturnType<typeof createClient>,
  items: OrderItemServerRow[]
): Promise<Map<number, Enriched>> {
  const byEdition = new Map<string, { itemIds: number[]; editionId: number; table: string }>()
  const giftCardItemsByProductId = new Map<number, number[]>()
  for (const item of items) {
    const [category, editionIdStr] = item.book_id.split('-', 2)

    if (category === GIFT_CARD_CATEGORY) {
      const productId = Number(editionIdStr)
      if (!Number.isFinite(productId)) continue
      const list = giftCardItemsByProductId.get(productId) ?? []
      list.push(item.id)
      giftCardItemsByProductId.set(productId, list)
      continue
    }

    const table = EDITION_TABLE[category]
    const editionId = Number(editionIdStr)
    if (!table || !Number.isFinite(editionId)) continue
    const key = `${table}:${editionId}`
    const existing = byEdition.get(key)
    if (existing) existing.itemIds.push(item.id)
    else byEdition.set(key, { itemIds: [item.id], editionId, table })
  }

  const idsPerTable = new Map<string, Set<number>>()
  for (const { table, editionId } of byEdition.values()) {
    const set = idsPerTable.get(table) ?? new Set<number>()
    set.add(editionId)
    idsPerTable.set(table, set)
  }

  const editionTitleIds = new Map<string, number>()
  await Promise.all(
    Array.from(idsPerTable.entries()).map(async ([table, idSet]) => {
      // `table` is a dynamic union of four edition table names; supabase-js
      // can't narrow the row type from a string variable, so widen via unknown.
      const { data } = await (supabase.from as unknown as (t: string) => ReturnType<typeof supabase.from>)(table)
        .select('id, title_id')
        .in('id', Array.from(idSet))
      for (const row of (data ?? []) as Array<{ id: number; title_id: number | null }>) {
        if (row.title_id !== null) editionTitleIds.set(`${table}:${row.id}`, row.title_id)
      }
    })
  )

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
  for (const { itemIds, editionId, table } of byEdition.values()) {
    const titleId = editionTitleIds.get(`${table}:${editionId}`)
    const info = titleId !== undefined ? titleInfo.get(titleId) : undefined
    const value: Enriched = info ?? { coverUrl: null, titleSlug: null }
    for (const itemId of itemIds) enrichedByItemId.set(itemId, value)
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

  return enrichedByItemId
}
