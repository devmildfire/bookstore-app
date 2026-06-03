-- Order fulfillment status — separate from payment status. Drives the «Заказы»
-- (order history) tracking view: a physical order moves processing → shipped →
-- delivered; digital / course / subscription orders are completed on payment.
-- Advanced later via DB/admin (no UI in this pass).

ALTER TABLE "Orders"
  ADD COLUMN IF NOT EXISTS fulfillment_status text NOT NULL DEFAULT 'processing';

ALTER TABLE "Orders" DROP CONSTRAINT IF EXISTS orders_fulfillment_status_check;
ALTER TABLE "Orders" ADD CONSTRAINT orders_fulfillment_status_check
  CHECK (fulfillment_status IN ('processing', 'shipped', 'delivered', 'completed'));

-- Existing paid orders: physical (shipping) stay 'processing', the rest are done.
UPDATE "Orders"
   SET fulfillment_status = CASE WHEN delivery_method = 'shipping' THEN 'processing' ELSE 'completed' END
 WHERE status = 'paid';

-- mark_order_paid: stamp the initial fulfillment status alongside paid_at.
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

  IF v_order.status = 'paid' THEN
    RETURN jsonb_build_object('status', 'ok', 'orderId', v_order.id, 'alreadyPaid', true);
  END IF;

  IF v_order.status <> 'pending' THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'not_pending');
  END IF;

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

  UPDATE "Orders"
     SET status = 'paid',
         paid_at = now(),
         fulfillment_status = CASE WHEN delivery_method = 'shipping' THEN 'processing' ELSE 'completed' END
   WHERE id = v_order.id;

  -- Recurring bookkeeping.
  IF v_order.recurring_subscription_id IS NOT NULL THEN
    UPDATE "UserSubscriptions"
       SET current_period_start = now(),
           next_charge_at = GREATEST(next_charge_at, now()) + interval '1 month',
           status = 'active'
     WHERE id = v_order.recurring_subscription_id;
  ELSIF v_order.recurring THEN
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

  -- Wipe the cart only for one-time / initial checkout orders.
  IF v_order.recurring_subscription_id IS NULL THEN
    DELETE FROM "CartPromo" WHERE user_id = v_user_id;
    DELETE FROM "Cart" WHERE user_id = v_user_id;
  END IF;

  RETURN jsonb_build_object('status', 'ok', 'orderId', v_order.id);
END;
$function$;

REVOKE ALL ON FUNCTION public.mark_order_paid(integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_order_paid(integer, text) TO service_role;
