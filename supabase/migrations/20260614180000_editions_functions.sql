-- Editions consolidation, Phase D (audit F5): rewrite every function that branched over
-- the four edition tables to read the single Editions table. The catalog `all_products`
-- 4-way UNION ALL collapses to a plain SELECT; search_books is fixed to cover all kinds
-- (was CardBooks-only). Type-rank order preserved: EBook 1, Book2.0 2, AudioBook 3,
-- PrintBook 4. edition_details = details jsonb + demo_path (matches the old emitted shape).

-- ── default_edition_for_title ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.default_edition_for_title(p_title_id integer) RETURNS text
  LANGUAGE sql STABLE SET search_path TO 'public'
AS $$
  SELECT e.kind || '-' || e.id
  FROM "Editions" e
  WHERE e.title_id = p_title_id
  ORDER BY CASE e.kind
    WHEN 'EBook' THEN 1 WHEN 'AudioBook' THEN 2 WHEN 'Book2.0' THEN 3 WHEN 'PrintBook' THEN 4 ELSE 5 END,
    e.id
  LIMIT 1;
$$;

-- ── box_set_is_physical ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.box_set_is_physical(p_box_set_id integer) RETURNS boolean
  LANGUAGE sql STABLE SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM "BoxSetBooks" bsb
    WHERE bsb.box_set_id = p_box_set_id
      AND (
        bsb.product_id LIKE 'PrintBook-%'
        OR bsb.product_id LIKE 'Book2.0-%'
        OR (bsb.product_id IS NULL AND EXISTS (
          SELECT 1 FROM "Editions" e
          WHERE e.title_id = bsb.title_id AND e.kind IN ('PrintBook', 'Book2.0')
        ))
      )
  );
$$;

-- ── get_cart_with_title_ids ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_cart_with_title_ids()
  RETURNS TABLE(cart_id text, title_id integer)
  LANGUAGE sql STABLE SET search_path TO 'public'
AS $$
  WITH cart_rows AS (
    SELECT id, category, NULLIF(SPLIT_PART(id, '-', 2), '')::integer AS edition_id
    FROM "Cart"
  )
  SELECT cr.id, e.title_id
  FROM cart_rows cr
  JOIN "Editions" e ON e.id = cr.edition_id AND e.kind = cr.category::text;
$$;

-- ── get_catalog_books ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_catalog_books(result_limit integer DEFAULT 12, result_offset integer DEFAULT 0, search_term text DEFAULT NULL::text, product_type_filter text DEFAULT NULL::text, author_name text DEFAULT NULL::text, price_from numeric DEFAULT NULL::numeric, price_to numeric DEFAULT NULL::numeric, sort_by text DEFAULT 'year-desc'::text, title_ids integer[] DEFAULT NULL::integer[], product_type_filters text[] DEFAULT NULL::text[], author_names_filter text[] DEFAULT NULL::text[], year_filters text[] DEFAULT NULL::text[])
  RETURNS TABLE(id integer, price numeric, discount integer, sold_out boolean, is_published boolean, publish_date text, release_date text, title_id integer, product_type text, title_name text, title_slug text, title_cover text, title_cover_blur text, title_description text, title_thesis text, title_lit_form text, title_age_restriction integer, title_first_release text, author_names text[], total_count bigint, has_multiple_products boolean)
  LANGUAGE sql STABLE
