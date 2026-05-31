import type { Database } from '@/types/supabase'

export type ArticleRow = Database['public']['Tables']['Articles']['Row'] & {
  Authors: Database['public']['Tables']['Authors']['Row'] | null
}
