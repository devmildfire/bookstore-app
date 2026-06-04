import { createClient } from '@/lib/supabase/server'
import { normalizeBoxSet } from '@/entities/boxSet/normalize'
import type { BoxSet } from '@/entities/boxSet/client'

export const boxSetsQueryKey = ['box-sets'] as const
export const boxSetsByTitleQueryKey = (titleId: number) =>
  ['box-sets', 'by-title', titleId] as const

// Box-set images are stored in the `box-sets` bucket. For SVGs we inline the
// markup (so it themes/scales cleanly); raster images render via imageUrl.
function sanitizeSvg(svg: string): string | null {
  const start = svg.indexOf('<svg')
  if (start === -1) return null
  return svg.slice(start).replace(/<script[\s\S]*?<\/script>/gi, '')
}

async function withInlineSvg(boxSets: BoxSet[]): Promise<BoxSet[]> {
  return Promise.all(
    boxSets.map(async (b) => {
      if (!b.imageUrl || !b.imageUrl.toLowerCase().endsWith('.svg')) return b
      try {
        const res = await fetch(b.imageUrl, { cache: 'force-cache' })
        if (!res.ok) return b
        return { ...b, imageSvg: sanitizeSvg(await res.text()) }
      } catch {
        return b
      }
    })
  )
}

export async function getBoxSets(): Promise<BoxSet[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('BoxSets')
    .select('*')
    .eq('is_active', true)
    .order('position')
  if (error) throw error
  return withInlineSvg(data.map(normalizeBoxSet))
}

export async function getBoxSetsByTitleId(titleId: number): Promise<BoxSet[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('BoxSets')
    .select('*, BoxSetBooks!inner(title_id)')
    .eq('is_active', true)
    .eq('BoxSetBooks.title_id', titleId)
    .order('position')
  if (error) throw error
  return withInlineSvg(data.map(normalizeBoxSet))
}