AS $$
  WITH filter_params AS (
    SELECT
      CASE WHEN product_type_filters IS NOT NULL AND cardinality(product_type_filters) > 0 THEN product_type_filters
           WHEN product_type_filter IS NOT NULL AND product_type_filter <> '' THEN ARRAY[product_type_filter]
           ELSE NULL::text[] END AS product_types,
      CASE WHEN author_names_filter IS NOT NULL AND cardinality(author_names_filter) > 0 THEN author_names_filter
           WHEN author_name IS NOT NULL AND author_name <> '' THEN ARRAY[author_name]
           ELSE NULL::text[] END AS authors,
      CASE WHEN year_filters IS NOT NULL AND cardinality(year_filters) > 0 THEN year_filters
           ELSE NULL::text[] END AS years
  ),
  all_products AS (
    SELECT e.id, e.price, e.discount, coalesce(e.sold_out, false) AS sold_out,
           coalesce(e.is_published, false) AS is_published,
           e.publish_date, e.release_date, e.title_id, e.kind AS product_type,
           CASE e.kind WHEN 'EBook' THEN 1 WHEN 'Book2.0' THEN 2 WHEN 'AudioBook' THEN 3 WHEN 'PrintBook' THEN 4 END AS type_rank
    FROM "Editions" e
  ),
  filtered AS (
    SELECT p.id, p.price, p.discount, p.sold_out, p.is_published, p.publish_date, p.release_date,
           p.title_id, p.product_type, p.type_rank,
           t.name AS title_name, t.slug AS title_slug, t.cover AS title_cover, t.cover_blur AS title_cover_blur,
           t.description AS title_description, t.thesis AS title_thesis, t.lit_form AS title_lit_form,
           t.age_restriction AS title_age_restriction, t.first_release AS title_first_release,
           authors.author_names, authors.first_author_surname,
           COUNT(*) OVER (PARTITION BY p.title_id) AS type_count
    FROM all_products p
    INNER JOIN "Titles" t ON t.id = p.title_id
    CROSS JOIN filter_params fp
    CROSS JOIN LATERAL (
      SELECT coalesce(array_agg(a.name ORDER BY a.name), '{}') AS author_names,
             lower(regexp_replace((array_agg(a.name ORDER BY a.name))[1], '^.*[[:space:]]+', '')) AS first_author_surname
      FROM "Titles_Authors" ta JOIN "Authors" a ON a.id = ta.author_id WHERE ta.title_id = t.id
    ) authors
    WHERE p.is_published = true AND t.status = 'published'
      AND (title_ids IS NULL OR p.title_id = ANY(title_ids))
      AND (fp.product_types IS NULL OR p.product_type = ANY(fp.product_types))
      AND (search_term IS NULL OR search_term = '' OR t.name ILIKE '%' || search_term || '%')
      AND (fp.authors IS NULL OR EXISTS (
        SELECT 1 FROM "Titles_Authors" ta JOIN "Authors" a ON a.id = ta.author_id
        WHERE ta.title_id = t.id AND a.name = ANY(fp.authors)))
      AND (fp.years IS NULL OR left(t.first_release, 4) = ANY(fp.years))
      AND (price_from IS NULL OR p.price >= price_from)
      AND (price_to IS NULL OR p.price <= price_to)
  ),
  deduped AS (
    SELECT DISTINCT ON (f.title_id) f.*
    FROM filtered f
    ORDER BY f.title_id, f.type_rank ASC, f.publish_date DESC NULLS LAST, f.release_date DESC NULLS LAST
  ),
  matched AS (
    SELECT d.id, d.price, d.discount, d.sold_out, d.is_published, d.publish_date, d.release_date,
           d.title_id, d.product_type, d.title_name, d.title_slug, d.title_cover, d.title_cover_blur,
           d.title_description, d.title_thesis, d.title_lit_form, d.title_age_restriction, d.title_first_release,
           d.author_names, count(*) OVER () AS total_count, (d.type_count > 1) AS has_multiple_products
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
    LIMIT result_limit OFFSET result_offset
  )
  SELECT * FROM matched;
$$;

-- ── get_similar_books ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_similar_books(p_title_id integer)
  RETURNS TABLE(id integer, price numeric, discount integer, sold_out boolean, is_published boolean, publish_date text, release_date text, title_id integer, product_type text, title_name text, title_slug text, title_cover text, title_cover_blur text, title_description text, title_thesis text, title_lit_form text, title_age_restriction integer, title_first_release text, author_names text[], has_multiple_products boolean)
  LANGUAGE sql STABLE
