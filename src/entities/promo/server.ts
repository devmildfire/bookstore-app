import type { Database } from '@/types/supabase'

export type PromoCodeServerRow = Database['public']['Tables']['PromoCodes']['Row']
export type CartPromoServerRow = Database['public']['Tables']['CartPromo']['Row']
