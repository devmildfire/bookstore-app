-- Admin panel Phase 4 — Title publish lifecycle.
--   • Titles.status: draft | published | archived (default published).
--   • Existing rows backfill to 'published' via the NOT NULL DEFAULT.
--   • Public catalog RPCs filter to status='published' so drafts/archived
--     titles never appear on the storefront. Admin reads bypass via the
--     service-role client (getAdminBook/getAdminBooks).

ALTER TABLE "Titles"
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published';

ALTER TABLE "Titles" DROP CONSTRAINT IF EXISTS titles_status_check;
ALTER TABLE "Titles" ADD CONSTRAINT titles_status_check
  CHECK (status IN ('draft', 'published', 'archived'));

CREATE INDEX IF NOT EXISTS titles_status_idx ON "Titles" (status);

-- ─── get_catalog_books (filter published titles) ───
CREATE OR REPLACE FUNCTION public.get_catalog_books(result_limit integer DEFAULT 12, result_offset integer DEFAULT 0, search_term text DEFAULT NULL::text, product_type_filter text DEFAULT NULL::text, author_name text DEFAULT NULL::text, price_from numeric DEFAULT NULL::numeric, price_to numeric DEFAULT NULL::numeric, sort_by text DEFAULT 'year-desc'::text, title_ids integer[] DEFAULT NULL::integer[], product_type_filters text[] DEFAULT NULL::text[], author_names_filter text[] DEFAULT NULL::text[], year_filters text[] DEFAULT NULL::text[])
 RETURNS TABLE(id integer, price numeric, discount integer, sold_out boolean, is_published boolean, publish_date text, release_date text, title_id integer, product_type text, title_name text, title_slug text, title_cover text, title_cover_blur text, title_description text, title_thesis text, title_lit_form text, title_age_restriction integer, title_first_release text, author_names text[], total_count bigint, has_multiple_products boolean)
 LANGUAGE sql
 STABLE
AS $function$
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
      t.cover_blur      AS title_cover_blur,
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
      AND t.status = 'published'
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
      d.title_cover_blur,
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
      CASE WHEN sort_by = 'newest' THEN d.title_first_release END DESC NULLS LAST,
      CASE WHEN sort_by = 'year-desc' THEN d.title_first_release END DESC NULLS LAST,
      CASE WHEN sort_by = 'year-asc' THEN d.title_first_release END ASC NULLS LAST,
      CASE WHEN sort_by = 'title' THEN d.title_name END ASC NULLS LAST,
      CASE WHEN sort_by = 'author-asc' THEN d.first_author_surname END ASC NULLS LAST,
      CASE WHEN sort_by = 'author-desc' THEN d.first_author_surname END DESC NULLS LAST,
      CASE WHEN sort_by = 'price-asc' THEN d.price END ASC NULLS LAST,
      CASE WHEN sort_by = 'price-desc' THEN d.price END DESC NULLS LAST,
      d.title_id ASC
    LIMIT result_limit
    OFFSET result_offset
  )
  SELECT * FROM matched;
$function$

;

-- ─── get_similar_books (filter published titles) ───
CREATE OR REPLACE FUNCTION public.get_similar_books(p_title_id integer)
 RETURNS TABLE(id integer, price numeric, discount integer, sold_out boolean, is_published boolean, publish_date text, release_date text, title_id integer, product_type text, title_name text, title_slug text, title_cover text, title_cover_blur text, title_description text, title_thesis text, title_lit_form text, title_age_restriction integer, title_first_release text, author_names text[], has_multiple_products boolean)
 LANGUAGE sql
 STABLE
AS $function$
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
      t.cover_blur      AS title_cover_blur,
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
      AND t.status = 'published'
  ),
  deduped AS (
    SELECT DISTINCT ON (f.title_id)
      f.id, f.price, f.discount, f.sold_out, f.is_published, f.publish_date,
      f.release_date, f.title_id, f.product_type, f.type_rank,
      f.title_name, f.title_slug, f.title_cover, f.title_cover_blur,
      f.title_description, f.title_thesis, f.title_lit_form, f.title_age_restriction,
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
    d.title_cover_blur,
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
$function$

;

-- ─── search_books (filter published titles) ───
CREATE OR REPLACE FUNCTION public.search_books(search_term text, result_limit integer DEFAULT 12, result_offset integer DEFAULT 0)
 RETURNS TABLE(id integer, price numeric, sold_out boolean, is_published boolean, publish_date text, release_date text, title_id integer, title_name text, title_slug text, title_cover text, title_cover_blur text, title_description text, title_thesis text, title_lit_form text, title_age_restriction integer, title_first_release text, author_names text[], total_count bigint)
 LANGUAGE sql
 STABLE
AS $function$
  WITH matched_books AS (
    SELECT
      cb.id,
      cb.price,
      cb.sold_out,
      cb.is_published,
      cb.publish_date,
      cb.release_date,
      cb.title_id,
      t.name AS title_name,
      t.slug AS title_slug,
      t.cover AS title_cover,
      t.cover_blur AS title_cover_blur,
      t.description AS title_description,
      t.thesis AS title_thesis,
      t.lit_form AS title_lit_form,
      t.age_restriction AS title_age_restriction,
      t.first_release AS title_first_release,
      (
        SELECT coalesce(array_agg(a.name ORDER BY a.name), '{}')
        FROM "Titles_Authors" ta
        JOIN "Authors" a ON a.id = ta.author_id
        WHERE ta.title_id = t.id
      ) AS author_names,
      count(*) OVER () AS total_count
    FROM "CardBooks" cb
    INNER JOIN "Titles" t ON t.id = cb.title_id
    WHERE cb.is_published = true
      AND t.status = 'published'
      AND (
        t.name ILIKE '%' || search_term || '%'
        OR
        EXISTS (
          SELECT 1
          FROM "Titles_Authors" ta
          JOIN "Authors" a ON a.id = ta.author_id
          WHERE ta.title_id = t.id
            AND a.name ILIKE '%' || search_term || '%'
        )
      )
    ORDER BY cb.publish_date DESC NULLS LAST, cb.release_date DESC NULLS LAST
    LIMIT result_limit
    OFFSET result_offset
  )
  SELECT
    id,
    price,
    sold_out,
    is_published,
    publish_date,
    release_date,
    title_id,
    title_name,
    title_slug,
    title_cover,
    title_cover_blur,
    title_description,
    title_thesis,
    title_lit_form,
    title_age_restriction,
    title_first_release,
    author_names,
    total_count
  FROM matched_books;
$function$

;

-- ─── get_catalog_book_by_slug (filter published titles) ───
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
