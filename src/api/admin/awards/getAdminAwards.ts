import { createAdminClient } from '@/lib/supabase/server'
import { getAwardUrl } from '@/lib/storage'

export type AdminAwardListItem = {
  id: number
  title: string
  slug: string
  imageUrl: string | null
  position: number
  isActive: boolean
  usageCount: number
}

export type AdminAward = {
  id: number
  slug: string
  title: string
  image: string | null
  imageUrl: string | null
  position: number
  isActive: boolean
  usageCount: number
}

async function awardUsageCounts(
  admin: ReturnType<typeof createAdminClient>
): Promise<Map<number, number>> {
  const { data } = await admin.from('Titles_Awards').select('award_id')
  const counts = new Map<number, number>()
  for (const row of data ?? []) {
    counts.set(row.award_id, (counts.get(row.award_id) ?? 0) + 1)
  }
  return counts
}

export async function getAdminAwards(): Promise<AdminAwardListItem[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('Awards')
    .select('id, slug, title, image, position, is_active')
    .order('position', { ascending: true })
  if (error) throw new Error(`Не удалось загрузить награды: ${error.message}`)

  const counts = await awardUsageCounts(admin)
  return (data ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug ?? '',
    imageUrl: getAwardUrl(a.image),
    position: a.position ?? 0,
    isActive: a.is_active ?? false,
    usageCount: counts.get(a.id) ?? 0,
  }))
}

export async function getAdminAward(id: number): Promise<AdminAward | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('Awards')
    .select('id, slug, title, image, position, is_active')
    .eq('id', id)
    .maybeSingle()
  if (!data) return null

  const { count } = await admin
    .from('Titles_Awards')
    .select('id', { count: 'exact', head: true })
    .eq('award_id', id)

  return {
    id: data.id,
    slug: data.slug ?? '',
    title: data.title,
    image: data.image,
    imageUrl: getAwardUrl(data.image),
    position: data.position ?? 0,
    isActive: data.is_active ?? false,
    usageCount: count ?? 0,
  }
}
