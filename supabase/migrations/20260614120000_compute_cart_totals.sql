-- Single source of truth for cart pricing (data-architecture audit F2).
--
-- The max-wins promo / book-discount / gift-card-eligible math used to live in TWO
-- places: SQL (inline in create_pending_order) and TS (src/lib/cartTotals.ts). They
-- could silently diverge → price shown ≠ price charged. This extracts the pricing into
-- ONE SQL function used by BOTH the charge path (create_pending_order) and a read-only
-- display path (quote_cart). The TS copy is then deleted; the client reads quote_cart.
--
-- compute_cart_totals is pure pricing (no writes, no gift-card reservation). It returns
-- exactly the values create_pending_order needs downstream.

CREATE OR REPLACE FUNCTION public.compute_cart_totals(
  p_user_id uuid,
  OUT subtotal numeric,
  OUT original_sum numeric,
  OUT book_disc_total numeric,
  OUT promo_delta numeric,
  OUT final_total numeric,
  OUT gift_card_eligible_total numeric,
  OUT recurring_amount numeric,
  OUT has_physical boolean,
  OUT promo_code text
)
  LANGUAGE plpgsql STABLE
  SET search_path TO 'public'
AS $$
DECLARE
  v_promo                 "PromoCodes"%ROWTYPE;
  v_promo_applies         boolean := false;
  v_original_discountable numeric(10,2) := 0;
  v_discountable_subtotal numeric(10,2) := 0;
  v_total_disc            numeric(10,2) := 0;
  v_orig_unit             numeric(10,2);
  v_orig_line             numeric(10,2);
  v_line_book_disc        numeric(10,2);
  v_line_effective        numeric(10,2);
  v_promo_amount          numeric(10,2);
  v_matched               boolean;
  cart_row                record;
BEGIN
  subtotal := 0;
  original_sum := 0;
  book_disc_total := 0;
  promo_delta := 0;
  final_total := 0;
  gift_card_eligible_total := 0;
  recurring_amount := 0;
  has_physical := false;
  promo_code := NULL;

  SELECT pc.* INTO v_promo
  FROM "CartPromo" cp
  JOIN "PromoCodes" pc ON pc.id = cp.promo_id
  WHERE cp.user_id = p_user_id;

  IF FOUND THEN
    v_promo_applies := now() >= v_promo.starts_at AND now() <= v_promo.ends_at;
  END IF;

  FOR cart_row IN SELECT * FROM "Cart" WHERE user_id = p_user_id LOOP
    v_orig_unit := CASE
      WHEN cart_row.discount IS NOT NULL AND cart_row.discount > 0
        THEN round(cart_row.price / (1 - cart_row.discount / 100.0))
      ELSE cart_row.price
    END;
    v_orig_line := v_orig_unit * cart_row.quantity;
    subtotal := subtotal + (cart_row.price * cart_row.quantity);

    IF cart_row.category::text IN ('PrintBook', 'Book2.0') THEN
      has_physical := true;
    ELSIF cart_row.category::text = 'BoxSet'
      AND box_set_is_physical(NULLIF(substring(cart_row.id FROM '-(\d+)$'), '')::int) THEN
      has_physical := true;
    END IF;

    IF cart_row.category::text = 'Subscription' THEN
      recurring_amount := recurring_amount + (cart_row.price * cart_row.quantity);
    END IF;

    IF cart_row.category::text <> 'GiftCard' THEN
      v_discountable_subtotal := v_discountable_subtotal + (cart_row.price * cart_row.quantity);
      original_sum := original_sum + v_orig_line;
      v_original_discountable := v_original_discountable + v_orig_line;
      v_line_book_disc := v_orig_line - (cart_row.price * cart_row.quantity);
      book_disc_total := book_disc_total + v_line_book_disc;

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
      original_sum := original_sum + v_orig_line;
    END IF;
  END LOOP;

  IF v_promo_applies AND v_promo.kind = 'cart' THEN
    v_promo_amount := round(v_original_discountable * v_promo.discount_pct / 100.0);
    v_total_disc := GREATEST(book_disc_total, v_promo_amount);
  ELSIF NOT v_promo_applies THEN
    v_total_disc := book_disc_total;
  END IF;

  promo_delta := GREATEST(0, v_total_disc - book_disc_total);
  final_total := subtotal - promo_delta;
  gift_card_eligible_total := GREATEST(0, v_discountable_subtotal - promo_delta);
  promo_code := CASE WHEN v_promo_applies THEN v_promo.code ELSE NULL END;
END;
$$;


-- Read-only display quote — same numbers create_pending_order will charge.
CREATE OR REPLACE FUNCTION public.quote_cart()
  RETURNS jsonb
  LANGUAGE plpgsql STABLE
  SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  t         record;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('subtotal', 0, 'discountAmount', 0, 'total', 0, 'giftCardEligibleTotal', 0);
  END IF;

  SELECT * INTO t FROM compute_cart_totals(v_user_id);

  RETURN jsonb_build_object(
    'subtotal',              COALESCE(t.subtotal, 0),
    'discountAmount',        COALESCE(t.promo_delta, 0),
    'total',                 COALESCE(t.final_total, 0),
    'giftCardEligibleTotal', COALESCE(t.gift_card_eligible_total, 0)
  );
