export const BOOK_CATALOG_PAGE_SIZE = 12

// Flat row shape returned by all catalog RPCs:
// get_catalog_books, get_catalog_book_by_slug, search_books.
// edition_details / edition_workers are only present on get_catalog_book_by_slug.
export type BookServerRow = {
  id: number
  price: number | null
  discount: number | null
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
  title_awards?: unknown
  has_multiple_products?: boolean
  edition_details?: unknown
  edition_workers?: unknown
}
