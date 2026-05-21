import type { Database } from '@/types/supabase'

export type ProfileServerRow = Database['public']['Tables']['Profiles']['Row']
export type ProfileUpdate = Database['public']['Tables']['Profiles']['Update']
