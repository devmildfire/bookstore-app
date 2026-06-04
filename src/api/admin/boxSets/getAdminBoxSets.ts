import { createAdminClient } from '@/lib/supabase/server'
import { getBoxSetImageUrl } from '@/lib/storage'

export type AdminBoxSetListItem = {
  id: number
  name: string
  slug: string
  imageUrl: string | null
  isPublished: boolean
}

export async function getAdminBoxSets(): Promise<AdminBoxSetListItem[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('BoxSets')
    .select('id, name, slug, image, is_published')
    .order('position', { ascending: true })
  if (error) throw new Error(`Не удалось загрузить бокс-сеты: ${error.message}`)
  return (data ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    imageUrl: getBoxSetImageUrl(b.image),
    isPublished: b.is_published,
  }))
}

// Lightweight title options for the box-set composition picker.
export async function getTitleOptions(): Promise<{ id: number; name: string }[]> {
  const admin = createAdminClient()
  const { data } = await admin.from('Titles').select('id, name').order('name', { ascending: true })
  return (data ?? []).map((t) => ({ id: t.id, name: t.name }))
}
