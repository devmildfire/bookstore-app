-- Per-edition detail fields + Workers entity.
-- Each edition table gets edition-specific columns; Workers is a flat catalog
-- of (name, job) rows joined per edition via 4 join tables.
-- The get_catalog_book_by_slug RPC is replaced to return:
--   edition_details (jsonb) — edition-specific fields keyed by name
--   edition_workers (jsonb) — credited people, ordered

-- ─── Workers catalog ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Workers" (
  id   serial PRIMARY KEY,
  name text NOT NULL,
  job  text NOT NULL,
  UNIQUE (name, job)
);

ALTER TABLE "Workers" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read workers" ON "Workers";
CREATE POLICY "Public read workers" ON "Workers" FOR SELECT USING (true);

-- ─── Per-edition columns ────────────────────────────────────────────────────

ALTER TABLE "PrintedBooks"
  ADD COLUMN IF NOT EXISTS format         text,
  ADD COLUMN IF NOT EXISTS page_count     integer,
  ADD COLUMN IF NOT EXISTS paper          text,
  ADD COLUMN IF NOT EXISTS cover_material text,
  ADD COLUMN IF NOT EXISTS binding        text,
  ADD COLUMN IF NOT EXISTS illustrations  text;

ALTER TABLE "CardBooks"
  ADD COLUMN IF NOT EXISTS format             text,
  ADD COLUMN IF NOT EXISTS printing_technique text,
  ADD COLUMN IF NOT EXISTS paper              text,
  ADD COLUMN IF NOT EXISTS packaging          text;

ALTER TABLE "Audiobooks"
  ADD COLUMN IF NOT EXISTS duration_seconds integer,
  ADD COLUMN IF NOT EXISTS file_size_bytes  bigint;

ALTER TABLE "Ebooks"
  ADD COLUMN IF NOT EXISTS formats         text[],
  ADD COLUMN IF NOT EXISTS character_count integer;

-- ─── Edition ↔ Worker join tables ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "PrintedBookWorkers" (
  id              serial  PRIMARY KEY,
  printed_book_id integer NOT NULL REFERENCES "PrintedBooks"(id) ON DELETE CASCADE,
  worker_id       integer NOT NULL REFERENCES "Workers"(id)      ON DELETE CASCADE,
  sort_order      integer NOT NULL DEFAULT 0,
  UNIQUE (printed_book_id, worker_id)
);

CREATE TABLE IF NOT EXISTS "CardBookWorkers" (
  id           serial  PRIMARY KEY,
  card_book_id integer NOT NULL REFERENCES "CardBooks"(id) ON DELETE CASCADE,
  worker_id    integer NOT NULL REFERENCES "Workers"(id)   ON DELETE CASCADE,
  sort_order   integer NOT NULL DEFAULT 0,
  UNIQUE (card_book_id, worker_id)
);

CREATE TABLE IF NOT EXISTS "AudiobookWorkers" (
  id           serial  PRIMARY KEY,
  audiobook_id integer NOT NULL REFERENCES "Audiobooks"(id) ON DELETE CASCADE,
  worker_id    integer NOT NULL REFERENCES "Workers"(id)    ON DELETE CASCADE,
  sort_order   integer NOT NULL DEFAULT 0,
  UNIQUE (audiobook_id, worker_id)
);

