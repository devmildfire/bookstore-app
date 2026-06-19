import { getAuthedClient } from '@/lib/supabase/authedClient'

export const boxSetPhysicalFlagsQueryKey = (boxSetIds: readonly number[]) =>
  ['cart', 'boxSetPhysical', [...boxSetIds].sort((a, b) => a - b)] as const

// Calls box_set_is_physical(id) once per BoxSet id and returns a map.
// Empty input → empty map; we expect the caller to only invoke this when
// the cart actually contains BoxSet items.
export async function getBoxSetPhysicalFlags(
  boxSetIds: readonly number[]
): Promise<Map<number, boolean>> {
  const result = new Map<number, boolean>()
  if (boxSetIds.length === 0) return result

  const supabase = await getAuthedClient()
  const unique = Array.from(new Set(boxSetIds))

  const results = await Promise.all(
    unique.map(async (id) => {
      const { data, error } = await supabase.rpc('box_set_is_physical', { p_box_set_id: id })
      if (error) {
        throw new Error(`Не удалось определить физический набор #${id}: ${error.message}`)
      }
      return [id, Boolean(data)] as const
    })
  )

  for (const [id, isPhysical] of results) {
    result.set(id, isPhysical)
  }
  return result
}
