-- Supports homepage catalog filtering with repeated query params:
-- type=EBook&type=AudioBook, author=..., year=...

DROP FUNCTION IF EXISTS get_catalog_books(int, int, text, text, text, numeric, numeric, text, int[]);

CREATE OR REPLACE FUNCTION get_catalog_books(
  result_limit          int       DEFAULT 12,
  result_offset         int       DEFAULT 0,
  search_term           text      DEFAULT NULL,
  product_type_filter   text      DEFAULT NULL,
  author_name           text      DEFAULT NULL,
  price_from            numeric   DEFAULT NULL,
  price_to              numeric   DEFAULT NULL,
  sort_by               text      DEFAULT 'year-desc',
  title_ids             int[]     DEFAULT NULL,
  product_type_filters  text[]    DEFAULT NULL,
  author_names_filter   text[]    DEFAULT NULL,
  year_filters          text[]    DEFAULT NULL
)
RETURNS TABLE (
  id                      integer,
  price                   numeric,
  discount                integer,
  sold_out                boolean,
  is_published            boolean,
  publish_date            text,
  release_date            text,
  title_id                integer,
  product_type            text,
  title_name              text,
  title_slug              text,
  title_cover             text,
  title_description       text,
  title_thesis            text,
  title_lit_form          text,
  title_age_restriction   integer,
  title_first_release     text,
  author_names            text[],
  total_count             bigint,
  has_multiple_products   boolean
)
LANGUAGE sql
STABLE
AS $$
  WITH filter_params AS (
    SELECT
      CASE
        WHEN product_type_filters IS NOT NULL AND cardinality(product_type_filters) > 0 THEN product_type_filters
        WHEN product_type_filter IS NOT NULL AND product_type_filter <> '' THEN ARRAY[product_type_filter]
        ELSE NULL::text[]
      END AS product_types,
      CASE
        WHEN author_names_filter IS NOT NULL AND cardinality(author_names_filter) > 0 THEN author_names_filter
        WHEN author_name IS NOT NULL AND author_name <> '' THEN ARRAY[author_name]
        ELSE NULL::text[]
      END AS authors,
      CASE
        WHEN year_filters IS NOT NULL AND cardinality(year_filters) > 0 THEN year_filters
        ELSE NULL::text[]
      END AS years
  ),
  all_products AS (
    SELECT id, price, discount, coalesce(sold_out, false) AS sold_out,
           coalesce(is_published, false) AS is_published,
           publish_date, release_date, title_id, 'Book2.0'::text AS product_type, 2 AS type_rank
    FROM "CardBooks"
    UNION ALL
    SELECT id, price, discount, false,
           coalesce(is_published, false),
           publish_date, release_date, title_id, 'EBook'::text, 1
    FROM "Ebooks"
    UNION ALL
    SELECT id, price, discount, false,
           coalesce(is_published, false),
           publish_date, release_date, title_id, 'AudioBook'::text, 3
    FROM "Audiobooks"
    UNION ALL
    SELECT id, price, discount, coalesce(sold_out, false),
           coalesce(is_published, false),
           publish_date, release_date, title_id, 'PrintBook'::text, 4
    FROM "PrintedBooks"
  ),
  filtered AS (
    SELECT
      p.id,
      p.price,
      p.discount,
      p.sold_out,
      p.is_published,
      p.publish_date,
      p.release_date,
      p.title_id,
      p.product_type,
      p.type_rank,
      t.name            AS title_name,
      t.slug            AS title_slug,
      t.cover           AS title_cover,
      t.description     AS title_description,
      t.thesis          AS title_thesis,
      t.lit_form        AS title_lit_form,
      t.age_restriction AS title_age_restriction,
      t.first_release   AS title_first_release,
      authors.author_names,
      authors.first_author_surname,
      COUNT(*) OVER (PARTITION BY p.title_id) AS type_count
    FROM all_products p
    INNER JOIN "Titles" t ON t.id = p.title_id
    CROSS JOIN filter_params fp
    CROSS JOIN LATERAL (
      SELECT
        coalesce(array_agg(a.name ORDER BY a.name), '{}') AS author_names,
        lower(regexp_replace((array_agg(a.name ORDER BY a.name))[1], '^.*[[:space:]]+', '')) AS first_author_surname
      FROM "Titles_Authors" ta
      JOIN "Authors" a ON a.id = ta.author_id
      WHERE ta.title_id = t.id
    ) authors
    WHERE p.is_published = true
      AND (title_ids IS NULL OR p.title_id = ANY(title_ids))
      AND (fp.product_types IS NULL OR p.product_type = ANY(fp.product_types))
      AND (search_term IS NULL OR search_term = ''
           OR t.name ILIKE '%' || search_term || '%')
      AND (fp.authors IS NULL
           OR EXISTS (
             SELECT 1 FROM "Titles_Authors" ta
             JOIN "Authors" a ON a.id = ta.author_id
             WHERE ta.title_id = t.id AND a.name = ANY(fp.authors)
           ))
      AND (fp.years IS NULL OR left(t.first_release, 4) = ANY(fp.years))
      AND (price_from IS NULL OR p.price >= price_from)
      AND (price_to   IS NULL OR p.price <= price_to)
  ),
  deduped AS (
    SELECT DISTINCT ON (f.title_id)
      f.*
    FROM filtered f
    ORDER BY
      f.title_id,
      f.type_rank ASC,
      f.publish_date DESC NULLS LAST,
      f.release_date DESC NULLS LAST
  ),
  matched AS (
    SELECT
      d.id,
      d.price,
      d.discount,
      d.sold_out,
      d.is_published,
      d.publish_date,
      d.release_date,
      d.title_id,
      d.product_type,
      d.title_name,
      d.title_slug,
      d.title_cover,
      d.title_description,
      d.title_thesis,
      d.title_lit_form,
      d.title_age_restriction,
      d.title_first_release,
      d.author_names,
      count(*) OVER ()    AS total_count,
      (d.type_count > 1)  AS has_multiple_products
    FROM deduped d
    ORDER BY
      CASE WHEN sort_by = 'year-desc' THEN d.title_first_release END DESC NULLS LAST,
      CASE WHEN sort_by = 'year-asc' THEN d.title_first_release END ASC NULLS LAST,
      CASE WHEN sort_by = 'author-asc' THEN d.first_author_surname END ASC NULLS LAST,
      CASE WHEN sort_by = 'author-desc' THEN d.first_author_surname END DESC NULLS LAST,
      CASE WHEN sort_by = 'price-asc' THEN d.price END ASC NULLS LAST,
      CASE WHEN sort_by = 'price-desc' THEN d.price END DESC NULLS LAST,
      d.title_id ASC
    LIMIT result_limit
    OFFSET result_offset
  )
  SELECT * FROM matched;
$$;
