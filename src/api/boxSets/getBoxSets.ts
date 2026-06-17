import { createClient } from '@/lib/supabase/server'
import { normalizeBoxSet } from '@/entities/boxSet/normalize'
import type { BoxSet } from '@/entities/boxSet/client'

export const boxSetsQueryKey = ['box-sets'] as const
export const boxSetsByTitleQueryKey = (titleId: number) =>
  ['box-sets', 'by-title', titleId] as const

// Box-set images live in the `box-sets` storage bucket and are referenced by `imageUrl`
// (SVG or raster). They are rendered as <img> — NOT fetched + inlined — so their markup
// (100-277 KB each) never lands in the HTML / RSC flight and they load lazily, cached as
// their own files. (Previously the SVG text was fetched and inlined via dangerouslySetInnerHTML,
// which serialized hundreds of KB per card into the document and tanked mobile FCP/LCP.)

export async function getBoxSets(): Promise<BoxSet[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('BoxSets')
    .select('*')
    .eq('is_active', true)
    .order('position')
  if (error) throw error
  return data.map(normalizeBoxSet)
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
  return data.map(normalizeBoxSet)
}
