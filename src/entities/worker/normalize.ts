import { getWorkerPhotoUrl } from '@/lib/storage'
import type { WorkerRow } from './server'
import type { TeamMember } from './client'

export function normalizeTeamMember(raw: WorkerRow): TeamMember {
  return {
    id: raw.id,
    name: raw.name,
    position: raw.job,
    city: raw.city,
    photoUrl: getWorkerPhotoUrl(raw.photo_path),
    sortOrder: raw.sort_order,
  }
}
