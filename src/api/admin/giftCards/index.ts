import { createAdminClient } from '@/lib/supabase/server'
import { getGiftCardImageUrl } from '@/lib/storage'

export type AdminGiftCardListItem = {
  id: number
  name: string
  slug: string
  faceValue: number
  imageUrl: string | null
}

export type AdminGiftCard = {
  id: number
  name: string
  slug: string
  faceValue: number
  sortOrder: number
  imagePath: string | null
  imageUrl: string | null
  issuedCount: number
}

export async function getAdminGiftCards(): Promise<AdminGiftCardListItem[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('GiftCardProducts')
    .select('id, name, slug, face_value, image_path')
    .order('sort_order', { ascending: true })
  if (error) throw new Error(`Не удалось загрузить карты даров: ${error.message}`)
  return (data ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    slug: g.slug,
    faceValue: g.face_value,
    imageUrl: getGiftCardImageUrl(g.image_path),
  }))
}

export async function getAdminGiftCard(id: number): Promise<AdminGiftCard | null> {
  const admin = createAdminClient()
  const { data: g, error } = await admin.from('GiftCardProducts').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`Не удалось загрузить карту даров: ${error.message}`)
  if (!g) return null
  const { count } = await admin
    .from('GiftCards')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', id)
  return {
    id: g.id,
    name: g.name,
    slug: g.slug,
    faceValue: g.face_value,
    sortOrder: g.sort_order,
    imagePath: g.image_path,
    imageUrl: getGiftCardImageUrl(g.image_path),
    issuedCount: count ?? 0,
  }
}
