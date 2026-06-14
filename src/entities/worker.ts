import { getWorkerPhotoUrl } from '@/lib/storage'
import type { Database } from '@/types/supabase'

export type WorkerRow = Database['public']['Tables']['Workers']['Row']

export type TeamMember = {
  id: number
  name: string
  position: string
  city: string | null
  photoUrl: string | null
  sortOrder: number
}

export function normalizeTeamMember(
  raw: Pick<WorkerRow, 'id' | 'name' | 'job' | 'city' | 'photo_path' | 'sort_order'>,
): TeamMember {
  return {
    id: raw.id,
    name: raw.name,
    position: raw.job,
    city: raw.city,
    photoUrl: getWorkerPhotoUrl(raw.photo_path),
    sortOrder: raw.sort_order,
  }
}