AS $$
  WITH similar_titles AS (
    SELECT similar_title_id AS title_id, position FROM "TitleSimilarTitles" WHERE title_id = p_title_id
  ),
  all_products AS (
    SELECT e.id, e.price, e.discount, coalesce(e.sold_out, false) AS sold_out,
           coalesce(e.is_published, false) AS is_published, e.publish_date, e.release_date, e.title_id,
           e.kind AS product_type,
           CASE e.kind WHEN 'EBook' THEN 1 WHEN 'Book2.0' THEN 2 WHEN 'AudioBook' THEN 3 WHEN 'PrintBook' THEN 4 END AS type_rank
    FROM "Editions" e
  ),
  filtered AS (
    SELECT p.id, p.price, p.discount, p.sold_out, p.is_published, p.publish_date, p.release_date,
           p.title_id, p.product_type, p.type_rank,
           t.name AS title_name, t.slug AS title_slug, t.cover AS title_cover, t.cover_blur AS title_cover_blur,
           t.description AS title_description, t.thesis AS title_thesis, t.lit_form AS title_lit_form,
           t.age_restriction AS title_age_restriction, t.first_release AS title_first_release,
           authors.author_names, COUNT(*) OVER (PARTITION BY p.title_id) AS type_count
    FROM all_products p
    INNER JOIN similar_titles s ON s.title_id = p.title_id
    INNER JOIN "Titles" t ON t.id = p.title_id
    CROSS JOIN LATERAL (
      SELECT coalesce(array_agg(a.name ORDER BY a.name), '{}') AS author_names
      FROM "Titles_Authors" ta JOIN "Authors" a ON a.id = ta.author_id WHERE ta.title_id = t.id
    ) authors
    WHERE p.is_published = true AND t.status = 'published'
  ),
  deduped AS (
    SELECT DISTINCT ON (f.title_id)
      f.id, f.price, f.discount, f.sold_out, f.is_published, f.publish_date, f.release_date, f.title_id,
      f.product_type, f.type_rank, f.title_name, f.title_slug, f.title_cover, f.title_cover_blur,
      f.title_description, f.title_thesis, f.title_lit_form, f.title_age_restriction, f.title_first_release,
      f.author_names, f.type_count
    FROM filtered f
    ORDER BY f.title_id, f.type_rank ASC, f.publish_date DESC NULLS LAST, f.release_date DESC NULLS LAST
  )
  SELECT d.id, d.price, d.discount, d.sold_out, d.is_published, d.publish_date, d.release_date, d.title_id,
         d.product_type, d.title_name, d.title_slug, d.title_cover, d.title_cover_blur, d.title_description,
         d.title_thesis, d.title_lit_form, d.title_age_restriction, d.title_first_release, d.author_names,
         (d.type_count > 1) AS has_multiple_products
  FROM deduped d
  INNER JOIN similar_titles s ON s.title_id = d.title_id
  ORDER BY s.position ASC;
$$;

-- ── get_catalog_book_by_slug ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_catalog_book_by_slug(title_slug text)
  RETURNS TABLE(id integer, price numeric, discount integer, sold_out boolean, is_published boolean, publish_date text, release_date text, title_id integer, product_type text, title_name text, title_slug text, title_cover text, title_cover_blur text, title_description text, title_thesis text, title_lit_form text, title_age_restriction integer, title_first_release text, title_is_compilation boolean, author_names text[], title_awards jsonb, edition_details jsonb, edition_workers jsonb, title_booktrailer jsonb, title_authors jsonb, title_contexts jsonb)
  LANGUAGE sql STABLE
