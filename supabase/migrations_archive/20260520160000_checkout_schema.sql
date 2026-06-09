-- Checkout flow schema:
--   • BoxSetBooks.product_id    — concrete-edition support for "is this box set physical"
--   • Ebooks/Audiobooks/CardBooks.file_path  — digital file object key inside `digital-files` bucket
--   • Orders shipping fields + pricing snapshot for immutable order records
--   • Storage bucket `digital-files` (private, served via signed URLs only)
--   • Function box_set_is_physical(box_set_id) → boolean
--   • Function place_order(...) — atomic Cart→Orders move + Cart/CartPromo wipe
--
-- See docs/plans/checkout-flow.md.

-- ─── 1. BoxSetBooks: concrete-edition support ────────────────────────────────
ALTER TABLE "BoxSetBooks"
  ADD COLUMN IF NOT EXISTS product_id TEXT NULL;

COMMENT ON COLUMN "BoxSetBooks".product_id IS
  'NULL = entry means all editions of title_id. Set (e.g. ''PrintBook-12'') = specific edition. Mirrors Cart.id format.';

-- ─── 2. Digital file paths ───────────────────────────────────────────────────
ALTER TABLE "Ebooks"
  ADD COLUMN IF NOT EXISTS file_path TEXT NULL;
ALTER TABLE "Audiobooks"
  ADD COLUMN IF NOT EXISTS file_path TEXT NULL;
ALTER TABLE "CardBooks"
  ADD COLUMN IF NOT EXISTS file_path TEXT NULL;

-- ─── 3. Orders shipping + price snapshot ─────────────────────────────────────
ALTER TABLE "Orders"
  ADD COLUMN IF NOT EXISTS shipping_name        TEXT NULL,
  ADD COLUMN IF NOT EXISTS shipping_phone       TEXT NULL,
  ADD COLUMN IF NOT EXISTS shipping_city        TEXT NULL,
  ADD COLUMN IF NOT EXISTS shipping_street      TEXT NULL,
  ADD COLUMN IF NOT EXISTS shipping_building    TEXT NULL,
  ADD COLUMN IF NOT EXISTS shipping_postal_code TEXT NULL,
  ADD COLUMN IF NOT EXISTS original_total       NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS book_discount_total  NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS promo_code           TEXT NULL,
  ADD COLUMN IF NOT EXISTS promo_discount       NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid_at              TIMESTAMPTZ NULL;

-- ─── 4. Private storage bucket for digital files ─────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('digital-files', 'digital-files', false, 524288000)  -- 500 MB cap
ON CONFLICT (id) DO NOTHING;

-- Buckets are private by default; only signed URLs grant access. No RLS
-- policies needed beyond Supabase's defaults (no read for anon/authenticated).

-- ─── 5. RPC: box_set_is_physical ─────────────────────────────────────────────
-- Returns true if any BoxSetBooks row for this box_set:
--   • has product_id starting with 'PrintBook-' or 'Book2.0-' (concrete physical), OR
--   • has product_id NULL AND that title has a row in PrintedBooks or CardBooks
--     (title-level entry that resolves to a physical edition).
CREATE OR REPLACE FUNCTION box_set_is_physical(p_box_set_id INTEGER)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM "BoxSetBooks" bsb
    WHERE bsb.box_set_id = p_box_set_id
      AND (
        bsb.product_id LIKE 'PrintBook-%'
        OR bsb.product_id LIKE 'Book2.0-%'
        OR (
          bsb.product_id IS NULL
          AND (
            EXISTS (SELECT 1 FROM "PrintedBooks" pb WHERE pb.title_id = bsb.title_id)
            OR EXISTS (SELECT 1 FROM "CardBooks" cb WHERE cb.title_id = bsb.title_id)
          )
        )
      )
  );
$$;

GRANT EXECUTE ON FUNCTION box_set_is_physical(INTEGER) TO anon, authenticated;

