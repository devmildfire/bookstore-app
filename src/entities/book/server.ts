export const BOOK_CATALOG_PAGE_SIZE = 12

// Flat row shape returned by all catalog RPCs:
// get_catalog_books, get_catalog_book_by_slug, search_books.
export type BookServerRow = {
  id: number
  price: number | null
  sold_out: boolean
  is_published: boolean
  publish_date: string | null
  release_date: string | null
  title_id: number
  product_type: string
  title_name: string
  title_slug: string | null
  title_cover: string | null
  title_description: string | null
  title_thesis: string | null
  title_lit_form: string | null
  title_age_restriction: number | null
  title_first_release: string | null
  author_names: string[]
}
