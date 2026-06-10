import { createAdminClient } from '@/lib/supabase/server'

export type AdminPeriodicalListItem = {
  id: number
  name: string
  slug: string | null
  issueCount: number
}

export type AdminPeriodicalIssue = {
  id: number
  name: string
  slug: string | null
  volumeNumber: number | null
  volumeYear: string | null
}

export type AdminPeriodical = {
  id: number
  name: string
  slug: string | null
  description: string | null
  thesis: string | null
  position: number
  issues: AdminPeriodicalIssue[]
}

export async function getAdminPeriodicals(): Promise<AdminPeriodicalListItem[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('Periodicals')
    .select('id, name, slug, sort_order')
    .order('sort_order', { ascending: true })
  if (error) throw new Error(`Не удалось загрузить периодику: ${error.message}`)

  const { data: titles } = await admin.from('Titles').select('periodical_id').not('periodical_id', 'is', null)
  const counts = new Map<number, number>()
  for (const t of titles ?? []) {
    if (t.periodical_id != null) counts.set(t.periodical_id, (counts.get(t.periodical_id) ?? 0) + 1)
  }

  return (data ?? []).map((p) => ({ id: p.id, name: p.name, slug: p.slug, issueCount: counts.get(p.id) ?? 0 }))
}

export async function getAdminPeriodical(id: number): Promise<AdminPeriodical | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('Periodicals')
    .select('id, name, slug, description, thesis, sort_order')
    .eq('id', id)
    .maybeSingle()
  if (!data) return null

  const { data: issueRows } = await admin
    .from('Titles')
    .select('id, name, slug, volume_number, volume_year')
    .eq('periodical_id', id)
    .order('volume_number', { ascending: false })

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    thesis: data.thesis,
    position: data.sort_order ?? 0,
    issues: (issueRows ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      volumeNumber: t.volume_number,
      volumeYear: t.volume_year,
    })),
  }
}