-- ─── 6. RPC: place_order ─────────────────────────────────────────────────────
-- Atomic:
--   1. Validate auth.
--   2. Read Cart rows for current user (RLS scopes).
--   3. Read applied CartPromo + PromoCodes (RLS scopes); re-validate dates.
--   4. Recompute totals server-side (NEVER trust client-side prices).
--   5. INSERT Orders + OrderItems.
--   6. DELETE CartPromo + Cart for this user.
--   7. Return { status: 'ok', orderId, finalTotal } | { status: 'error', reason }.
--
-- Pricing math mirrors src/lib/cartTotals.ts:
--   originalSum   = Σ (originalUnitPrice × qty)
--     where originalUnitPrice = round(price / (1 - discount/100)) if discount > 0, else price
--   subtotal      = Σ (price × qty)
--   bookDiscount  = originalSum - subtotal
--   if cart-promo:    promoAmt   = round(originalSum × pct / 100)
--                     totalDisc  = max(bookDiscount, promoAmt)
--   if item-promo:    per-row max(bookDiscOnLine, promoOnLine if matches)
--                     totalDisc  = Σ effectiveDisc
--   else (no promo):  totalDisc  = bookDiscount
--   promoDelta = max(0, totalDisc - bookDiscount)   ← shown as "Скидка"
--   finalTotal = subtotal - promoDelta
CREATE OR REPLACE FUNCTION place_order(
  p_shipping_name        TEXT,
  p_shipping_phone       TEXT,
  p_shipping_city        TEXT,
  p_shipping_street      TEXT,
  p_shipping_building    TEXT,
  p_shipping_postal_code TEXT,
  p_email                TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id           uuid;
  v_promo             "PromoCodes"%ROWTYPE;
  v_promo_applies     boolean;
  v_original_sum      numeric(10,2) := 0;
  v_subtotal          numeric(10,2) := 0;
  v_book_disc_total   numeric(10,2) := 0;
  v_total_disc        numeric(10,2) := 0;
  v_promo_delta       numeric(10,2) := 0;
  v_final_total       numeric(10,2) := 0;
  v_orig_unit         numeric(10,2);
  v_orig_line         numeric(10,2);
  v_line_book_disc    numeric(10,2);
  v_line_effective    numeric(10,2);
  v_promo_amount      numeric(10,2);
  v_matched           boolean;
  v_delivery_method   text;
  v_order_id          integer;
  cart_row            record;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'not_authenticated');
  END IF;

  -- Cart presence check
  IF NOT EXISTS (SELECT 1 FROM "Cart" WHERE user_id = v_user_id) THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'empty_cart');
  END IF;

  -- Resolve active promo, if any
  SELECT pc.* INTO v_promo
  FROM "CartPromo" cp
  JOIN "PromoCodes" pc ON pc.id = cp.promo_id
  WHERE cp.user_id = v_user_id;

  IF FOUND THEN
    -- Re-validate window
    IF now() >= v_promo.starts_at AND now() <= v_promo.ends_at THEN
      v_promo_applies := true;
    ELSE
      v_promo_applies := false;
    END IF;
  ELSE
    v_promo_applies := false;
  END IF;

  -- Recompute totals
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
    v_original_sum := v_original_sum + v_orig_line;
    v_line_book_disc := v_orig_line - (cart_row.price * cart_row.quantity);

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

    v_book_disc_total := v_book_disc_total + v_line_book_disc;
  END LOOP;

  -- Cart-level promo: compare against the sum
  IF v_promo_applies AND v_promo.kind = 'cart' THEN
    v_promo_amount := round(v_original_sum * v_promo.discount_pct / 100.0);
    v_total_disc := GREATEST(v_book_disc_total, v_promo_amount);
  ELSIF NOT v_promo_applies THEN
    v_total_disc := v_book_disc_total;
  END IF;

  v_promo_delta := GREATEST(0, v_total_disc - v_book_disc_total);
  v_final_total := v_subtotal - v_promo_delta;

  -- Decide delivery_method based on which fields were provided
  IF p_shipping_name IS NOT NULL AND p_shipping_name <> '' THEN
    v_delivery_method := 'shipping';
  ELSIF p_email IS NOT NULL AND p_email <> '' THEN
    v_delivery_method := 'email';
  ELSE
    v_delivery_method := 'download';
  END IF;

  -- Insert order header
  INSERT INTO "Orders" (
    user_id, status, total,
    delivery_method, delivery_email,
    shipping_name, shipping_phone, shipping_city,
    shipping_street, shipping_building, shipping_postal_code,
    original_total, book_discount_total,
    promo_code, promo_discount,
    paid_at
  ) VALUES (
    v_user_id, 'paid', v_final_total,
    v_delivery_method, NULLIF(p_email, ''),
    NULLIF(p_shipping_name, ''), NULLIF(p_shipping_phone, ''), NULLIF(p_shipping_city, ''),
    NULLIF(p_shipping_street, ''), NULLIF(p_shipping_building, ''), NULLIF(p_shipping_postal_code, ''),
    v_original_sum, v_book_disc_total,
    CASE WHEN v_promo_applies THEN v_promo.code ELSE NULL END,
    v_promo_delta,
    now()
  )
  RETURNING id INTO v_order_id;

  -- Insert order items snapshotted from Cart
  INSERT INTO "OrderItems" (order_id, book_id, name, price, quantity, category)
  SELECT v_order_id, id, name, price, quantity, category::text
  FROM "Cart"
  WHERE user_id = v_user_id;

  -- Clear cart + applied promo
  DELETE FROM "CartPromo" WHERE user_id = v_user_id;
  DELETE FROM "Cart" WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'status', 'ok',
    'orderId', v_order_id,
    'finalTotal', v_final_total
  );
END;
$$;

GRANT EXECUTE ON FUNCTION place_order(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
