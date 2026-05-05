-- Multi-product-type catalog support.
--
-- All four purchasable product types (CardBooks, Ebooks, Audiobooks, PrintedBooks)
-- are unified here. Each title can have up to one row per type; Ebooks are canonical
-- (every published title has one). sold_out defaults to false for digital-only types.

-- ─── get_catalog_books ────────────────────────────────────────────────────────
-- Full catalog query: all product types, all filters, DB-side pagination + count.
-- Replaces the CardBooks-only PostgREST query in the API layer.

CREATE OR REPLACE FUNCTION get_catalog_books(
  result_limit         int       DEFAULT 12,
  result_offset        int       DEFAULT 0,
  search_term          text      DEFAULT NULL,
  product_type_filter  text      DEFAULT NULL,
  author_name          text      DEFAULT NULL,
  price_from           numeric   DEFAULT NULL,
  price_to             numeric   DEFAULT NULL,
  sort_by              text      DEFAULT 'newest',
  title_ids            int[]     DEFAULT NULL
)
RETURNS TABLE (
  id                    integer,
  price                 numeric,
  sold_out              boolean,
  is_published          boolean,
  publish_date          text,
  release_date          text,
  title_id              integer,
  product_type          text,
  title_name            text,
  title_slug            text,
  title_cover           text,
  title_description     text,
  title_thesis          text,
  title_lit_form        text,
  title_age_restriction integer,
  title_first_release   text,
  author_names          text[],
  total_count           bigint
)
LANGUAGE sql
STABLE
AS $$
  WITH all_products AS (
    SELECT id, price, coalesce(sold_out, false) AS sold_out,
           coalesce(is_published, false) AS is_published,
           publish_date, release_date, title_id, 'Book2.0'::text AS product_type
    FROM "CardBooks"
    UNION ALL
    SELECT id, price, false,
           coalesce(is_published, false),
           publish_date, release_date, title_id, 'EBook'::text
    FROM "Ebooks"
    UNION ALL
    SELECT id, price, false,
           coalesce(is_published, false),
           publish_date, release_date, title_id, 'AudioBook'::text
    FROM "Audiobooks"
    UNION ALL
    SELECT id, price, coalesce(sold_out, false),
           coalesce(is_published, false),
           publish_date, release_date, title_id, 'PrintBook'::text
    FROM "PrintedBooks"
  ),
  matched AS (
    SELECT
      p.id,
      p.price,
      p.sold_out,
      p.is_published,
      p.publish_date,
      p.release_date,
      p.title_id,
      p.product_type,
      t.name            AS title_name,
      t.slug            AS title_slug,
      t.cover           AS title_cover,
      t.description     AS title_description,
      t.thesis          AS title_thesis,
      t.lit_form        AS title_lit_form,
      t.age_restriction AS title_age_restriction,
      t.first_release   AS title_first_release,
      (
        SELECT coalesce(array_agg(a.name ORDER BY a.name), '{}')
        FROM "Titles_Authors" ta
        JOIN "Authors" a ON a.id = ta.author_id
        WHERE ta.title_id = t.id
      ) AS author_names,
      count(*) OVER () AS total_count
    FROM all_products p
    INNER JOIN "Titles" t ON t.id = p.title_id
    WHERE p.is_published = true
      AND (title_ids IS NULL OR p.title_id = ANY(title_ids))
      AND (product_type_filter IS NULL OR p.product_type = product_type_filter)
      AND (search_term IS NULL OR search_term = ''
           OR t.name ILIKE '%' || search_term || '%')
      AND (author_name IS NULL OR author_name = ''
           OR EXISTS (
             SELECT 1 FROM "Titles_Authors" ta
             JOIN "Authors" a ON a.id = ta.author_id
             WHERE ta.title_id = t.id AND a.name = author_name
           ))
      AND (price_from IS NULL OR p.price >= price_from)
      AND (price_to   IS NULL OR p.price <= price_to)
    ORDER BY
      CASE WHEN sort_by = 'newest' THEN p.publish_date END DESC NULLS LAST,
      CASE WHEN sort_by = 'newest' THEN p.release_date END DESC NULLS LAST,
      CASE WHEN sort_by = 'title'  THEN t.name         END ASC  NULLS LAST,
      CASE WHEN sort_by = 'price-asc'  THEN p.price    END ASC  NULLS LAST,
      CASE WHEN sort_by = 'price-desc' THEN p.price    END DESC NULLS LAST,
      p.id ASC
    LIMIT result_limit
    OFFSET result_offset
  )
  SELECT * FROM matched;
$$;


-- ─── get_catalog_book_by_slug ─────────────────────────────────────────────────
-- Fetch all product-type rows for a given title slug, ordered by type preference
-- (EBook first as canonical). The API takes the first row for the detail page.

