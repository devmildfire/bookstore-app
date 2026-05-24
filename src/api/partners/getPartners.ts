import { createClient } from '@/lib/supabase/server'
import { normalizePartner } from '@/entities/partner/normalize'
import type { Partner } from '@/entities/partner/client'

export async function getPartners(): Promise<Partner[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('Partners')
    .select('*')
    .order('sort_order')

  if (error) throw error

  return data.map(normalizePartner)
}