AS $$
  WITH all_products AS (
    SELECT e.id, e.price, e.discount, coalesce(e.sold_out, false) AS sold_out,
           coalesce(e.is_published, false) AS is_published, e.publish_date, e.release_date, e.title_id,
           e.kind AS product_type,
           CASE e.kind WHEN 'EBook' THEN 1 WHEN 'Book2.0' THEN 2 WHEN 'AudioBook' THEN 3 WHEN 'PrintBook' THEN 4 END AS type_rank,
           (e.details || jsonb_build_object('demo_path', e.demo_path)) AS edition_details,
           (
             SELECT coalesce(jsonb_agg(jsonb_build_object('name', w.name, 'job', w.job) ORDER BY ew.sort_order, w.name), '[]'::jsonb)
             FROM "EditionWorkers" ew JOIN "Workers" w ON w.id = ew.worker_id WHERE ew.edition_id = e.id
           ) AS edition_workers
    FROM "Editions" e
  )
  SELECT
    p.id, p.price, p.discount, p.sold_out, p.is_published, p.publish_date, p.release_date, p.title_id, p.product_type,
    t.name AS title_name, t.slug AS title_slug, t.cover AS title_cover, t.cover_blur AS title_cover_blur,
    t.description AS title_description, t.thesis AS title_thesis, t.lit_form AS title_lit_form,
    t.age_restriction AS title_age_restriction, t.first_release AS title_first_release, t.is_compilation AS title_is_compilation,
    (SELECT coalesce(array_agg(a.name ORDER BY a.name), '{}') FROM "Titles_Authors" ta JOIN "Authors" a ON a.id = ta.author_id WHERE ta.title_id = t.id) AS author_names,
    (SELECT coalesce(jsonb_agg(jsonb_build_object('id', a.id, 'title', a.title, 'image', a.image) ORDER BY ta.position ASC, a.position ASC, a.title ASC), '[]'::jsonb)
     FROM "Titles_Awards" ta JOIN "Awards" a ON a.id = ta.award_id WHERE ta.title_id = t.id AND a.is_active = true) AS title_awards,
    p.edition_details, p.edition_workers,
    (SELECT jsonb_build_object('has_poster', bt.has_poster) FROM "Booktrailers" bt WHERE bt.title_id = t.id) AS title_booktrailer,
    (SELECT coalesce(jsonb_agg(jsonb_build_object('id', au.id, 'name', au.name, 'photo', au.photo, 'photo_blur', au.photo_blur, 'city', au.city, 'birth_date', au.birth_date, 'death_date', au.death_date, 'phrase', au.phrase, 'bio', au.bio,
       'contacts', (SELECT coalesce(jsonb_agg(jsonb_build_object('channel', ac.channel, 'url', ac.url) ORDER BY ac.sort_order), '[]'::jsonb) FROM "AuthorContacts" ac WHERE ac.author_id = au.id)
     ) ORDER BY ta_inner.id ASC, au.name ASC), '[]'::jsonb)
     FROM "Titles_Authors" ta_inner JOIN "Authors" au ON au.id = ta_inner.author_id WHERE ta_inner.title_id = t.id) AS title_authors,
    (SELECT coalesce(jsonb_agg(jsonb_build_object('id', bc.id, 'heading', bc.heading, 'body', bc.body, 'url', bc.url) ORDER BY bc.sort_order ASC, bc.id ASC), '[]'::jsonb)
     FROM "BookContexts" bc WHERE bc.title_id = t.id) AS title_contexts
  FROM all_products p
  INNER JOIN "Titles" t ON t.id = p.title_id
  WHERE t.slug = title_slug AND p.is_published = true AND t.status = 'published'
  ORDER BY p.type_rank ASC;
$$;

