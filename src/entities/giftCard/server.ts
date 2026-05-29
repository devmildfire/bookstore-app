import type { Database } from '@/types/supabase'

export type GiftCardRow = Database['public']['Tables']['GiftCards']['Row'] & {
  GiftCardProducts: Database['public']['Tables']['GiftCardProducts']['Row'] | null
}