CREATE TABLE IF NOT EXISTS "EbookWorkers" (
  id         serial  PRIMARY KEY,
  ebook_id   integer NOT NULL REFERENCES "Ebooks"(id)  ON DELETE CASCADE,
  worker_id  integer NOT NULL REFERENCES "Workers"(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE (ebook_id, worker_id)
);

ALTER TABLE "PrintedBookWorkers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CardBookWorkers"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AudiobookWorkers"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EbookWorkers"       ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read printed book workers" ON "PrintedBookWorkers";
CREATE POLICY "Public read printed book workers" ON "PrintedBookWorkers" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read card book workers" ON "CardBookWorkers";
CREATE POLICY "Public read card book workers" ON "CardBookWorkers" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read audiobook workers" ON "AudiobookWorkers";
CREATE POLICY "Public read audiobook workers" ON "AudiobookWorkers" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read ebook workers" ON "EbookWorkers";
CREATE POLICY "Public read ebook workers" ON "EbookWorkers" FOR SELECT USING (true);

-- ─── RPC: get_catalog_book_by_slug ───────────────────────────────────────────
-- Returns one row per published edition of the title, ordered Print → Audio → 2.0 → EBook.
-- edition_details / edition_workers are JSON so we can keep one return shape across the 4 product types.

DROP FUNCTION IF EXISTS get_catalog_book_by_slug(text);

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
  author_names          text[],
  title_awards          jsonb,
  edition_details       jsonb,
  edition_workers       jsonb
)
LANGUAGE sql
STABLE
AS $$
  WITH all_products AS (
    SELECT
      cb.id, cb.price, cb.discount,
      coalesce(cb.sold_out, false) AS sold_out,
      coalesce(cb.is_published, false) AS is_published,
      cb.publish_date, cb.release_date, cb.title_id,
      'Book2.0'::text AS product_type,
      2 AS type_rank,
      jsonb_build_object(
        'format',             cb.format,
        'printing_technique', cb.printing_technique,
        'paper',              cb.paper,
        'packaging',          cb.packaging
      ) AS edition_details,
      (
        SELECT coalesce(jsonb_agg(jsonb_build_object('name', w.name, 'job', w.job) ORDER BY cbw.sort_order, w.name), '[]'::jsonb)
        FROM "CardBookWorkers" cbw
        JOIN "Workers" w ON w.id = cbw.worker_id
        WHERE cbw.card_book_id = cb.id
      ) AS edition_workers
    FROM "CardBooks" cb

    UNION ALL

    SELECT
      e.id, e.price, e.discount,
      false, coalesce(e.is_published, false),
      e.publish_date, e.release_date, e.title_id,
      'EBook'::text, 1,
      jsonb_build_object(
        'formats',         e.formats,
        'character_count', e.character_count
      ),
      (
        SELECT coalesce(jsonb_agg(jsonb_build_object('name', w.name, 'job', w.job) ORDER BY ew.sort_order, w.name), '[]'::jsonb)
        FROM "EbookWorkers" ew
        JOIN "Workers" w ON w.id = ew.worker_id
        WHERE ew.ebook_id = e.id
      )
    FROM "Ebooks" e

    UNION ALL

    SELECT
      a.id, a.price, a.discount,
      false, coalesce(a.is_published, false),
      a.publish_date, a.release_date, a.title_id,
      'AudioBook'::text, 3,
      jsonb_build_object(
        'duration_seconds', a.duration_seconds,
        'file_size_bytes',  a.file_size_bytes
      ),
      (
        SELECT coalesce(jsonb_agg(jsonb_build_object('name', w.name, 'job', w.job) ORDER BY abw.sort_order, w.name), '[]'::jsonb)
        FROM "AudiobookWorkers" abw
        JOIN "Workers" w ON w.id = abw.worker_id
        WHERE abw.audiobook_id = a.id
      )
    FROM "Audiobooks" a

    UNION ALL

    SELECT
      pb.id, pb.price, pb.discount,
      coalesce(pb.sold_out, false),
      coalesce(pb.is_published, false),
      pb.publish_date, pb.release_date, pb.title_id,
      'PrintBook'::text, 4,
      jsonb_build_object(
        'format',         pb.format,
        'page_count',     pb.page_count,
        'paper',          pb.paper,
        'cover_material', pb.cover_material,
        'binding',        pb.binding,
        'illustrations',  pb.illustrations
      ),
      (
        SELECT coalesce(jsonb_agg(jsonb_build_object('name', w.name, 'job', w.job) ORDER BY pbw.sort_order, w.name), '[]'::jsonb)
        FROM "PrintedBookWorkers" pbw
        JOIN "Workers" w ON w.id = pbw.worker_id
        WHERE pbw.printed_book_id = pb.id
      )
    FROM "PrintedBooks" pb
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
    ) AS author_names,
    (
      SELECT coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', a.id,
            'title', a.title,
            'image', a.image
          )
          ORDER BY ta.position ASC, a.position ASC, a.title ASC
        ),
        '[]'::jsonb
      )
      FROM "Titles_Awards" ta
      JOIN "Awards" a ON a.id = ta.award_id
      WHERE ta.title_id = t.id
        AND a.is_active = true
    ) AS title_awards,
    p.edition_details,
    p.edition_workers
  FROM all_products p
  INNER JOIN "Titles" t ON t.id = p.title_id
  WHERE t.slug = title_slug
    AND p.is_published = true
  ORDER BY p.type_rank ASC;
$$;
