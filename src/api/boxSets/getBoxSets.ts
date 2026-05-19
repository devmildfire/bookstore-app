import { createClient } from '@/lib/supabase/server'
import { normalizeBoxSet } from '@/entities/boxSet/normalize'
import type { BoxSet } from '@/entities/boxSet/client'

export const boxSetsQueryKey = ['box-sets'] as const
export const boxSetsByTitleQueryKey = (titleId: number) =>
  ['box-sets', 'by-title', titleId] as const

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
