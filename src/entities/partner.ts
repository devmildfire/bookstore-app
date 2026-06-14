import { getPartnerLogoUrl } from '@/lib/storage'
import type { Database } from '@/types/supabase'

export type PartnerRow = Database['public']['Tables']['Partners']['Row']

export type Partner = {
  id: number
  name: string
  logoUrl: string | null
  caption: string | null
  websiteUrl: string | null
  sortOrder: number
}

export function normalizePartner(
  raw: Pick<PartnerRow, 'id' | 'name' | 'logo_path' | 'logo_caption' | 'website_url' | 'sort_order'>,
): Partner {
  return {
    id: raw.id,
    name: raw.name,
    logoUrl: getPartnerLogoUrl(raw.logo_path),
    caption: raw.logo_caption,
    websiteUrl: raw.website_url,
    sortOrder: raw.sort_order,
  }
}
