-- RPC: apply_promo_code(input_code text)
-- Validates a promo code in a single round-trip and upserts the user's
-- CartPromo row. Returns a JSON discriminated union the client can switch on.
--
-- Result shape:
--   { "status": "ok",     "applied": { ...promo, applied_at } }
--   { "status": "error",  "reason": "not_authenticated" | "not_found" | "inactive" }
--   { "status": "error",  "reason": "target_missing", "targetName": "..." }
--
-- SECURITY INVOKER — uses the caller's RLS context for Cart and CartPromo;
-- relies on PromoCodes being readable to authenticated+anon (RLS) and
-- catalog tables (Titles/Ebooks/Audiobooks/PrintedBooks/CardBooks) being
-- publicly readable.

CREATE OR REPLACE FUNCTION apply_promo_code(input_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
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

  -- Item-level: verify target is in the cart and resolve the title name
  -- for the error message if missing.
  IF v_promo.kind = 'item' THEN

    IF v_promo.target_product_id IS NOT NULL THEN
      SELECT EXISTS (
        SELECT 1 FROM "Cart"
        WHERE user_id = v_user_id AND id = v_promo.target_product_id
      ) INTO v_match_found;

      IF NOT v_match_found THEN
        v_category := split_part(v_promo.target_product_id, '-', 1);
        v_edition_id := NULLIF(split_part(v_promo.target_product_id, '-', 2), '')::integer;
        v_target_name := (
          SELECT t.name FROM "Titles" t
          WHERE t.id = COALESCE(
            (SELECT title_id FROM "Ebooks"       WHERE id = v_edition_id AND v_category = 'EBook'),
            (SELECT title_id FROM "Audiobooks"   WHERE id = v_edition_id AND v_category = 'AudioBook'),
            (SELECT title_id FROM "PrintedBooks" WHERE id = v_edition_id AND v_category = 'PrintBook'),
            (SELECT title_id FROM "CardBooks"    WHERE id = v_edition_id AND v_category = 'Book2.0')
          )
        );
        RETURN jsonb_build_object(
          'status', 'error',
          'reason', 'target_missing',
          'targetName', v_target_name
        );
      END IF;

    ELSE -- target_title_id IS NOT NULL
      SELECT EXISTS (
        SELECT 1 FROM get_cart_with_title_ids()
        WHERE title_id = v_promo.target_title_id
      ) INTO v_match_found;

      IF NOT v_match_found THEN
        SELECT name INTO v_target_name FROM "Titles" WHERE id = v_promo.target_title_id;
        RETURN jsonb_build_object(
          'status', 'error',
          'reason', 'target_missing',
          'targetName', v_target_name
        );
      END IF;
    END IF;
  END IF;

  -- Upsert CartPromo for this user — one applied code per user at a time.
  INSERT INTO "CartPromo" (user_id, promo_id, applied_at)
  VALUES (v_user_id, v_promo.id, now())
  ON CONFLICT (user_id) DO UPDATE
    SET promo_id   = EXCLUDED.promo_id,
        applied_at = EXCLUDED.applied_at;

  RETURN jsonb_build_object(
    'status', 'ok',
    'applied', jsonb_build_object(
      'id',                v_promo.id,
      'code',              v_promo.code,
      'kind',              v_promo.kind,
      'target_title_id',   v_promo.target_title_id,
      'target_product_id', v_promo.target_product_id,
      'discount_pct',      v_promo.discount_pct,
      'starts_at',         v_promo.starts_at,
      'ends_at',           v_promo.ends_at,
      'applied_at',        now()
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION apply_promo_code(text) TO anon, authenticated;
