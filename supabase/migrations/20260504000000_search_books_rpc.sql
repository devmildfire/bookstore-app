-- Generic book search RPC for server-side filtering by title and author name.
-- Returns paginated CardBooks with full title/author data + total count.
-- Used by the header search bar and can eventually replace client-side filtering in getBooks.

CREATE OR REPLACE FUNCTION search_books(
  search_term text,
  result_limit int DEFAULT 12,
  result_offset int DEFAULT 0
)
RETURNS TABLE (
  id integer,
  price numeric,
  sold_out boolean,
  is_published boolean,
  publish_date text,
  release_date text,
  title_id integer,
  title_name text,
  title_slug text,
  title_cover text,
  title_description text,
  title_lit_form text,
  title_age_restriction integer,
  title_first_release text,
  author_names text[],
  total_count bigint
)
LANGUAGE sql
STABLE
AS $$
  WITH matched_books AS (
    SELECT
      cb.id,
      cb.price,
      cb.sold_out,
      cb.is_published,
      cb.publish_date,
      cb.release_date,
      cb.title_id,
      t.name AS title_name,
      t.slug AS title_slug,
      t.cover AS title_cover,
      t.description AS title_description,
      t.lit_form AS title_lit_form,
      t.age_restriction AS title_age_restriction,
      t.first_release AS title_first_release,
      (
        SELECT coalesce(array_agg(a.name ORDER BY a.name), '{}')
        FROM "Titles_Authors" ta
        JOIN "Authors" a ON a.id = ta.author_id
        WHERE ta.title_id = t.id
      ) AS author_names,
      count(*) OVER () AS total_count
    FROM "CardBooks" cb
    INNER JOIN "Titles" t ON t.id = cb.title_id
    WHERE cb.is_published = true
      AND (
        t.name ILIKE '%' || search_term || '%'
        OR
        EXISTS (
          SELECT 1
          FROM "Titles_Authors" ta
          JOIN "Authors" a ON a.id = ta.author_id
          WHERE ta.title_id = t.id
            AND a.name ILIKE '%' || search_term || '%'
        )
      )
    ORDER BY cb.publish_date DESC NULLS LAST, cb.release_date DESC NULLS LAST
    LIMIT result_limit
    OFFSET result_offset
  )
  SELECT
    id,
    price,
    sold_out,
    is_published,
    publish_date,
    release_date,
    title_id,
    title_name,
    title_slug,
    title_cover,
    title_description,
    title_lit_form,
    title_age_restriction,
    title_first_release,
    author_names,
    total_count
  FROM matched_books;
$$;