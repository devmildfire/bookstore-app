import type { Database } from '@/types/supabase'

export type CartServerRow = Database['public']['Tables']['Cart']['Row']
export type CartInsert = Database['public']['Tables']['Cart']['Insert']
export type CartUpdate = Database['public']['Tables']['Cart']['Update']
