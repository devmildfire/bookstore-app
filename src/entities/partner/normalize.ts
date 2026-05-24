import { getPartnerLogoUrl } from '@/lib/storage'
import type { PartnerRow } from './server'
import type { Partner } from './client'

export function normalizePartner(raw: PartnerRow): Partner {
  return {
    id: raw.id,
    name: raw.name,
    logoUrl: getPartnerLogoUrl(raw.logo_path),
    websiteUrl: raw.website_url,
    sortOrder: raw.sort_order,
  }
}
