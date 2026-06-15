import { createClient } from '@/lib/supabase/server'

// Server counterpart of getBoxSetPhysicalFlags (same boxSetPhysicalFlagsQueryKey),
// for prefetch + hydrate in the (site) layout. The returned Map survives the
// server→client boundary via RSC serialization.
export async function getBoxSetPhysicalFlagsServer(
  boxSetIds: readonly number[]
): Promise<Map<number, boolean>> {
  const result = new Map<number, boolean>()
  if (boxSetIds.length === 0) return result

  const supabase = await createClient()
  const unique = Array.from(new Set(boxSetIds))

  const results = await Promise.all(
    unique.map(async (id) => {
      const { data, error } = await supabase.rpc('box_set_is_physical', { p_box_set_id: id })
      if (error) throw new Error(`Не удалось определить физический набор #${id}: ${error.message}`)
      return [id, Boolean(data)] as const
    })
  )

  for (const [id, isPhysical] of results) result.set(id, isPhysical)
  return result
}
