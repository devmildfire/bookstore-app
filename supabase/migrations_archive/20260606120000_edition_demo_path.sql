-- Edition demo assets.
-- Add a nullable demo_path column to each digital edition table so admins can
-- upload a sample file (PDF excerpt, audio clip) that appears as a "Демо-версия"
-- button on the storefront. Files live in the public `demos` bucket.

ALTER TABLE "Ebooks"
  ADD COLUMN IF NOT EXISTS demo_path text NULL;

ALTER TABLE "Audiobooks"
  ADD COLUMN IF NOT EXISTS demo_path text NULL;

ALTER TABLE "CardBooks"
  ADD COLUMN IF NOT EXISTS demo_path text NULL;

-- ─── demos bucket (public, 50 MB limit) ──────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'demos',
  'demos',
  true,
  52428800,
  ARRAY[
    'application/pdf',
    'application/epub+zip',
    'text/plain',
    'text/html',
    'audio/mpeg',
    'audio/mp4',
    'audio/ogg',
    'audio/webm',
    'audio/wav',
    'audio/x-m4a'
  ]
) ON CONFLICT (id) DO UPDATE SET
  public       = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Anyone can read demos (they are public samples).
CREATE POLICY demos_select ON storage.objects
  FOR SELECT USING (bucket_id = 'demos');

-- Only authenticated admins can upload / delete.
CREATE POLICY demos_insert ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'demos' AND auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY demos_update ON storage.objects
  FOR UPDATE USING (bucket_id = 'demos' AND auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY demos_delete ON storage.objects
  FOR DELETE USING (bucket_id = 'demos' AND auth.jwt() ->> 'role' = 'service_role');

-- ─── get_catalog_book_by_slug (include demo_path in edition_details) ─────────
CREATE OR REPLACE FUNCTION public.get_catalog_book_by_slug(title_slug text)
 RETURNS TABLE(id integer, price numeric, discount integer, sold_out boolean, is_published boolean, publish_date text, release_date text, title_id integer, product_type text, title_name text, title_slug text, title_cover text, title_cover_blur text, title_description text, title_thesis text, title_lit_form text, title_age_restriction integer, title_first_release text, title_is_compilation boolean, author_names text[], title_awards jsonb, edition_details jsonb, edition_workers jsonb, title_booktrailer jsonb, title_authors jsonb, title_contexts jsonb)
 LANGUAGE sql
 STABLE
AS $function$
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
        'packaging',          cb.packaging,
        'demo_path',          cb.demo_path
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
        'character_count', e.character_count,
        'demo_path',       e.demo_path
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
        'file_size_bytes',  a.file_size_bytes,
        'demo_path',        a.demo_path
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
    t.cover_blur      AS title_cover_blur,
    t.description     AS title_description,
    t.thesis          AS title_thesis,
    t.lit_form        AS title_lit_form,
    t.age_restriction AS title_age_restriction,
    t.first_release   AS title_first_release,
    t.is_compilation  AS title_is_compilation,
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
            'photo_blur', au.photo_blur,
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
    ) AS title_authors,
    (
      SELECT coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id',      bc.id,
            'heading', bc.heading,
            'body',    bc.body,
            'url',     bc.url
          )
          ORDER BY bc.sort_order ASC, bc.id ASC
        ),
        '[]'::jsonb
      )
      FROM "BookContexts" bc
      WHERE bc.title_id = t.id
    ) AS title_contexts
  FROM all_products p
  INNER JOIN "Titles" t ON t.id = p.title_id
  WHERE t.slug = title_slug
    AND p.is_published = true
    AND t.status = 'published'
  ORDER BY p.type_rank ASC;
$function$
;
