import { createClient } from '@/lib/supabase/client'
import type { LikeItemType } from './types'

type RpcFn = (
  name: string,
  params: Record<string, unknown>
) => Promise<{ data: unknown; error: { message: string } | null }>

// Calls the toggle_like(item_type, item_id) RPC. Atomic — returns true
// if the item is now liked, false if it was just unliked.
export async function toggleLike(type: LikeItemType, itemId: number): Promise<boolean> {
  const supabase = createClient()
  const { data, error } = await (supabase.rpc as unknown as RpcFn)('toggle_like', {
    p_item_type: type,
    p_item_id: itemId,
  })
  if (error) throw new Error(error.message)
  return Boolean(data)
}
