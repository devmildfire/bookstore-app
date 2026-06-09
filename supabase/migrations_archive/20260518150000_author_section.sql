-- Author section data:
--   * authors storage bucket for round portrait photos (filenames stored
--     in Authors.photo, mirroring the covers/{slug}.jpg pattern)
--   * AuthorContacts table with a channel enum so each author can have
--     multiple typed social/contact links
--   * get_catalog_book_by_slug RPC extended to return all linked authors
--     with their full profile + contacts as title_authors jsonb

-- ─── Storage bucket ──────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'authors',
  'authors',
  true,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read author photos" ON storage.objects;
CREATE POLICY "Public read author photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'authors');

-- ─── Channel enum ────────────────────────────────────────────────────────────
-- Matches the Figma icon set for the "Контакты" row.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'author_contact_channel') THEN
    CREATE TYPE author_contact_channel AS ENUM (
      'telegram',
      'instagram',
      'facebook',
      'twitter',
      'email'
    );
  END IF;
END $$;

-- ─── AuthorContacts table ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "AuthorContacts" (
  id         serial  PRIMARY KEY,
  author_id  integer NOT NULL REFERENCES "Authors"(id) ON DELETE CASCADE,
  channel    author_contact_channel NOT NULL,
  url        text    NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE (author_id, channel)
);

ALTER TABLE "AuthorContacts" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read author contacts" ON "AuthorContacts";
CREATE POLICY "Public read author contacts"
  ON "AuthorContacts" FOR SELECT USING (true);

-- ─── RPC: get_catalog_book_by_slug (add title_authors) ──────────────────────
-- Returns the full Author profile + their contacts for every linked author,
-- ordered by the Titles_Authors.position (primary author first).

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
  title_booktrailer     jsonb,
  title_authors         jsonb
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
    ) AS title_booktrailer,
    (
      SELECT coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id',         au.id,
            'name',       au.name,
            'photo',      au.photo,
            'city',       au.city,
            'birth_date', au.birth_date,
            'death_date', au.death_date,
            'phrase',     au.phrase,
            'bio',        au.bio,
            'contacts',   (
              SELECT coalesce(
                jsonb_agg(jsonb_build_object('channel', ac.channel, 'url', ac.url) ORDER BY ac.sort_order),
                '[]'::jsonb
              )
              FROM "AuthorContacts" ac
              WHERE ac.author_id = au.id
            )
          )
          ORDER BY ta_inner.id ASC, au.name ASC
        ),
        '[]'::jsonb
      )
      FROM "Titles_Authors" ta_inner
      JOIN "Authors" au ON au.id = ta_inner.author_id
      WHERE ta_inner.title_id = t.id
    ) AS title_authors
  FROM all_products p
  INNER JOIN "Titles" t ON t.id = p.title_id
  WHERE t.slug = title_slug
    AND p.is_published = true
  ORDER BY p.type_rank ASC;
$$;
