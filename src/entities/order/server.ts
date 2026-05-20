import type { Database } from '@/types/supabase'

export type OrderServerRow = Database['public']['Tables']['Orders']['Row']
export type OrderItemServerRow = Database['public']['Tables']['OrderItems']['Row']
export type OrderInsert = Database['public']['Tables']['Orders']['Insert']
