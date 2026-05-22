-- When a user buys a BoxSet, expand it into one OrderItems row per
-- member title (instead of a single "BoxSet" row). Member items carry
-- a `box_set_name` snapshot so the UI can label them as part of the
-- set, and their book_id points at a concrete edition of each title so
-- downloads work.
--
-- The set itself is NOT inserted as its own OrderItem — users explicitly
-- asked to see the contained books, not a generic "Box-Set" card.
--
-- Per-item price is 0 (the set total is already in Orders.total). This
-- mirrors the existing "Orders.total is authoritative" stance.

-- ─── Column: box_set_name ───────────────────────────────────────────────────
ALTER TABLE "OrderItems"
  ADD COLUMN IF NOT EXISTS box_set_name TEXT NULL;

COMMENT ON COLUMN "OrderItems".box_set_name IS
  'Snapshot of the parent BoxSets.name when this item was sold as part of a box set. NULL for standalone items.';

-- ─── Helper: default edition for a title ────────────────────────────────────
-- BoxSetBooks rows MAY leave product_id NULL ("any edition"). For those
-- we need to pick a concrete edition at order time so the user can
-- download something. Preference order: Ebook → Audiobook → CardBook
-- → PrintedBook. Returns 'Category-N' (matching Cart.id / OrderItems.book_id
-- format) or NULL if the title has no editions at all.
CREATE OR REPLACE FUNCTION default_edition_for_title(p_title_id INT)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  v_id INT;
BEGIN
  SELECT id INTO v_id FROM "Ebooks" WHERE title_id = p_title_id ORDER BY id LIMIT 1;
  IF v_id IS NOT NULL THEN RETURN 'EBook-' || v_id; END IF;

  SELECT id INTO v_id FROM "Audiobooks" WHERE title_id = p_title_id ORDER BY id LIMIT 1;
  IF v_id IS NOT NULL THEN RETURN 'AudioBook-' || v_id; END IF;

  SELECT id INTO v_id FROM "CardBooks" WHERE title_id = p_title_id ORDER BY id LIMIT 1;
  IF v_id IS NOT NULL THEN RETURN 'Book2.0-' || v_id; END IF;

  SELECT id INTO v_id FROM "PrintedBooks" WHERE title_id = p_title_id ORDER BY id LIMIT 1;
  IF v_id IS NOT NULL THEN RETURN 'PrintBook-' || v_id; END IF;

  RETURN NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION default_edition_for_title(INT) TO authenticated;

-- ─── place_order: replace the items-insert block with a per-row loop ────────
-- The new body matches the old totals/header logic exactly, but the
-- "INSERT INTO OrderItems SELECT * FROM Cart" tail becomes a FOR loop
-- that expands BoxSet rows.
CREATE OR REPLACE FUNCTION public.place_order(
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
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id            uuid;
  v_promo              "PromoCodes"%ROWTYPE;
  v_promo_applies      boolean;
  v_original_sum       numeric(10,2) := 0;
  v_subtotal           numeric(10,2) := 0;
  v_book_disc_total    numeric(10,2) := 0;
  v_total_disc         numeric(10,2) := 0;
  v_promo_delta        numeric(10,2) := 0;
  v_final_total        numeric(10,2) := 0;
  v_orig_unit          numeric(10,2);
  v_orig_line          numeric(10,2);
  v_line_book_disc     numeric(10,2);
  v_line_effective     numeric(10,2);
  v_promo_amount       numeric(10,2);
  v_matched            boolean;
  v_delivery_method    text;
  v_order_id           integer;
  cart_row             record;
  -- BoxSet expansion locals
  v_box_set_id         integer;
  v_box_set_name       text;
  v_resolved_book_id   text;
  v_resolved_category  text;
  bsb_row              record;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'not_authenticated');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM "Cart" WHERE user_id = v_user_id) THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'empty_cart');
  END IF;

  -- ─── Resolve promo ────────────────────────────────────────────────────
  SELECT pc.* INTO v_promo
  FROM "CartPromo" cp
  JOIN "PromoCodes" pc ON pc.id = cp.promo_id
  WHERE cp.user_id = v_user_id;

  IF FOUND THEN
    IF now() >= v_promo.starts_at AND now() <= v_promo.ends_at THEN
      v_promo_applies := true;
    ELSE
      v_promo_applies := false;
    END IF;
  ELSE
    v_promo_applies := false;
  END IF;

  -- ─── Recompute totals ─────────────────────────────────────────────────
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

  IF v_promo_applies AND v_promo.kind = 'cart' THEN
    v_promo_amount := round(v_original_sum * v_promo.discount_pct / 100.0);
    v_total_disc := GREATEST(v_book_disc_total, v_promo_amount);
  ELSIF NOT v_promo_applies THEN
    v_total_disc := v_book_disc_total;
  END IF;

  v_promo_delta := GREATEST(0, v_total_disc - v_book_disc_total);
  v_final_total := v_subtotal - v_promo_delta;

  -- ─── Delivery method ─────────────────────────────────────────────────
  IF p_shipping_name IS NOT NULL AND p_shipping_name <> '' THEN
    v_delivery_method := 'shipping';
  ELSIF p_email IS NOT NULL AND p_email <> '' THEN
    v_delivery_method := 'email';
  ELSE
    v_delivery_method := 'download';
  END IF;

  -- ─── Insert order header ────────────────────────────────────────────
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

  -- ─── Insert items (with BoxSet expansion) ────────────────────────────
  FOR cart_row IN
    SELECT * FROM "Cart" WHERE user_id = v_user_id
  LOOP
    IF cart_row.category::text = 'BoxSet' THEN
      -- Cart.id is shaped 'BoxSet-<int>'.
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
  END LOOP;

  -- ─── Clear cart + applied promo ──────────────────────────────────────
  DELETE FROM "CartPromo" WHERE user_id = v_user_id;
  DELETE FROM "Cart" WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'status', 'ok',
    'orderId', v_order_id,
    'finalTotal', v_final_total
  );
END;
$function$;
