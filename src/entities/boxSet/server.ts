import type { Database } from '@/types/supabase'

export type BoxSetRow = Database['public']['Tables']['BoxSets']['Row']

// Shape of a BoxSetBooks row with its nested Titles + Titles_Authors + Authors join.
// Supabase SDK doesn't infer nested join shapes from .select(), so we define it manually here.
export type BoxSetBooksRow = {
  position: number
  title_id: number
  Titles: {
    id: number
    name: string
    cover: string | null
    Titles_Authors: Array<{
      Authors: { name: string } | null
    }>
  } | null
}
