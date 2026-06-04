import { createAdminClient } from '@/lib/supabase/server'
import { getSubscriptionImageUrl } from '@/lib/storage'

export type AdminSubscriptionListItem = {
  id: number
  name: string
  slug: string
  price: number
  imageUrl: string | null
  isPublished: boolean
}

export type AdminSubscription = {
  id: number
  name: string
  slug: string
  description: string | null
  price: number
  discount: number | null
  perks: string[]
  image: string | null
  imageUrl: string | null
  isPublished: boolean
  isActive: boolean
  subscriberCount: number
}

export async function getAdminSubscriptions(): Promise<AdminSubscriptionListItem[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('Subscriptions')
    .select('id, name, slug, price, image, is_published')
    .order('position', { ascending: true })
  if (error) throw new Error(`Не удалось загрузить подписки: ${error.message}`)
  return (data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    price: s.price,
    imageUrl: getSubscriptionImageUrl(s.image),
    isPublished: s.is_published,
  }))
}

export async function getAdminSubscription(id: number): Promise<AdminSubscription | null> {
  const admin = createAdminClient()
  const { data: s, error } = await admin.from('Subscriptions').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`Не удалось загрузить подписку: ${error.message}`)
  if (!s) return null
  const { count } = await admin
    .from('UserSubscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('subscription_id', id)
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: s.description,
    price: s.price,
    discount: s.discount,
    perks: Array.isArray(s.perks) ? (s.perks as string[]) : [],
    image: s.image,
    imageUrl: getSubscriptionImageUrl(s.image),
    isPublished: s.is_published,
    isActive: s.is_active,
    subscriberCount: count ?? 0,
  }
}
