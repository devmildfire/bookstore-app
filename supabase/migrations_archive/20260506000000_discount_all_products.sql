-- Add discount column to all product tables (CardBooks already has it).
-- Update catalog RPCs to expose discount and has_multiple_products per title.

ALTER TABLE "Ebooks"       ADD COLUMN IF NOT EXISTS discount integer;
ALTER TABLE "Audiobooks"   ADD COLUMN IF NOT EXISTS discount integer;
ALTER TABLE "PrintedBooks" ADD COLUMN IF NOT EXISTS discount integer;


-- ─── get_catalog_books ────────────────────────────────────────────────────────
-- Adds discount (from the winning product row) and has_multiple_products
-- (true when a title has >1 published product type).

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
  WITH all_products AS (
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
      (
        SELECT coalesce(array_agg(a.name ORDER BY a.name), '{}')
        FROM "Titles_Authors" ta
        JOIN "Authors" a ON a.id = ta.author_id
        WHERE ta.title_id = t.id
      ) AS author_names,
      COUNT(*) OVER (PARTITION BY p.title_id) AS type_count
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
      CASE WHEN sort_by = 'newest' THEN d.publish_date END DESC NULLS LAST,
      CASE WHEN sort_by = 'newest' THEN d.release_date END DESC NULLS LAST,
      CASE WHEN sort_by = 'title'  THEN d.title_name    END ASC  NULLS LAST,
      CASE WHEN sort_by = 'price-asc'  THEN d.price     END ASC  NULLS LAST,
      CASE WHEN sort_by = 'price-desc' THEN d.price     END DESC NULLS LAST,
      d.title_id ASC
    LIMIT result_limit
    OFFSET result_offset
  )
  SELECT * FROM matched;
$$;


-- ─── get_catalog_book_by_slug ─────────────────────────────────────────────────
-- Returns all published product-type rows for a slug, now including discount.

CREATE OR REPLACE FUNCTION get_catalog_book_by_slug(title_slug text)
RETURNS TABLE (
  id                    integer,
  price                 numeric,
  discount              integer,
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
    SELECT id, price, discount, coalesce(sold_out, false) AS sold_out,
           coalesce(is_published, false) AS is_published,
           publish_date, release_date, title_id, 'Book2.0'::text AS product_type, 2 AS type_rank
    FROM "CardBooks"
    UNION ALL
    SELECT id, price, discount, false, coalesce(is_published, false),
           publish_date, release_date, title_id, 'EBook'::text, 1
    FROM "Ebooks"
    UNION ALL
    SELECT id, price, discount, false, coalesce(is_published, false),
           publish_date, release_date, title_id, 'AudioBook'::text, 3
    FROM "Audiobooks"
    UNION ALL
    SELECT id, price, discount, coalesce(sold_out, false), coalesce(is_published, false),
           publish_date, release_date, title_id, 'PrintBook'::text, 4
    FROM "PrintedBooks"
  )
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
