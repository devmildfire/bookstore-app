import { createClient } from '@/lib/supabase/server'
import { normalizePartner, type Partner } from '@/entities/partner'

export async function getPartners(): Promise<Partner[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('Partners')
    .select('id, name, logo_path, logo_caption, website_url, sort_order')
    .order('sort_order')

  if (error) throw error

  return data.map(normalizePartner)
}
