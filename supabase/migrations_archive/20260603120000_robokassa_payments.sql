-- Robokassa payment lifecycle.
--
-- Splits the monolithic place_order (create + pay + wipe, all at once) into a
-- pending → paid lifecycle that mirrors a real PSP:
--   • create_pending_order  — snapshot Order+OrderItems as 'pending', reserve any
--                             gift cards, compute the recurring (subscription)
--                             portion. Does NOT issue gift cards or wipe the cart.
--   • mark_order_paid        — called by the verified ResultURL webhook (service
--                             role). Idempotent: issues gift cards, flips to
--                             'paid', creates/advances the recurring anchor, and
--                             wipes the cart (one-time orders only).
--   • cancel_pending_order   — releases reserved gift cards, marks 'cancelled'.
--   • create_recurring_order — builds the next period's pending order for a
--                             subscription (merchant-initiated recurring charge).
--   • cancel_subscription    — owner stops future recurring charges.
--
-- See docs/plans/robokassa-payments.md.

-- ─── 1. UserSubscriptions (the recurring anchor) ─────────────────────────────
CREATE TABLE IF NOT EXISTS "UserSubscriptions" (
  id                   serial        PRIMARY KEY,
  user_id              uuid          NOT NULL,
  subscription_id      integer       NOT NULL REFERENCES "Subscriptions"(id),
  -- The initial Recurring=true payment; Robokassa's PreviousInvoiceID.
  anchor_order_id      integer       NOT NULL REFERENCES "Orders"(id),
  status               text          NOT NULL DEFAULT 'active'
                                       CHECK (status IN ('active', 'cancelled', 'past_due')),
  amount               numeric(10,2) NOT NULL,
  payment_provider     text          NOT NULL DEFAULT 'mock',
  current_period_start timestamptz   NOT NULL DEFAULT now(),
  next_charge_at       timestamptz   NOT NULL,
  created_at           timestamptz   NOT NULL DEFAULT now(),
  cancelled_at         timestamptz   NULL
);

CREATE INDEX IF NOT EXISTS user_subscriptions_owner_active_idx
  ON "UserSubscriptions" (user_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS user_subscriptions_due_idx
  ON "UserSubscriptions" (next_charge_at) WHERE status = 'active';

ALTER TABLE "UserSubscriptions" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner reads own subscriptions" ON "UserSubscriptions";
CREATE POLICY "Owner reads own subscriptions" ON "UserSubscriptions"
  FOR SELECT USING (auth.uid() = user_id);
-- All writes go through the SECURITY DEFINER / service-role functions below.

-- ─── 2. Orders: lifecycle + recurring columns ────────────────────────────────
ALTER TABLE "Orders"
  ADD COLUMN IF NOT EXISTS recurring                 boolean       NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurring_amount          numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_provider          text          NOT NULL DEFAULT 'mock',
  ADD COLUMN IF NOT EXISTS recurring_subscription_id integer       NULL
                                                       REFERENCES "UserSubscriptions"(id);

ALTER TABLE "Orders" ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE "Orders" DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE "Orders" ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'paid', 'failed', 'cancelled'));

