-- Catalog filter facets in one pass (data-architecture audit F8).
--
-- getBooks previously derived the author/year/type filter dropdowns by re-running the
-- heavy get_catalog_books with result_limit = 10000 and computing distincts in JS, plus
-- four is_published probe queries. This returns just the distinct sets, scoped to the
-- same published catalog (is_published edition on a status='published' title).
-- Sorting is left to the caller (localeCompare 'ru' / canonical type order).

CREATE OR REPLACE FUNCTION public.get_catalog_facets()
  RETURNS jsonb
  LANGUAGE sql STABLE
  SET search_path TO 'public'
AS $$
  WITH published_titles AS (
    SELECT t.id, t.first_release
    FROM "Titles" t
    WHERE t.status = 'published'
      AND (
        EXISTS (SELECT 1 FROM "CardBooks"    cb WHERE cb.title_id = t.id AND cb.is_published)
        OR EXISTS (SELECT 1 FROM "Ebooks"       e WHERE e.title_id  = t.id AND e.is_published)
        OR EXISTS (SELECT 1 FROM "Audiobooks"   a WHERE a.title_id  = t.id AND a.is_published)
        OR EXISTS (SELECT 1 FROM "PrintedBooks" p WHERE p.title_id  = t.id AND p.is_published)
      )
  )
  SELECT jsonb_build_object(
    'authors', (
      SELECT coalesce(jsonb_agg(DISTINCT a.name), '[]'::jsonb)
      FROM published_titles pt
      JOIN "Titles_Authors" ta ON ta.title_id = pt.id
      JOIN "Authors" a ON a.id = ta.author_id
    ),
    'years', (
      SELECT coalesce(jsonb_agg(DISTINCT left(pt.first_release, 4)), '[]'::jsonb)
      FROM published_titles pt
      WHERE pt.first_release IS NOT NULL AND pt.first_release <> ''
    ),
    'productTypes', (
      SELECT coalesce(jsonb_agg(kind), '[]'::jsonb) FROM (
        SELECT 'PrintBook' AS kind WHERE EXISTS (SELECT 1 FROM "PrintedBooks" pb JOIN published_titles p ON p.id = pb.title_id WHERE pb.is_published)
        UNION SELECT 'EBook'    WHERE EXISTS (SELECT 1 FROM "Ebooks"     e  JOIN published_titles p ON p.id = e.title_id  WHERE e.is_published)
        UNION SELECT 'AudioBook' WHERE EXISTS (SELECT 1 FROM "Audiobooks" a  JOIN published_titles p ON p.id = a.title_id  WHERE a.is_published)
        UNION SELECT 'Book2.0'  WHERE EXISTS (SELECT 1 FROM "CardBooks"  cb JOIN published_titles p ON p.id = cb.title_id WHERE cb.is_published)
      ) q
    )
  );
$$;
