-- Editor-curated list of similar books per title.
--
-- Each title can declare any number of other titles as "similar" via
-- TitleSimilarTitles. The list is ordered by `position` (editor choice).
-- A title cannot be similar to itself (CHECK constraint).

CREATE TABLE "TitleSimilarTitles" (
  id                serial   PRIMARY KEY,
  title_id          integer  NOT NULL REFERENCES "Titles"(id) ON DELETE CASCADE,
  similar_title_id  integer  NOT NULL REFERENCES "Titles"(id) ON DELETE CASCADE,
  position          integer  NOT NULL DEFAULT 0,
  UNIQUE (title_id, similar_title_id),
  CHECK (title_id <> similar_title_id)
);

CREATE INDEX idx_title_similar_titles_title_id
  ON "TitleSimilarTitles"(title_id);

ALTER TABLE "TitleSimilarTitles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read similar titles"
  ON "TitleSimilarTitles" FOR SELECT USING (true);


-- ─── RPC: get_similar_books ──────────────────────────────────────────────────
-- Returns one canonical product row per similar title (EBook preferred, then
-- CardBook, AudioBook, PrintBook), ordered by editor `position`.
-- Output shape matches `BookServerRow` so the same `normalizeBook` works.

CREATE OR REPLACE FUNCTION get_similar_books(p_title_id integer)
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
  has_multiple_products   boolean
)
LANGUAGE sql
STABLE
AS $$
  WITH similar_titles AS (
    SELECT similar_title_id AS title_id, position
    FROM "TitleSimilarTitles"
    WHERE title_id = p_title_id
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
      COUNT(*) OVER (PARTITION BY p.title_id) AS type_count
    FROM all_products p
    INNER JOIN similar_titles s ON s.title_id = p.title_id
    INNER JOIN "Titles" t ON t.id = p.title_id
    CROSS JOIN LATERAL (
      SELECT coalesce(array_agg(a.name ORDER BY a.name), '{}') AS author_names
      FROM "Titles_Authors" ta
      JOIN "Authors" a ON a.id = ta.author_id
      WHERE ta.title_id = t.id
    ) authors
    WHERE p.is_published = true
  ),
  deduped AS (
    SELECT DISTINCT ON (f.title_id)
      f.id, f.price, f.discount, f.sold_out, f.is_published, f.publish_date,
      f.release_date, f.title_id, f.product_type, f.type_rank,
      f.title_name, f.title_slug, f.title_cover, f.title_description,
      f.title_thesis, f.title_lit_form, f.title_age_restriction,
      f.title_first_release, f.author_names, f.type_count
    FROM filtered f
    ORDER BY
      f.title_id,
      f.type_rank ASC,
      f.publish_date DESC NULLS LAST,
      f.release_date DESC NULLS LAST
  )
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
    (d.type_count > 1) AS has_multiple_products
  FROM deduped d
  INNER JOIN similar_titles s ON s.title_id = d.title_id
  ORDER BY s.position ASC;
$$;
