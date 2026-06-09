import { createAdminClient } from '@/lib/supabase/server'
import { getWorkerPhotoUrl } from '@/lib/storage'

export type AdminTeamListItem = {
  id: number
  name: string
  job: string
  city: string | null
  photoUrl: string | null
  position: number
}

export type AdminTeamMember = {
  id: number
  name: string
  job: string
  city: string | null
  photoPath: string | null
  photoUrl: string | null
  position: number
}

export async function getAdminTeam(): Promise<AdminTeamListItem[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('Workers')
    .select('id, name, job, city, photo_path, sort_order')
    .eq('is_team_member', true)
    .order('sort_order', { ascending: true })
  if (error) throw new Error(`Не удалось загрузить команду: ${error.message}`)

  return (data ?? []).map((w) => ({
    id: w.id,
    name: w.name,
    job: w.job,
    city: w.city,
    photoUrl: getWorkerPhotoUrl(w.photo_path),
    position: w.sort_order ?? 0,
  }))
}

export async function getAdminTeamMember(id: number): Promise<AdminTeamMember | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('Workers')
    .select('id, name, job, city, photo_path, sort_order, is_team_member')
    .eq('id', id)
    .maybeSingle()
  if (!data || !data.is_team_member) return null

  return {
    id: data.id,
    name: data.name,
    job: data.job,
    city: data.city,
    photoPath: data.photo_path,
    photoUrl: getWorkerPhotoUrl(data.photo_path),
    position: data.sort_order ?? 0,
  }
}