CREATE OR REPLACE FUNCTION get_catalog_book_by_slug(title_slug text)
RETURNS TABLE (
  id                    integer,
  price                 numeric,
  sold_out              boolean,
  is_published          boolean,
  publish_date          text,
  release_date          text,
  title_id              integer,
  product_type          text,
  title_name            text,
  title_slug            text,
  title_cover           text,
  title_description     text,
  title_thesis          text,
  title_lit_form        text,
  title_age_restriction integer,
  title_first_release   text,
  author_names          text[]
)
LANGUAGE sql
STABLE
AS $$
  WITH all_products AS (
    SELECT id, price, coalesce(sold_out, false) AS sold_out,
           coalesce(is_published, false) AS is_published,
           publish_date, release_date, title_id, 'Book2.0'::text AS product_type, 2 AS type_rank
    FROM "CardBooks"
    UNION ALL
    SELECT id, price, false, coalesce(is_published, false),
           publish_date, release_date, title_id, 'EBook'::text, 1
    FROM "Ebooks"
    UNION ALL
    SELECT id, price, false, coalesce(is_published, false),
           publish_date, release_date, title_id, 'AudioBook'::text, 3
    FROM "Audiobooks"
    UNION ALL
    SELECT id, price, coalesce(sold_out, false), coalesce(is_published, false),
           publish_date, release_date, title_id, 'PrintBook'::text, 4
    FROM "PrintedBooks"
  )
  SELECT
    p.id,
    p.price,
    p.sold_out,
    p.is_published,
    p.publish_date,
    p.release_date,
    p.title_id,
    p.product_type,
    t.name            AS title_name,
    t.slug            AS title_slug,
    t.cover           AS title_cover,
    t.description     AS title_description,
    t.thesis          AS title_thesis,
    t.lit_form        AS title_lit_form,
    t.age_restriction AS title_age_restriction,
    t.first_release   AS title_first_release,
    (
      SELECT coalesce(array_agg(a.name ORDER BY a.name), '{}')
      FROM "Titles_Authors" ta
      JOIN "Authors" a ON a.id = ta.author_id
      WHERE ta.title_id = t.id
    ) AS author_names
  FROM all_products p
  INNER JOIN "Titles" t ON t.id = p.title_id
  WHERE t.slug = title_slug
    AND p.is_published = true
  ORDER BY p.type_rank ASC;
$$;


-- ─── search_books (update) ────────────────────────────────────────────────────
-- Extend to search all product types, deduplicated per title (EBook preferred).
-- Adds product_type to the result for correct category normalization.

CREATE OR REPLACE FUNCTION search_books(
  search_term   text,
  result_limit  int DEFAULT 12,
  result_offset int DEFAULT 0
)
RETURNS TABLE (
  id                    integer,
  price                 numeric,
  sold_out              boolean,
  is_published          boolean,
  publish_date          text,
  release_date          text,
  title_id              integer,
  product_type          text,
  title_name            text,
  title_slug            text,
  title_cover           text,
  title_description     text,
  title_thesis          text,
  title_lit_form        text,
  title_age_restriction integer,
  title_first_release   text,
  author_names          text[],
  total_count           bigint
)
LANGUAGE sql
STABLE
AS $$
  WITH all_products AS (
    SELECT id, price, coalesce(sold_out, false) AS sold_out,
           coalesce(is_published, false) AS is_published,
           publish_date, release_date, title_id, 'Book2.0'::text AS product_type, 2 AS type_rank
    FROM "CardBooks"
    UNION ALL
    SELECT id, price, false, coalesce(is_published, false),
           publish_date, release_date, title_id, 'EBook'::text, 1
    FROM "Ebooks"
    UNION ALL
    SELECT id, price, false, coalesce(is_published, false),
           publish_date, release_date, title_id, 'AudioBook'::text, 3
    FROM "Audiobooks"
    UNION ALL
    SELECT id, price, coalesce(sold_out, false), coalesce(is_published, false),
           publish_date, release_date, title_id, 'PrintBook'::text, 4
    FROM "PrintedBooks"
  ),
  -- one row per title: prefer EBook, then CardBook, AudioBook, PrintBook
  deduped AS (
    SELECT DISTINCT ON (p.title_id)
      p.id, p.price, p.sold_out, p.is_published, p.publish_date, p.release_date,
      p.title_id, p.product_type
    FROM all_products p
    INNER JOIN "Titles" t ON t.id = p.title_id
    WHERE p.is_published = true
      AND (
        t.name ILIKE '%' || search_term || '%'
        OR EXISTS (
          SELECT 1 FROM "Titles_Authors" ta
          JOIN "Authors" a ON a.id = ta.author_id
          WHERE ta.title_id = t.id
            AND a.name ILIKE '%' || search_term || '%'
        )
      )
    ORDER BY p.title_id, p.type_rank ASC
  ),
  matched AS (
    SELECT
      d.id, d.price, d.sold_out, d.is_published, d.publish_date, d.release_date,
      d.title_id, d.product_type,
      t.name            AS title_name,
      t.slug            AS title_slug,
      t.cover           AS title_cover,
      t.description     AS title_description,
      t.thesis          AS title_thesis,
      t.lit_form        AS title_lit_form,
      t.age_restriction AS title_age_restriction,
      t.first_release   AS title_first_release,
      (
        SELECT coalesce(array_agg(a.name ORDER BY a.name), '{}')
        FROM "Titles_Authors" ta
        JOIN "Authors" a ON a.id = ta.author_id
        WHERE ta.title_id = t.id
      ) AS author_names,
      count(*) OVER () AS total_count
    FROM deduped d
    INNER JOIN "Titles" t ON t.id = d.title_id
    ORDER BY d.publish_date DESC NULLS LAST, d.release_date DESC NULLS LAST
    LIMIT result_limit
    OFFSET result_offset
  )
  SELECT * FROM matched;
$$;
