import type { Database } from '@/types/supabase'

export const BOOK_CATALOG_PAGE_SIZE = 12

export const bookCatalogSelect = `
  id,
  price,
  sold_out,
  is_published,
  publish_date,
  release_date,
  title_id,
  Titles!inner(
    id,
    slug,
    name,
    cover,
    description,
    lit_form,
    age_restriction,
    first_release,
    Titles_Authors(
      Authors(
        id,
        name
      )
    )
  )
`

type CardBookRow = Database['public']['Tables']['CardBooks']['Row']
type TitleRow = Pick<
  Database['public']['Tables']['Titles']['Row'],
  'id' | 'slug' | 'name' | 'cover' | 'description' | 'lit_form' | 'age_restriction' | 'first_release'
>
type AuthorRow = Pick<Database['public']['Tables']['Authors']['Row'], 'id' | 'name'>

export type BookServerRow = Pick<
  CardBookRow,
  'id' | 'price' | 'sold_out' | 'is_published' | 'publish_date' | 'release_date' | 'title_id'
> & {
  Titles: TitleRow & {
    Titles_Authors: Array<{
      Authors: AuthorRow | null
    }>
  }
}