-- ── search_books (fixed: all kinds, catalog-shaped return) ───────────────────────
DROP FUNCTION IF EXISTS public.search_books(text, integer, integer);
CREATE FUNCTION public.search_books(search_term text, result_limit integer DEFAULT 12, result_offset integer DEFAULT 0)
  RETURNS TABLE(id integer, price numeric, discount integer, sold_out boolean, is_published boolean, publish_date text, release_date text, title_id integer, product_type text, title_name text, title_slug text, title_cover text, title_cover_blur text, title_description text, title_thesis text, title_lit_form text, title_age_restriction integer, title_first_release text, author_names text[], total_count bigint, has_multiple_products boolean)
  LANGUAGE sql STABLE
AS $$
  WITH all_products AS (
    SELECT e.id, e.price, e.discount, coalesce(e.sold_out, false) AS sold_out,
           coalesce(e.is_published, false) AS is_published, e.publish_date, e.release_date, e.title_id,
           e.kind AS product_type,
           CASE e.kind WHEN 'EBook' THEN 1 WHEN 'Book2.0' THEN 2 WHEN 'AudioBook' THEN 3 WHEN 'PrintBook' THEN 4 END AS type_rank
    FROM "Editions" e
  ),
  filtered AS (
    SELECT p.*, t.name AS title_name, t.slug AS title_slug, t.cover AS title_cover, t.cover_blur AS title_cover_blur,
           t.description AS title_description, t.thesis AS title_thesis, t.lit_form AS title_lit_form,
           t.age_restriction AS title_age_restriction, t.first_release AS title_first_release,
           authors.author_names, COUNT(*) OVER (PARTITION BY p.title_id) AS type_count
    FROM all_products p
    INNER JOIN "Titles" t ON t.id = p.title_id
    CROSS JOIN LATERAL (
      SELECT coalesce(array_agg(a.name ORDER BY a.name), '{}') AS author_names
      FROM "Titles_Authors" ta JOIN "Authors" a ON a.id = ta.author_id WHERE ta.title_id = t.id
    ) authors
    WHERE p.is_published = true AND t.status = 'published'
      AND (
        t.name ILIKE '%' || search_term || '%'
        OR EXISTS (SELECT 1 FROM "Titles_Authors" ta JOIN "Authors" a ON a.id = ta.author_id
                   WHERE ta.title_id = t.id AND a.name ILIKE '%' || search_term || '%')
      )
  ),
  deduped AS (
    SELECT DISTINCT ON (f.title_id) f.*
    FROM filtered f
    ORDER BY f.title_id, f.type_rank ASC, f.publish_date DESC NULLS LAST, f.release_date DESC NULLS LAST
  )
  SELECT d.id, d.price, d.discount, d.sold_out, d.is_published, d.publish_date, d.release_date, d.title_id,
         d.product_type, d.title_name, d.title_slug, d.title_cover, d.title_cover_blur, d.title_description,
         d.title_thesis, d.title_lit_form, d.title_age_restriction, d.title_first_release, d.author_names,
         count(*) OVER () AS total_count, (d.type_count > 1) AS has_multiple_products
  FROM deduped d
  ORDER BY d.publish_date DESC NULLS LAST, d.release_date DESC NULLS LAST
  LIMIT result_limit OFFSET result_offset;
$$;

-- ── get_catalog_facets ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_catalog_facets()
  RETURNS jsonb
  LANGUAGE sql STABLE SET search_path TO 'public'