-- ─── 3. create_pending_order ─────────────────────────────────────────────────
-- Same pricing/snapshot/gift-card-reservation logic as place_order, but inserts
-- as 'pending' (paid_at NULL), defers gift-card ISSUANCE to payment, computes the
-- recurring (Subscription-category) portion, and leaves the cart intact.
CREATE OR REPLACE FUNCTION public.create_pending_order(
  p_provider             TEXT,
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
SECURITY INVOKER
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
  v_recurring_amount         numeric(10,2) := 0;
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

  SELECT pc.* INTO v_promo
  FROM "CartPromo" cp
  JOIN "PromoCodes" pc ON pc.id = cp.promo_id
  WHERE cp.user_id = v_user_id;

  IF FOUND THEN
    v_promo_applies := now() >= v_promo.starts_at AND now() <= v_promo.ends_at;
  ELSE
    v_promo_applies := false;
  END IF;

  FOR cart_row IN SELECT * FROM "Cart" WHERE user_id = v_user_id LOOP
    v_orig_unit := CASE
      WHEN cart_row.discount IS NOT NULL AND cart_row.discount > 0
        THEN round(cart_row.price / (1 - cart_row.discount / 100.0))
      ELSE cart_row.price
    END;
    v_orig_line := v_orig_unit * cart_row.quantity;
    v_subtotal := v_subtotal + (cart_row.price * cart_row.quantity);

    -- Recurring portion = sum of Subscription lines (re-billed each period).
    IF cart_row.category::text = 'Subscription' THEN
      v_recurring_amount := v_recurring_amount + (cart_row.price * cart_row.quantity);
    END IF;

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
    payment_provider, recurring, recurring_amount,
    paid_at
  ) VALUES (
    v_user_id, 'pending', v_final_total,
    v_delivery_method, NULLIF(p_email, ''),
    NULLIF(p_shipping_name, ''), NULLIF(p_shipping_phone, ''), NULLIF(p_shipping_city, ''),
    NULLIF(p_shipping_street, ''), NULLIF(p_shipping_building, ''), NULLIF(p_shipping_postal_code, ''),
    v_original_sum, v_book_disc_total,
    CASE WHEN v_promo_applies THEN v_promo.code ELSE NULL END,
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

GRANT EXECUTE ON FUNCTION public.create_pending_order(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, jsonb)
  TO anon, authenticated;

-- ─── 4. mark_order_paid (ResultURL webhook → service role) ───────────────────
-- Idempotent. Verifies the charged amount, issues gift cards, flips to 'paid',
-- creates/advances the recurring anchor, and wipes the cart for one-time orders.
CREATE OR REPLACE FUNCTION public.mark_order_paid(
  p_inv_id  integer,
  p_out_sum text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_order        "Orders"%ROWTYPE;
  v_user_id      uuid;
  item_row       record;
  v_product_id   integer;
  v_i            integer;
  v_sub_plan_id  integer;
  v_existing     integer;
BEGIN
  SELECT * INTO v_order FROM "Orders" WHERE id = p_inv_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'order_not_found');
  END IF;

  -- Idempotent: a re-delivered ResultURL is a success no-op.
  IF v_order.status = 'paid' THEN
    RETURN jsonb_build_object('status', 'ok', 'orderId', v_order.id, 'alreadyPaid', true);
  END IF;

  IF v_order.status <> 'pending' THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'not_pending');
  END IF;

  -- Guard against a tampered amount (tolerate sub-kopeck rounding).
  IF p_out_sum IS NOT NULL AND abs(v_order.amount_due - p_out_sum::numeric) > 0.01 THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'amount_mismatch');
  END IF;

  v_user_id := v_order.user_id;

  -- Issue gift cards now (deferred from create_pending_order).
  FOR item_row IN
    SELECT * FROM "OrderItems" WHERE order_id = v_order.id AND category = 'GiftCard'
  LOOP
    v_product_id := NULLIF(substring(item_row.book_id FROM '-(\d+)$'), '')::int;
    FOR v_i IN 1..COALESCE(item_row.quantity, 1) LOOP
      INSERT INTO "GiftCards" (code, product_id, owner_user_id, initial_value, balance, status, order_id)
      SELECT generate_gift_card_code(), gcp.id, v_user_id, gcp.face_value, gcp.face_value, 'active', v_order.id
      FROM "GiftCardProducts" gcp WHERE gcp.id = v_product_id;
    END LOOP;
  END LOOP;

  UPDATE "Orders" SET status = 'paid', paid_at = now() WHERE id = v_order.id;

  -- Recurring bookkeeping.
  IF v_order.recurring_subscription_id IS NOT NULL THEN
    -- A merchant-initiated recurring child charge → advance the anchor a month.
    UPDATE "UserSubscriptions"
       SET current_period_start = now(),
           next_charge_at = GREATEST(next_charge_at, now()) + interval '1 month',
           status = 'active'
     WHERE id = v_order.recurring_subscription_id;
  ELSIF v_order.recurring THEN
    -- The initial Recurring=true payment → create the anchor (once).
    SELECT id INTO v_existing FROM "UserSubscriptions" WHERE anchor_order_id = v_order.id;
    IF v_existing IS NULL THEN
      SELECT NULLIF(substring(book_id FROM '-(\d+)$'), '')::int INTO v_sub_plan_id
      FROM "OrderItems"
      WHERE order_id = v_order.id AND category = 'Subscription'
      ORDER BY id LIMIT 1;

      IF v_sub_plan_id IS NOT NULL THEN
        INSERT INTO "UserSubscriptions" (
          user_id, subscription_id, anchor_order_id, status, amount,
          payment_provider, current_period_start, next_charge_at
        ) VALUES (
          v_user_id, v_sub_plan_id, v_order.id, 'active', v_order.recurring_amount,
          v_order.payment_provider, now(), now() + interval '1 month'
        );
      END IF;
    END IF;
  END IF;

  -- Wipe the cart only for one-time / initial checkout orders, never for a
  -- recurring child charge (which must not touch the user's live cart).
  IF v_order.recurring_subscription_id IS NULL THEN
    DELETE FROM "CartPromo" WHERE user_id = v_user_id;
    DELETE FROM "Cart" WHERE user_id = v_user_id;
  END IF;

  RETURN jsonb_build_object('status', 'ok', 'orderId', v_order.id);
END;
$function$;

REVOKE ALL ON FUNCTION public.mark_order_paid(integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_order_paid(integer, text) TO service_role;

-- ─── 5. cancel_pending_order (FailURL / abandoned) ───────────────────────────
-- Releases reserved gift cards and marks the order 'cancelled'. Idempotent.
-- Callable by the owner (invoker) or service role.
CREATE OR REPLACE FUNCTION public.cancel_pending_order(p_order_id integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_order "Orders"%ROWTYPE;
  app_row record;
BEGIN
  SELECT * INTO v_order FROM "Orders" WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'order_not_found');
  END IF;

  -- Owners may only cancel their own order; service role bypasses auth.uid().
  IF auth.uid() IS NOT NULL AND auth.uid() IS DISTINCT FROM v_order.user_id THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'forbidden');
  END IF;

  IF v_order.status <> 'pending' THEN
    RETURN jsonb_build_object('status', 'ok', 'orderId', v_order.id, 'noop', true);
  END IF;

  -- Release reserved gift-card balances.
  FOR app_row IN
    SELECT * FROM "OrderGiftCardApplications" WHERE order_id = v_order.id
  LOOP
    UPDATE "GiftCards"
       SET balance = balance + app_row.amount,
           status = 'active'
     WHERE id = app_row.gift_card_id;
  END LOOP;
  DELETE FROM "OrderGiftCardApplications" WHERE order_id = v_order.id;

  UPDATE "Orders" SET status = 'cancelled' WHERE id = v_order.id;

  RETURN jsonb_build_object('status', 'ok', 'orderId', v_order.id);
END;
$function$;

REVOKE ALL ON FUNCTION public.cancel_pending_order(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_pending_order(integer) TO authenticated, service_role;

-- ─── 6. create_recurring_order (next period's pending charge) ────────────────
-- Builds a pending order for one subscription period and returns the data the
-- gateway client needs (new InvId, amount, anchor PreviousInvoiceID).
CREATE OR REPLACE FUNCTION public.create_recurring_order(
  p_user_subscription_id integer,
  p_provider             text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_sub      "UserSubscriptions"%ROWTYPE;
  v_plan     "Subscriptions"%ROWTYPE;
  v_order_id integer;
BEGIN
  SELECT * INTO v_sub FROM "UserSubscriptions" WHERE id = p_user_subscription_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'subscription_not_found');
  END IF;
  IF v_sub.status <> 'active' THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'subscription_inactive');
  END IF;

  SELECT * INTO v_plan FROM "Subscriptions" WHERE id = v_sub.subscription_id;

  INSERT INTO "Orders" (
    user_id, status, total,
    delivery_method, original_total, book_discount_total,
    promo_discount, gift_card_total_applied, amount_due,
    payment_provider, recurring, recurring_amount, recurring_subscription_id
  ) VALUES (
    v_sub.user_id, 'pending', v_sub.amount,
    'download', v_sub.amount, 0,
    0, 0, v_sub.amount,
    COALESCE(p_provider, v_sub.payment_provider), false, v_sub.amount, v_sub.id
  )
  RETURNING id INTO v_order_id;

  INSERT INTO "OrderItems" (order_id, book_id, name, price, quantity, category, box_set_name)
  VALUES (v_order_id, 'Subscription-' || v_sub.subscription_id,
          COALESCE(v_plan.name, 'Подписка') || ' — продление',
          v_sub.amount, 1, 'Subscription', NULL);

  RETURN jsonb_build_object(
    'status', 'ok',
    'orderId', v_order_id,
    'amount', v_sub.amount,
    'previousInvId', v_sub.anchor_order_id,
    'userId', v_sub.user_id
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.create_recurring_order(integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_recurring_order(integer, text) TO service_role;

-- ─── 7. cancel_subscription (owner stops future charges) ─────────────────────
CREATE OR REPLACE FUNCTION public.cancel_subscription(p_user_subscription_id integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'not_authenticated');
  END IF;

  UPDATE "UserSubscriptions"
     SET status = 'cancelled', cancelled_at = now()
   WHERE id = p_user_subscription_id AND user_id = v_uid AND status = 'active';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'not_found_or_inactive');
  END IF;

  RETURN jsonb_build_object('status', 'ok');
END;
$function$;

GRANT EXECUTE ON FUNCTION public.cancel_subscription(integer) TO authenticated;
