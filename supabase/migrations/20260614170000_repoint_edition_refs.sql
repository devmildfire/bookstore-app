-- Editions consolidation, Phase B (audit F5): repoint the non-disposable catalog config
-- that references editions by the "<kind>-<old_id>" text scheme onto the new Editions ids.
-- Resolves old id → title_id (via the still-present old tables) → new Editions id for the
-- same kind. ADDITIVE/idempotent. (Orders/Cart/etc. are wiped in Phase C, so not touched.)

WITH old_map AS (
  SELECT 'EBook'::text AS kind, id AS old_id, title_id FROM public."Ebooks"
  UNION ALL SELECT 'AudioBook', id, title_id FROM public."Audiobooks"
  UNION ALL SELECT 'PrintBook', id, title_id FROM public."PrintedBooks"
  UNION ALL SELECT 'Book2.0', id, title_id FROM public."CardBooks"
),
resolved AS (
  SELECT p.id AS promo_id, e.kind || '-' || e.id AS new_ref
  FROM public."PromoCodes" p
  JOIN old_map om
    ON om.kind = split_part(p.target_product_id, '-', 1)
   AND om.old_id = NULLIF(split_part(p.target_product_id, '-', 2), '')::int
  JOIN public."Editions" e ON e.title_id = om.title_id AND e.kind = om.kind
  WHERE p.target_product_id IS NOT NULL
)
UPDATE public."PromoCodes" p
SET target_product_id = r.new_ref
FROM resolved r
WHERE r.promo_id = p.id;

WITH old_map AS (
  SELECT 'EBook'::text AS kind, id AS old_id, title_id FROM public."Ebooks"
  UNION ALL SELECT 'AudioBook', id, title_id FROM public."Audiobooks"
  UNION ALL SELECT 'PrintBook', id, title_id FROM public."PrintedBooks"
  UNION ALL SELECT 'Book2.0', id, title_id FROM public."CardBooks"
),
resolved AS (
  SELECT b.id AS bsb_id, e.kind || '-' || e.id AS new_ref
  FROM public."BoxSetBooks" b
  JOIN old_map om
    ON om.kind = split_part(b.product_id, '-', 1)
   AND om.old_id = NULLIF(split_part(b.product_id, '-', 2), '')::int
  JOIN public."Editions" e ON e.title_id = om.title_id AND e.kind = om.kind
  WHERE b.product_id IS NOT NULL
)
UPDATE public."BoxSetBooks" b
SET product_id = r.new_ref
FROM resolved r
WHERE r.bsb_id = b.id;
