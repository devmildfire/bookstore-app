-- Companion to the catalog read path: returns each title's published editions
-- as a JSON array, so card grids can carry the editions needed by the
-- add-to-cart modal without a per-open client round-trip.
--
-- Deliberately ADDITIVE: a new function. It does NOT modify the core browse
-- RPCs (get_catalog_books / search_books / get_similar_books) — the fetch layer
-- calls this once per page (batched over the page's title_ids) and attaches the
-- result to the returned books. Same outcome as embedding the column, far less
-- risk on the live browse path.
--
-- Per-edition shape mirrors what normalizeEditions() consumes:
--   { id, product_type, price, discount, sold_out }

CREATE OR REPLACE FUNCTION public.get_editions_for_titles(p_title_ids integer[])
RETURNS TABLE(title_id integer, editions jsonb)
LANGUAGE sql STABLE
AS $$
  SELECT e.title_id,
         jsonb_agg(
           jsonb_build_object(
             'id', e.id,
             'product_type', e.kind,
             'price', e.price,
             'discount', e.discount,
             'sold_out', coalesce(e.sold_out, false)
           )
           ORDER BY CASE e.kind
             WHEN 'EBook'     THEN 1
             WHEN 'Book2.0'   THEN 2
             WHEN 'AudioBook' THEN 3
             WHEN 'PrintBook' THEN 4
             ELSE 5
           END
         ) AS editions
  FROM "Editions" e
  WHERE e.title_id = ANY(p_title_ids)
    AND e.is_published = true
  GROUP BY e.title_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_editions_for_titles(integer[]) TO anon, authenticated, service_role;