AS $$
  WITH published_titles AS (
    SELECT t.id, t.first_release
    FROM "Titles" t
    WHERE t.status = 'published'
      AND EXISTS (SELECT 1 FROM "Editions" e WHERE e.title_id = t.id AND e.is_published)
  )
  SELECT jsonb_build_object(
    'authors', (
      SELECT coalesce(jsonb_agg(DISTINCT a.name), '[]'::jsonb)
      FROM published_titles pt JOIN "Titles_Authors" ta ON ta.title_id = pt.id JOIN "Authors" a ON a.id = ta.author_id
    ),
    'years', (
      SELECT coalesce(jsonb_agg(DISTINCT left(pt.first_release, 4)), '[]'::jsonb)
      FROM published_titles pt WHERE pt.first_release IS NOT NULL AND pt.first_release <> ''
    ),
    'productTypes', (
      SELECT coalesce(jsonb_agg(kind), '[]'::jsonb) FROM (
        SELECT 'PrintBook' AS kind WHERE EXISTS (SELECT 1 FROM "Editions" e JOIN published_titles p ON p.id = e.title_id WHERE e.kind='PrintBook' AND e.is_published)
        UNION SELECT 'EBook'    WHERE EXISTS (SELECT 1 FROM "Editions" e JOIN published_titles p ON p.id = e.title_id WHERE e.kind='EBook' AND e.is_published)
        UNION SELECT 'AudioBook' WHERE EXISTS (SELECT 1 FROM "Editions" e JOIN published_titles p ON p.id = e.title_id WHERE e.kind='AudioBook' AND e.is_published)
        UNION SELECT 'Book2.0'  WHERE EXISTS (SELECT 1 FROM "Editions" e JOIN published_titles p ON p.id = e.title_id WHERE e.kind='Book2.0' AND e.is_published)
      ) q
    )
  );
$$;

-- ── apply_promo_code (only the edition target-name lookup changes) ───────────────
CREATE OR REPLACE FUNCTION public.apply_promo_code(input_code text) RETURNS jsonb
  LANGUAGE plpgsql SET search_path TO 'public'
AS $$
DECLARE
  v_user_id      uuid;
  v_code         text;
  v_promo        "PromoCodes"%ROWTYPE;
  v_target_name  text;
  v_match_found  boolean;
  v_category     text;
  v_edition_id   integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'not_authenticated');
  END IF;

  v_code := upper(trim(input_code));
  SELECT * INTO v_promo FROM "PromoCodes" WHERE upper(code) = v_code;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'not_found');
  END IF;

  IF now() < v_promo.starts_at OR now() > v_promo.ends_at THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'inactive');
  END IF;

  IF v_promo.kind = 'item' THEN
    IF v_promo.target_product_id IS NOT NULL THEN
      SELECT EXISTS (SELECT 1 FROM "Cart" WHERE user_id = v_user_id AND id = v_promo.target_product_id) INTO v_match_found;
      IF NOT v_match_found THEN
        v_category := split_part(v_promo.target_product_id, '-', 1);
        v_edition_id := NULLIF(split_part(v_promo.target_product_id, '-', 2), '')::integer;
        v_target_name := (
          SELECT t.name FROM "Titles" t
          WHERE t.id = (SELECT title_id FROM "Editions" WHERE id = v_edition_id AND kind = v_category)
        );
        RETURN jsonb_build_object('status', 'error', 'reason', 'target_missing', 'targetName', v_target_name);
      END IF;
    ELSE
      SELECT EXISTS (SELECT 1 FROM get_cart_with_title_ids() WHERE title_id = v_promo.target_title_id) INTO v_match_found;
      IF NOT v_match_found THEN
        SELECT name INTO v_target_name FROM "Titles" WHERE id = v_promo.target_title_id;
        RETURN jsonb_build_object('status', 'error', 'reason', 'target_missing', 'targetName', v_target_name);
      END IF;
    END IF;
  END IF;

  INSERT INTO "CartPromo" (user_id, promo_id, applied_at)
  VALUES (v_user_id, v_promo.id, now())
  ON CONFLICT (user_id) DO UPDATE SET promo_id = EXCLUDED.promo_id, applied_at = EXCLUDED.applied_at;

  RETURN jsonb_build_object('status', 'ok', 'applied', jsonb_build_object(
    'id', v_promo.id, 'code', v_promo.code, 'kind', v_promo.kind,
    'target_title_id', v_promo.target_title_id, 'target_product_id', v_promo.target_product_id,
    'discount_pct', v_promo.discount_pct, 'starts_at', v_promo.starts_at, 'ends_at', v_promo.ends_at, 'applied_at', now()
  ));
END;
$$;
