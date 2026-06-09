-- Booktrailer entity + storage bucket.
-- Existence of a Booktrailers row for a title means a promotional video
-- is available. Files are stored under booktrailers/{title-slug}/ as:
--   video.mp4   (H.264 + AAC, universal fallback)
--   video.webm  (VP9, smaller for browsers that support it)
--   poster.jpg  (still frame shown before play; optional, gated by has_poster)
-- URLs are derived at runtime via getBooktrailerUrls() in src/lib/storage.ts.

-- ─── Booktrailers table ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Booktrailers" (
  id         serial  PRIMARY KEY,
  title_id   integer NOT NULL UNIQUE REFERENCES "Titles"(id) ON DELETE CASCADE,
  has_poster boolean NOT NULL DEFAULT true
);

ALTER TABLE "Booktrailers" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read booktrailers" ON "Booktrailers";
CREATE POLICY "Public read booktrailers"
  ON "Booktrailers" FOR SELECT USING (true);

-- ─── Storage bucket ──────────────────────────────────────────────────────────
-- Public, generous file-size cap to allow short promotional videos. We accept
-- both MP4 and WebM container types plus the typical poster image formats.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'booktrailers',
  'booktrailers',
  true,
  104857600, -- 100 MB
  ARRAY['video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read booktrailers storage" ON storage.objects;
CREATE POLICY "Public read booktrailers storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'booktrailers');

-- ─── RPC: get_catalog_book_by_slug (re-create with booktrailer field) ───────

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
  edition_workers       jsonb,
  title_booktrailer     jsonb
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
    p.edition_workers,
    (
      SELECT jsonb_build_object('has_poster', bt.has_poster)
      FROM "Booktrailers" bt
      WHERE bt.title_id = t.id
    ) AS title_booktrailer
  FROM all_products p
  INNER JOIN "Titles" t ON t.id = p.title_id
  WHERE t.slug = title_slug
    AND p.is_published = true
  ORDER BY p.type_rank ASC;
$$;