END;
$$;


-- create_pending_order now consumes compute_cart_totals for the pricing instead of its
-- own inline copy (the only change vs. the prior definition). Everything else — gift-card
-- validation/reservation, the Orders insert, OrderItems snapshot — is unchanged.
CREATE OR REPLACE FUNCTION public.create_pending_order(p_provider text, p_shipping_name text, p_shipping_phone text, p_shipping_city text, p_shipping_street text, p_shipping_building text, p_shipping_postal_code text, p_email text, p_gift_cards jsonb DEFAULT '[]'::jsonb)
  RETURNS jsonb
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id                  uuid;
  v_original_sum             numeric(10,2) := 0;
  v_subtotal                 numeric(10,2) := 0;
  v_gift_card_eligible_total numeric(10,2) := 0;
  v_book_disc_total          numeric(10,2) := 0;
  v_promo_delta              numeric(10,2) := 0;
  v_final_total              numeric(10,2) := 0;
  v_recurring_amount         numeric(10,2) := 0;
  v_gift_card_total          numeric(10,2) := 0;
  v_amount_due               numeric(10,2) := 0;
  v_promo_code               text;
  v_delivery_method          text;
  v_has_physical             boolean := false;
  v_order_id                 integer;
  cart_row                   record;
  request_row                record;
  v_card_count               integer;
  v_request_count            integer;
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

  -- Pricing: single source of truth (shared with quote_cart).
  SELECT t.subtotal, t.original_sum, t.book_disc_total, t.promo_delta,
         t.final_total, t.gift_card_eligible_total, t.recurring_amount,
         t.has_physical, t.promo_code
    INTO v_subtotal, v_original_sum, v_book_disc_total, v_promo_delta,
         v_final_total, v_gift_card_eligible_total, v_recurring_amount,
         v_has_physical, v_promo_code
  FROM compute_cart_totals(v_user_id) t;

  -- Validate + reserve gift cards (balances decremented now; released on cancel).
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

  IF v_card_count > 0 THEN
    -- Lock + validate each card.
    PERFORM 1 FROM "GiftCards" gc
      JOIN pg_temp.requested_gift_cards rgc ON rgc.id = gc.id
      FOR UPDATE OF gc;

    IF EXISTS (
      SELECT 1 FROM "GiftCards" gc
      JOIN pg_temp.requested_gift_cards rgc ON rgc.id = gc.id
      WHERE gc.owner_user_id IS DISTINCT FROM v_user_id
         OR gc.status <> 'active'
         OR gc.balance < rgc.amount
    ) THEN
      RETURN jsonb_build_object('status', 'error', 'reason', 'invalid_gift_cards');
    END IF;

    IF (SELECT count(*) FROM "GiftCards" gc
        JOIN pg_temp.requested_gift_cards rgc ON rgc.id = gc.id) <> v_card_count THEN
      RETURN jsonb_build_object('status', 'error', 'reason', 'invalid_gift_cards');
    END IF;
  END IF;

  v_amount_due := GREATEST(0, v_final_total - v_gift_card_total);

  -- Physical content (or any captured shipping address) means this order ships;
  -- a blank recipient name must NOT downgrade it to a digital delivery method.
  IF v_has_physical
     OR (p_shipping_name IS NOT NULL AND p_shipping_name <> '')
     OR (p_shipping_city IS NOT NULL AND p_shipping_city <> '')
     OR (p_shipping_street IS NOT NULL AND p_shipping_street <> '') THEN
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
    payment_provider, recurring, recurring_amount,
    paid_at
  ) VALUES (
    v_user_id, 'pending', v_final_total,
    v_delivery_method, NULLIF(p_email, ''),
    NULLIF(p_shipping_name, ''), NULLIF(p_shipping_phone, ''), NULLIF(p_shipping_city, ''),
    NULLIF(p_shipping_street, ''), NULLIF(p_shipping_building, ''), NULLIF(p_shipping_postal_code, ''),
    v_original_sum, v_book_disc_total,
    v_promo_code,
    v_promo_delta,
    v_gift_card_total, v_amount_due,
    COALESCE(p_provider, 'mock'), (v_recurring_amount > 0), v_recurring_amount,
    NULL
  )
  RETURNING id INTO v_order_id;

  -- Reserve gift cards: decrement balances + record applications.
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

  -- Snapshot OrderItems (expand BoxSets). Gift-card ISSUANCE deferred to payment.
  FOR cart_row IN SELECT * FROM "Cart" WHERE user_id = v_user_id LOOP
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
        VALUES (v_order_id, v_resolved_book_id, bsb_row.title_name, 0, cart_row.quantity, v_resolved_category, v_box_set_name);
      END LOOP;
    ELSE
      INSERT INTO "OrderItems" (order_id, book_id, name, price, quantity, category, box_set_name)
      VALUES (v_order_id, cart_row.id, cart_row.name, cart_row.price, cart_row.quantity, cart_row.category::text, NULL);
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'status', 'ok',
    'orderId', v_order_id,
    'finalTotal', v_final_total,
    'giftCardTotalApplied', v_gift_card_total,
    'amountDue', v_amount_due,
    'recurring', (v_recurring_amount > 0),
    'recurringAmount', v_recurring_amount
  );
END;
$function$;
