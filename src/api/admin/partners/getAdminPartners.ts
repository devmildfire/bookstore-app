import { createAdminClient } from '@/lib/supabase/server'
import { getPartnerLogoUrl } from '@/lib/storage'

export type AdminPartnerListItem = {
  id: number
  name: string
  logoUrl: string | null
  websiteUrl: string | null
  position: number
}

export type AdminPartner = {
  id: number
  name: string
  logoPath: string | null
  logoUrl: string | null
  websiteUrl: string | null
  position: number
}

export async function getAdminPartners(): Promise<AdminPartnerListItem[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('Partners')
    .select('id, name, logo_path, website_url, sort_order')
    .order('sort_order', { ascending: true })
  if (error) throw new Error(`Не удалось загрузить партнёров: ${error.message}`)

  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    logoUrl: getPartnerLogoUrl(p.logo_path),
    websiteUrl: p.website_url,
    position: p.sort_order ?? 0,
  }))
}

export async function getAdminPartner(id: number): Promise<AdminPartner | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('Partners')
    .select('id, name, logo_path, website_url, sort_order')
    .eq('id', id)
    .maybeSingle()
  if (!data) return null

  return {
    id: data.id,
    name: data.name,
    logoPath: data.logo_path,
    logoUrl: getPartnerLogoUrl(data.logo_path),
    websiteUrl: data.website_url,
    position: data.sort_order ?? 0,
  }
}
