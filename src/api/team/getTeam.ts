import { createClient } from '@/lib/supabase/server'
import { normalizeTeamMember } from '@/entities/worker/normalize'
import type { TeamMember } from '@/entities/worker/client'

export async function getTeam(): Promise<TeamMember[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('Workers')
    .select('*')
    .eq('is_team_member', true)
    .order('sort_order')

  if (error) throw error

  return data.map(normalizeTeamMember)
}
