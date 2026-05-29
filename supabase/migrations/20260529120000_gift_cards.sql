-- Gift cards: storefront products, wallet cards, claim links, and checkout
-- wallet application. The feature reuses the existing Cart.category = 'GiftCard'
-- enum value and Cart.id format 'GiftCard-<GiftCardProducts.id>'.

-- ─── 1. Tier catalogue ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "GiftCardProducts" (
  id          serial  PRIMARY KEY,
  slug        text    NOT NULL UNIQUE,
  name        text    NOT NULL,
  face_value  integer NOT NULL CHECK (face_value > 0),
  sort_order  integer NOT NULL DEFAULT 0
);

ALTER TABLE "GiftCardProducts" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read gift card products" ON "GiftCardProducts";
CREATE POLICY "Public read gift card products" ON "GiftCardProducts"
  FOR SELECT USING (true);

INSERT INTO "GiftCardProducts" (slug, name, face_value, sort_order) VALUES
  ('prelest',      'Прелесть',     500,  0),
  ('blagost',      'Благость',     1000, 1),
  ('transcendent', 'Трансцендент', 5000, 2)
ON CONFLICT (slug) DO NOTHING;

-- ─── 2. Issued cards ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "GiftCards" (
  id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code                     text        NOT NULL UNIQUE,
  product_id               integer     NOT NULL REFERENCES "GiftCardProducts"(id),
  owner_user_id            uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  initial_value            integer     NOT NULL,
  balance                  integer     NOT NULL CHECK (balance >= 0),
  status                   text        NOT NULL DEFAULT 'active'
                                        CHECK (status IN ('active', 'pending', 'depleted')),
  claim_token              text        UNIQUE,
  pending_recipient_email  text,
  sent_at                  timestamptz,
  order_id                 integer     REFERENCES "Orders"(id) ON DELETE SET NULL,
  created_at               timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT gift_cards_balance_bounds CHECK (balance <= initial_value),
  CONSTRAINT gift_cards_status_balance CHECK (
    (status = 'depleted' AND balance = 0)
    OR (status IN ('active', 'pending') AND balance > 0)
  ),
  CONSTRAINT gift_cards_pending_token_state CHECK (
    (status = 'pending' AND claim_token IS NOT NULL AND sent_at IS NOT NULL)
    OR (status <> 'pending' AND claim_token IS NULL AND sent_at IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS gift_cards_owner_active_idx
  ON "GiftCards" (owner_user_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS gift_cards_claim_token_idx
  ON "GiftCards" (claim_token) WHERE claim_token IS NOT NULL;

ALTER TABLE "GiftCards" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner reads own gift cards" ON "GiftCards";
CREATE POLICY "Owner reads own gift cards" ON "GiftCards"
  FOR SELECT USING (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Owner inserts own gift cards" ON "GiftCards";
CREATE POLICY "Owner inserts own gift cards" ON "GiftCards"
  FOR INSERT WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Owner updates own gift cards" ON "GiftCards";
CREATE POLICY "Owner updates own gift cards" ON "GiftCards"
  FOR UPDATE USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

-- ─── 3. Order-side application log ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "OrderGiftCardApplications" (
  id            serial      PRIMARY KEY,
  order_id      integer     NOT NULL REFERENCES "Orders"(id) ON DELETE CASCADE,
  gift_card_id  uuid        NOT NULL REFERENCES "GiftCards"(id),
  amount        integer     NOT NULL CHECK (amount > 0),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS order_gift_card_apps_order_idx
  ON "OrderGiftCardApplications" (order_id);

ALTER TABLE "OrderGiftCardApplications" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Order gift card apps select own" ON "OrderGiftCardApplications";
CREATE POLICY "Order gift card apps select own" ON "OrderGiftCardApplications"
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM "Orders" o
      WHERE o.id = "OrderGiftCardApplications".order_id
        AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Order gift card apps insert own" ON "OrderGiftCardApplications";
CREATE POLICY "Order gift card apps insert own" ON "OrderGiftCardApplications"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM "Orders" o
      WHERE o.id = "OrderGiftCardApplications".order_id
        AND o.user_id = auth.uid()
    )
  );

-- ─── 4. Extend Orders snapshot ──────────────────────────────────────────────
ALTER TABLE "Orders"
  ADD COLUMN IF NOT EXISTS gift_card_total_applied numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount_due numeric(10,2) NOT NULL DEFAULT 0;

-- Existing orders predate gift-card payment; amount_due equals total.
UPDATE "Orders"
   SET amount_due = total
 WHERE amount_due = 0
   AND gift_card_total_applied = 0;

-- ─── 5. Code / token helpers ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.generate_gift_card_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_code text;
  v_i integer;
BEGIN
  LOOP
    v_code := '';
    FOR v_i IN 1..16 LOOP
      v_code := v_code || substr(alphabet, floor(random() * length(alphabet) + 1)::integer, 1);
    END LOOP;

    v_code := substr(v_code, 1, 4) || '-' || substr(v_code, 5, 4) || '-' ||
              substr(v_code, 9, 4) || '-' || substr(v_code, 13, 4);

    IF NOT EXISTS (SELECT 1 FROM "GiftCards" WHERE code = v_code) THEN
      RETURN v_code;
    END IF;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_gift_card_code() TO anon, authenticated;

-- ─── 6. Send / redeem RPCs ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.send_gift_card(
  p_card_id uuid,
  p_recipient_email text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token text;
BEGIN
  -- Token is two concatenated v4 UUIDs (dashes stripped) → 64 URL-safe hex
  -- chars / ~256 bits of entropy. Using gen_random_uuid() avoids pulling
  -- pgcrypto into search_path; the latter is not visible from this
  -- SECURITY DEFINER function (search_path = public).
  UPDATE "GiftCards"
     SET status = 'pending',
         claim_token = replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
         pending_recipient_email = NULLIF(trim(p_recipient_email), ''),
         sent_at = now()
   WHERE id = p_card_id
     AND owner_user_id = auth.uid()
     AND status = 'active'
     AND balance > 0
  RETURNING claim_token INTO v_token;

  IF v_token IS NULL THEN
    RAISE EXCEPTION 'Card not found, not yours, depleted, or already pending';
  END IF;

  RETURN v_token;
END;
$$;

REVOKE ALL ON FUNCTION public.send_gift_card(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_gift_card(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.redeem_gift_card_token(p_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_card_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE "GiftCards"
     SET owner_user_id = auth.uid(),
         status = 'active',
         claim_token = NULL,
         pending_recipient_email = NULL,
         sent_at = NULL
   WHERE claim_token = p_token
     AND status = 'pending'
  RETURNING id INTO v_card_id;

  RETURN v_card_id;
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_gift_card_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_gift_card_token(text) TO anon, authenticated;

-- ─── 7. Promo validation RPC update ─────────────────────────────────────────
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

  IF v_promo.kind = 'item' THEN
    IF v_promo.target_product_id IS NOT NULL THEN
      SELECT EXISTS (
        SELECT 1 FROM "Cart"
        WHERE user_id = v_user_id
          AND id = v_promo.target_product_id
          AND category::text <> 'GiftCard'
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
    ELSE
      SELECT EXISTS (
        SELECT 1
        FROM get_cart_with_title_ids() ids
        JOIN "Cart" c ON c.user_id = v_user_id AND c.id = ids.cart_id
        WHERE ids.title_id = v_promo.target_title_id
          AND c.category::text <> 'GiftCard'
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

  INSERT INTO "CartPromo" (user_id, promo_id, applied_at)
  VALUES (v_user_id, v_promo.id, now())
  ON CONFLICT (user_id) DO UPDATE
    SET promo_id = EXCLUDED.promo_id,
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

-- ─── 8. place_order with issuing + wallet application ───────────────────────
CREATE OR REPLACE FUNCTION public.place_order(
  p_shipping_name        TEXT,
  p_shipping_phone       TEXT,
  p_shipping_city        TEXT,
  p_shipping_street      TEXT,
  p_shipping_building    TEXT,
  p_shipping_postal_code TEXT,
  p_email                TEXT,
  p_gift_cards           jsonb DEFAULT '[]'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id                  uuid;
  v_promo                    "PromoCodes"%ROWTYPE;
  v_promo_applies            boolean;
  v_original_sum             numeric(10,2) := 0;
  v_original_discountable    numeric(10,2) := 0;
  v_subtotal                 numeric(10,2) := 0;
  v_discountable_subtotal    numeric(10,2) := 0;
  v_gift_card_eligible_total numeric(10,2) := 0;
  v_book_disc_total          numeric(10,2) := 0;
  v_total_disc               numeric(10,2) := 0;
  v_promo_delta              numeric(10,2) := 0;
  v_final_total              numeric(10,2) := 0;
  v_gift_card_total          numeric(10,2) := 0;
  v_amount_due               numeric(10,2) := 0;
  v_orig_unit                numeric(10,2);
  v_orig_line                numeric(10,2);
  v_line_book_disc           numeric(10,2);
  v_line_effective           numeric(10,2);
  v_promo_amount             numeric(10,2);
  v_matched                  boolean;
  v_delivery_method          text;
  v_order_id                 integer;
  cart_row                   record;
  gift_row                   record;
  request_row                record;
  v_card_ids                 uuid[];
  v_card_count               integer;
  v_request_count            integer;
  v_product_id               integer;
  v_unit_i                   integer;
  v_box_set_id               integer;
  v_box_set_name             text;
  v_resolved_book_id         text;
  v_resolved_category        text;
  bsb_row                    record;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'not_authenticated');
  END IF;

  IF jsonb_typeof(COALESCE(p_gift_cards, '[]'::jsonb)) <> 'array' THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'invalid_gift_cards');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM "Cart" WHERE user_id = v_user_id) THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'empty_cart');
  END IF;

  SELECT pc.* INTO v_promo
  FROM "CartPromo" cp
  JOIN "PromoCodes" pc ON pc.id = cp.promo_id
  WHERE cp.user_id = v_user_id;

  IF FOUND THEN
    v_promo_applies := now() >= v_promo.starts_at AND now() <= v_promo.ends_at;
  ELSE
    v_promo_applies := false;
  END IF;

  FOR cart_row IN
    SELECT * FROM "Cart" WHERE user_id = v_user_id
  LOOP
    v_orig_unit := CASE
      WHEN cart_row.discount IS NOT NULL AND cart_row.discount > 0
        THEN round(cart_row.price / (1 - cart_row.discount / 100.0))
      ELSE cart_row.price
    END;
    v_orig_line := v_orig_unit * cart_row.quantity;
    v_subtotal := v_subtotal + (cart_row.price * cart_row.quantity);

    IF cart_row.category::text <> 'GiftCard' THEN
      v_discountable_subtotal := v_discountable_subtotal + (cart_row.price * cart_row.quantity);
      v_original_sum := v_original_sum + v_orig_line;
      v_original_discountable := v_original_discountable + v_orig_line;
      v_line_book_disc := v_orig_line - (cart_row.price * cart_row.quantity);
      v_book_disc_total := v_book_disc_total + v_line_book_disc;

      IF v_promo_applies AND v_promo.kind = 'item' THEN
        v_matched := false;
        IF v_promo.target_product_id IS NOT NULL THEN
          v_matched := (cart_row.id = v_promo.target_product_id);
        ELSIF v_promo.target_title_id IS NOT NULL THEN
          v_matched := EXISTS (
            SELECT 1 FROM get_cart_with_title_ids() t
            WHERE t.cart_id = cart_row.id AND t.title_id = v_promo.target_title_id
          );
        END IF;

        IF v_matched THEN
          v_line_effective := GREATEST(v_line_book_disc, round(v_orig_line * v_promo.discount_pct / 100.0));
        ELSE
          v_line_effective := v_line_book_disc;
        END IF;
        v_total_disc := v_total_disc + v_line_effective;
      END IF;
    ELSE
      v_original_sum := v_original_sum + v_orig_line;
    END IF;
  END LOOP;

  IF v_promo_applies AND v_promo.kind = 'cart' THEN
    v_promo_amount := round(v_original_discountable * v_promo.discount_pct / 100.0);
    v_total_disc := GREATEST(v_book_disc_total, v_promo_amount);
  ELSIF NOT v_promo_applies THEN
    v_total_disc := v_book_disc_total;
  END IF;

  v_promo_delta := GREATEST(0, v_total_disc - v_book_disc_total);
  v_final_total := v_subtotal - v_promo_delta;
  v_gift_card_eligible_total := GREATEST(0, v_discountable_subtotal - v_promo_delta);

  CREATE TEMP TABLE IF NOT EXISTS pg_temp.requested_gift_cards (
    id uuid PRIMARY KEY,
    amount numeric(10,2) NOT NULL CHECK (amount > 0)
  ) ON COMMIT DROP;
  TRUNCATE pg_temp.requested_gift_cards;

  INSERT INTO pg_temp.requested_gift_cards (id, amount)
  SELECT (elem->>'id')::uuid, (elem->>'amount')::numeric(10,2)
  FROM jsonb_array_elements(COALESCE(p_gift_cards, '[]'::jsonb)) elem
  WHERE elem ? 'id' AND elem ? 'amount';

  SELECT jsonb_array_length(COALESCE(p_gift_cards, '[]'::jsonb)) INTO v_request_count;
  SELECT count(*), COALESCE(sum(amount), 0) INTO v_card_count, v_gift_card_total
  FROM pg_temp.requested_gift_cards;

  IF v_request_count <> v_card_count THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'invalid_gift_cards');
  END IF;

  IF v_gift_card_total > v_gift_card_eligible_total THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'gift_card_over_limit');
  END IF;

  SELECT array_agg(id ORDER BY id) INTO v_card_ids FROM pg_temp.requested_gift_cards;

  IF v_card_count > 0 THEN
    FOR gift_row IN
      SELECT gc.*, rgc.amount
      FROM "GiftCards" gc
      JOIN pg_temp.requested_gift_cards rgc ON rgc.id = gc.id
      ORDER BY gc.id
      FOR UPDATE OF gc
    LOOP
      IF gift_row.owner_user_id IS DISTINCT FROM v_user_id
         OR gift_row.status <> 'active'
         OR gift_row.balance < gift_row.amount THEN
        RETURN jsonb_build_object('status', 'error', 'reason', 'invalid_gift_cards');
      END IF;
    END LOOP;

    IF (
      SELECT count(*)
      FROM "GiftCards" gc
      JOIN pg_temp.requested_gift_cards rgc ON rgc.id = gc.id
    ) <> v_card_count THEN
      RETURN jsonb_build_object('status', 'error', 'reason', 'invalid_gift_cards');
    END IF;
  END IF;

  v_amount_due := GREATEST(0, v_final_total - v_gift_card_total);

  IF p_shipping_name IS NOT NULL AND p_shipping_name <> '' THEN
    v_delivery_method := 'shipping';
  ELSIF p_email IS NOT NULL AND p_email <> '' THEN
    v_delivery_method := 'email';
  ELSE
    v_delivery_method := 'download';
  END IF;

  INSERT INTO "Orders" (
    user_id, status, total,
    delivery_method, delivery_email,
    shipping_name, shipping_phone, shipping_city,
    shipping_street, shipping_building, shipping_postal_code,
    original_total, book_discount_total,
    promo_code, promo_discount,
    gift_card_total_applied, amount_due,
    paid_at
  ) VALUES (
    v_user_id, 'paid', v_final_total,
    v_delivery_method, NULLIF(p_email, ''),
    NULLIF(p_shipping_name, ''), NULLIF(p_shipping_phone, ''), NULLIF(p_shipping_city, ''),
    NULLIF(p_shipping_street, ''), NULLIF(p_shipping_building, ''), NULLIF(p_shipping_postal_code, ''),
    v_original_sum, v_book_disc_total,
    CASE WHEN v_promo_applies THEN v_promo.code ELSE NULL END,
    v_promo_delta,
    v_gift_card_total, v_amount_due,
    now()
  )
  RETURNING id INTO v_order_id;

  IF v_card_count > 0 THEN
    FOR request_row IN SELECT * FROM pg_temp.requested_gift_cards ORDER BY id LOOP
      UPDATE "GiftCards"
         SET balance = balance - request_row.amount,
             status = CASE WHEN balance - request_row.amount = 0 THEN 'depleted' ELSE 'active' END
       WHERE id = request_row.id;

      INSERT INTO "OrderGiftCardApplications" (order_id, gift_card_id, amount)
      VALUES (v_order_id, request_row.id, request_row.amount);
    END LOOP;
  END IF;

  FOR cart_row IN
    SELECT * FROM "Cart" WHERE user_id = v_user_id
  LOOP
    IF cart_row.category::text = 'BoxSet' THEN
      v_box_set_id := NULLIF(substring(cart_row.id FROM '-(\d+)$'), '')::int;
      SELECT name INTO v_box_set_name FROM "BoxSets" WHERE id = v_box_set_id;

      FOR bsb_row IN
        SELECT bsb.title_id, bsb.product_id, t.name AS title_name
        FROM "BoxSetBooks" bsb
        JOIN "Titles" t ON t.id = bsb.title_id
        WHERE bsb.box_set_id = v_box_set_id
        ORDER BY bsb.position, bsb.id
      LOOP
        v_resolved_book_id := COALESCE(bsb_row.product_id, default_edition_for_title(bsb_row.title_id));
        IF v_resolved_book_id IS NULL THEN CONTINUE; END IF;
        v_resolved_category := substring(v_resolved_book_id FROM '^[^-]+');

        INSERT INTO "OrderItems" (order_id, book_id, name, price, quantity, category, box_set_name)
        VALUES (
          v_order_id,
          v_resolved_book_id,
          bsb_row.title_name,
          0,
          cart_row.quantity,
          v_resolved_category,
          v_box_set_name
        );
      END LOOP;
    ELSE
      INSERT INTO "OrderItems" (order_id, book_id, name, price, quantity, category, box_set_name)
      VALUES (
        v_order_id,
        cart_row.id,
        cart_row.name,
        cart_row.price,
        cart_row.quantity,
        cart_row.category::text,
        NULL
      );
    END IF;

    IF cart_row.category::text = 'GiftCard' THEN
      v_product_id := NULLIF(substring(cart_row.id FROM '-(\d+)$'), '')::int;

      FOR v_unit_i IN 1..COALESCE(cart_row.quantity, 1) LOOP
        INSERT INTO "GiftCards" (
          code, product_id, owner_user_id, initial_value, balance, status, order_id
        )
        SELECT
          generate_gift_card_code(), gcp.id, v_user_id, gcp.face_value, gcp.face_value, 'active', v_order_id
        FROM "GiftCardProducts" gcp
        WHERE gcp.id = v_product_id;

        IF NOT FOUND THEN
          RAISE EXCEPTION 'Gift card product % not found', v_product_id;
        END IF;
      END LOOP;
    END IF;
  END LOOP;

  DELETE FROM "CartPromo" WHERE user_id = v_user_id;
  DELETE FROM "Cart" WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'status', 'ok',
    'orderId', v_order_id,
    'finalTotal', v_final_total,
    'giftCardTotalApplied', v_gift_card_total,
    'amountDue', v_amount_due
  );
END;
$function$;

GRANT EXECUTE ON FUNCTION public.place_order(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, jsonb) TO anon, authenticated;

-- ─── 9. Anonymous user migration ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION migrate_anonymous_user(from_user_id uuid, to_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF to_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: may only migrate into your own user';
  END IF;

  IF from_user_id = to_user_id THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = from_user_id AND is_anonymous = true
  ) THEN
    RAISE EXCEPTION 'Source user is not anonymous (or does not exist)';
  END IF;

  UPDATE "Cart" AS target
  SET quantity = COALESCE(target.quantity, 1) + COALESCE(source.quantity, 1)
  FROM "Cart" AS source
  WHERE target.user_id = to_user_id
    AND source.user_id = from_user_id
    AND target.id = source.id;

  UPDATE "Cart"
  SET user_id = to_user_id
  WHERE user_id = from_user_id
    AND id NOT IN (
      SELECT id FROM "Cart" WHERE user_id = to_user_id
    );

  DELETE FROM "Cart" WHERE user_id = from_user_id;

  UPDATE "Orders" SET user_id = to_user_id WHERE user_id = from_user_id;
  UPDATE "GiftCards" SET owner_user_id = to_user_id WHERE owner_user_id = from_user_id;

  DELETE FROM "CartPromo"
   WHERE user_id = from_user_id
     AND EXISTS (SELECT 1 FROM "CartPromo" WHERE user_id = to_user_id);
  UPDATE "CartPromo" SET user_id = to_user_id WHERE user_id = from_user_id;

  DELETE FROM "Profiles"
   WHERE user_id = from_user_id
     AND EXISTS (SELECT 1 FROM "Profiles" WHERE user_id = to_user_id);
  UPDATE "Profiles" SET user_id = to_user_id WHERE user_id = from_user_id;

  DELETE FROM "Likes" anon
   WHERE anon.user_id = from_user_id
     AND EXISTS (
       SELECT 1 FROM "Likes" tgt
        WHERE tgt.user_id = to_user_id
          AND tgt.item_type = anon.item_type
          AND tgt.item_id = anon.item_id
     );
  UPDATE "Likes" SET user_id = to_user_id WHERE user_id = from_user_id;

  DELETE FROM auth.users WHERE id = from_user_id AND is_anonymous = true;
END;
$$;

REVOKE ALL ON FUNCTION migrate_anonymous_user(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION migrate_anonymous_user(uuid, uuid) TO authenticated;
