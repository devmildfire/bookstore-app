import { createClient } from '@/lib/supabase/server'
import { normalizeTeamMember, type TeamMember } from '@/entities/worker'

export async function getTeam(): Promise<TeamMember[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('Workers')
    .select('id, name, job, city, photo_path, sort_order')
    .eq('is_team_member', true)
    .order('sort_order')

  if (error) throw error

  return data.map(normalizeTeamMember)
}
