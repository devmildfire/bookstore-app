-- Baseline schema for chtivo-next, generated from the live DB (pg_dump).
-- Consolidates the pre-2026-06-09 migration chain, which had drifted and
-- could no longer replay cleanly. Catalog/seed DATA lives in supabase/seed.sql.
-- See docs/CONCERNS.md (D1). Older migrations archived in supabase/migrations_archive/.

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;

--
-- PostgreSQL database dump
--

\restrict gfUgm29Fn5dnwuZPud72SGbOWtDrxFcOOJRUEBkD7r7asSaUqJkU0Ex0GbetQOJ

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: author_contact_channel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.author_contact_channel AS ENUM (
    'telegram',
    'instagram',
    'facebook',
    'twitter',
    'email',
    'website',
    'vk'
);


--
-- Name: category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.category AS ENUM (
    'PrintBook',
    'AudioBook',
    'EBook',
    'Book2.0',
    'GiftCard',
    'BoxSet',
    'Subscription',
    'Course'
);


--
-- Name: apply_promo_code(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.apply_promo_code(input_code text) RETURNS jsonb
    LANGUAGE plpgsql
    SET search_path TO 'public'
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


--
-- Name: box_set_is_physical(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.box_set_is_physical(p_box_set_id integer) RETURNS boolean
    LANGUAGE sql STABLE
    SET search_path TO 'public'
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


--
-- Name: cancel_pending_order(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cancel_pending_order(p_order_id integer) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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
$$;


--
-- Name: cancel_subscription(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cancel_subscription(p_user_subscription_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
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
$$;


--
-- Name: create_pending_order(text, text, text, text, text, text, text, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_pending_order(p_provider text, p_shipping_name text, p_shipping_phone text, p_shipping_city text, p_shipping_street text, p_shipping_building text, p_shipping_postal_code text, p_email text, p_gift_cards jsonb DEFAULT '[]'::jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $_$
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
$_$;


--
-- Name: create_recurring_order(integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_recurring_order(p_user_subscription_id integer, p_provider text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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
$$;


--
-- Name: default_edition_for_title(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.default_edition_for_title(p_title_id integer) RETURNS text
    LANGUAGE plpgsql STABLE
    SET search_path TO 'public'
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


--
-- Name: generate_gift_card_code(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_gift_card_code() RETURNS text
    LANGUAGE plpgsql
    SET search_path TO 'public'
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


--
-- Name: get_cart_with_title_ids(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_cart_with_title_ids() RETURNS TABLE(cart_id text, title_id integer)
    LANGUAGE sql STABLE
    SET search_path TO 'public'
    AS $$
  WITH cart_rows AS (
    SELECT
      id,
      category,
      NULLIF(SPLIT_PART(id, '-', 2), '')::integer AS edition_id
    FROM "Cart"
  )
  SELECT cr.id AS cart_id, e.title_id
    FROM cart_rows cr
    JOIN "Ebooks" e ON cr.category = 'EBook' AND e.id = cr.edition_id
  UNION ALL
  SELECT cr.id, a.title_id
    FROM cart_rows cr
    JOIN "Audiobooks" a ON cr.category = 'AudioBook' AND a.id = cr.edition_id
  UNION ALL
  SELECT cr.id, p.title_id
    FROM cart_rows cr
    JOIN "PrintedBooks" p ON cr.category = 'PrintBook' AND p.id = cr.edition_id
  UNION ALL
  SELECT cr.id, b.title_id
    FROM cart_rows cr
    JOIN "CardBooks" b ON cr.category = 'Book2.0' AND b.id = cr.edition_id;
$$;


--
-- Name: get_catalog_book_by_slug(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_catalog_book_by_slug(title_slug text) RETURNS TABLE(id integer, price numeric, discount integer, sold_out boolean, is_published boolean, publish_date text, release_date text, title_id integer, product_type text, title_name text, title_slug text, title_cover text, title_cover_blur text, title_description text, title_thesis text, title_lit_form text, title_age_restriction integer, title_first_release text, title_is_compilation boolean, author_names text[], title_awards jsonb, edition_details jsonb, edition_workers jsonb, title_booktrailer jsonb, title_authors jsonb, title_contexts jsonb)
    LANGUAGE sql STABLE
    AS $$
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
        'packaging',          cb.packaging,
        'demo_path',          cb.demo_path
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
        'character_count', e.character_count,
        'demo_path',       e.demo_path
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
        'file_size_bytes',  a.file_size_bytes,
        'demo_path',        a.demo_path
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
$$;


--
-- Name: get_catalog_books(integer, integer, text, text, text, numeric, numeric, text, integer[], text[], text[], text[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_catalog_books(result_limit integer DEFAULT 12, result_offset integer DEFAULT 0, search_term text DEFAULT NULL::text, product_type_filter text DEFAULT NULL::text, author_name text DEFAULT NULL::text, price_from numeric DEFAULT NULL::numeric, price_to numeric DEFAULT NULL::numeric, sort_by text DEFAULT 'year-desc'::text, title_ids integer[] DEFAULT NULL::integer[], product_type_filters text[] DEFAULT NULL::text[], author_names_filter text[] DEFAULT NULL::text[], year_filters text[] DEFAULT NULL::text[]) RETURNS TABLE(id integer, price numeric, discount integer, sold_out boolean, is_published boolean, publish_date text, release_date text, title_id integer, product_type text, title_name text, title_slug text, title_cover text, title_cover_blur text, title_description text, title_thesis text, title_lit_form text, title_age_restriction integer, title_first_release text, author_names text[], total_count bigint, has_multiple_products boolean)
    LANGUAGE sql STABLE
    AS $$
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
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Profiles" (
    user_id uuid NOT NULL,
    nickname text DEFAULT 'Никнейм'::text NOT NULL,
    avatar_path text,
    full_name text,
    phone text,
    birthday date,
    about text,
    recovery_email text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    city text
);


--
-- Name: get_or_create_profile(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_or_create_profile() RETURNS public."Profiles"
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row "Profiles";
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT * INTO v_row FROM "Profiles" WHERE user_id = v_uid;
  IF NOT FOUND THEN
    INSERT INTO "Profiles" (user_id)
    VALUES (v_uid)
    RETURNING * INTO v_row;
  END IF;

  RETURN v_row;
END;
$$;


--
-- Name: get_similar_books(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_similar_books(p_title_id integer) RETURNS TABLE(id integer, price numeric, discount integer, sold_out boolean, is_published boolean, publish_date text, release_date text, title_id integer, product_type text, title_name text, title_slug text, title_cover text, title_cover_blur text, title_description text, title_thesis text, title_lit_form text, title_age_restriction integer, title_first_release text, author_names text[], has_multiple_products boolean)
    LANGUAGE sql STABLE
    AS $$
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
$$;


--
-- Name: mark_order_paid(integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.mark_order_paid(p_inv_id integer, p_out_sum text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
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
$_$;


--
-- Name: migrate_anonymous_user(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.migrate_anonymous_user(from_user_id uuid, to_user_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: migrate_cart(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.migrate_cart(from_user_id uuid, to_user_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF to_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: may only migrate to your own user';
  END IF;

  -- Merge quantities for items that exist in both carts
  UPDATE "Cart" AS target
  SET quantity = COALESCE(target.quantity, 1) + COALESCE(source.quantity, 1)
  FROM "Cart" AS source
  WHERE target.user_id = to_user_id
    AND source.user_id = from_user_id
    AND target.id = source.id;

  -- Transfer items not yet in the target cart
  UPDATE "Cart"
  SET user_id = to_user_id
  WHERE user_id = from_user_id
    AND id NOT IN (
      SELECT id FROM "Cart" WHERE user_id = to_user_id
    );

  -- Remove any remaining source rows
  DELETE FROM "Cart" WHERE user_id = from_user_id;
END;
$$;


--
-- Name: place_order(text, text, text, text, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.place_order(p_shipping_name text, p_shipping_phone text, p_shipping_city text, p_shipping_street text, p_shipping_building text, p_shipping_postal_code text, p_email text) RETURNS jsonb
    LANGUAGE plpgsql
    SET search_path TO 'public'
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


--
-- Name: place_order(text, text, text, text, text, text, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.place_order(p_shipping_name text, p_shipping_phone text, p_shipping_city text, p_shipping_street text, p_shipping_building text, p_shipping_postal_code text, p_email text, p_gift_cards jsonb DEFAULT '[]'::jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $_$
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
$_$;


--
-- Name: profiles_touch_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.profiles_touch_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;


--
-- Name: redeem_gift_card_token(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.redeem_gift_card_token(p_token text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: search_books(text, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.search_books(search_term text, result_limit integer DEFAULT 12, result_offset integer DEFAULT 0) RETURNS TABLE(id integer, price numeric, sold_out boolean, is_published boolean, publish_date text, release_date text, title_id integer, title_name text, title_slug text, title_cover text, title_cover_blur text, title_description text, title_thesis text, title_lit_form text, title_age_restriction integer, title_first_release text, author_names text[], total_count bigint)
    LANGUAGE sql STABLE
    AS $$
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
$$;


--
-- Name: send_gift_card(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.send_gift_card(p_card_id uuid, p_recipient_email text) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: toggle_like(text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.toggle_like(p_item_type text, p_item_id integer) RETURNS boolean
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
DECLARE
  uid UUID := auth.uid();
  deleted_count INT;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM "Likes"
   WHERE user_id = uid
     AND item_type = p_item_type
     AND item_id = p_item_id;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  IF deleted_count > 0 THEN
    RETURN false;  -- was liked, now unliked
  END IF;

  INSERT INTO "Likes" (user_id, item_type, item_id) VALUES (uid, p_item_type, p_item_id);
  RETURN true;  -- now liked
END;
$$;


--
-- Name: AdminAuditLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AdminAuditLog" (
    id bigint NOT NULL,
    actor_user_id uuid,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id text NOT NULL,
    summary text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: AdminAuditLog_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."AdminAuditLog" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."AdminAuditLog_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: Articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Articles" (
    id integer NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    author_id integer NOT NULL,
    cover_path text,
    cover_blur text,
    excerpt text,
    content_blocks jsonb DEFAULT '[]'::jsonb NOT NULL,
    published_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    cover_width integer,
    cover_height integer,
    CONSTRAINT content_blocks_is_array CHECK ((jsonb_typeof(content_blocks) = 'array'::text))
);


--
-- Name: Articles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Articles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Articles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Articles_id_seq" OWNED BY public."Articles".id;


--
-- Name: AudiobookWorkers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AudiobookWorkers" (
    id integer NOT NULL,
    audiobook_id integer NOT NULL,
    worker_id integer NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: AudiobookWorkers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."AudiobookWorkers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: AudiobookWorkers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."AudiobookWorkers_id_seq" OWNED BY public."AudiobookWorkers".id;


--
-- Name: Audiobooks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Audiobooks" (
    id integer NOT NULL,
    title_id integer NOT NULL,
    price numeric(10,2),
    is_published boolean DEFAULT true,
    publish_date text,
    release_date text,
    duration_seconds integer,
    file_size_bytes bigint,
    file_path text,
    demo_path text,
    discount numeric(10,2),
    sold boolean DEFAULT false
);


--
-- Name: Audiobooks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Audiobooks_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Audiobooks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Audiobooks_id_seq" OWNED BY public."Audiobooks".id;


--
-- Name: AuthorContacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AuthorContacts" (
    id integer NOT NULL,
    author_id integer NOT NULL,
    channel public.author_contact_channel NOT NULL,
    url text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: AuthorContacts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."AuthorContacts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: AuthorContacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."AuthorContacts_id_seq" OWNED BY public."AuthorContacts".id;


--
-- Name: Authors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Authors" (
    id integer NOT NULL,
    name text NOT NULL,
    bio text,
    photo text,
    birth_date text,
    death_date text,
    city text,
    phrase text,
    nonsalable boolean DEFAULT false NOT NULL,
    photo_blur text
);


--
-- Name: Authors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Authors_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Authors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Authors_id_seq" OWNED BY public."Authors".id;


--
-- Name: Awards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Awards" (
    id integer NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    image text,
    "position" integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


--
-- Name: Awards_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Awards_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Awards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Awards_id_seq" OWNED BY public."Awards".id;


--
-- Name: BookContexts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BookContexts" (
    id integer NOT NULL,
    title_id integer NOT NULL,
    heading text NOT NULL,
    body text NOT NULL,
    url text,
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: BookContexts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."BookContexts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: BookContexts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."BookContexts_id_seq" OWNED BY public."BookContexts".id;


--
-- Name: Booktrailers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Booktrailers" (
    id integer NOT NULL,
    title_id integer NOT NULL,
    has_poster boolean DEFAULT true NOT NULL
);


--
-- Name: Booktrailers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Booktrailers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Booktrailers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Booktrailers_id_seq" OWNED BY public."Booktrailers".id;


--
-- Name: BoxSetBooks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BoxSetBooks" (
    id integer NOT NULL,
    box_set_id integer NOT NULL,
    title_id integer NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    product_id text
);


--
-- Name: COLUMN "BoxSetBooks".product_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."BoxSetBooks".product_id IS 'NULL = entry means all editions of title_id. Set (e.g. ''PrintBook-12'') = specific edition. Mirrors Cart.id format.';


--
-- Name: BoxSetBooks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."BoxSetBooks_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: BoxSetBooks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."BoxSetBooks_id_seq" OWNED BY public."BoxSetBooks".id;


--
-- Name: BoxSets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BoxSets" (
    id integer NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    description text,
    price integer NOT NULL,
    discount integer,
    image text,
    "position" integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    publish_date text,
    CONSTRAINT "BoxSets_price_check" CHECK ((price >= 0))
);


--
-- Name: BoxSets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."BoxSets_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: BoxSets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."BoxSets_id_seq" OWNED BY public."BoxSets".id;


--
-- Name: CardBookWorkers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CardBookWorkers" (
    id integer NOT NULL,
    card_book_id integer NOT NULL,
    worker_id integer NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: CardBookWorkers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."CardBookWorkers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: CardBookWorkers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."CardBookWorkers_id_seq" OWNED BY public."CardBookWorkers".id;


--
-- Name: CardBooks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CardBooks" (
    id integer NOT NULL,
    title_id integer NOT NULL,
    price numeric(10,2),
    sold_out boolean DEFAULT false,
    is_published boolean DEFAULT true,
    publish_date text,
    release_date text,
    discount numeric(10,2),
    sold integer DEFAULT 0,
    demo text,
    extra text,
    counter_color text,
    demo_path text,
    format text,
    printing_technique text,
    paper text,
    packaging text,
    file_path text
);


--
-- Name: CardBooks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."CardBooks_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: CardBooks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."CardBooks_id_seq" OWNED BY public."CardBooks".id;


--
-- Name: Cart; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Cart" (
    id text NOT NULL,
    user_id uuid DEFAULT auth.uid() NOT NULL,
    name text DEFAULT ''::text NOT NULL,
    price numeric(10,2),
    quantity integer DEFAULT 1,
    category public.category NOT NULL,
    discount numeric,
    picture text,
    subtitle text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: CartPromo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CartPromo" (
    user_id uuid NOT NULL,
    promo_id uuid NOT NULL,
    applied_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: EbookWorkers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EbookWorkers" (
    id integer NOT NULL,
    ebook_id integer NOT NULL,
    worker_id integer NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: EbookWorkers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."EbookWorkers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: EbookWorkers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."EbookWorkers_id_seq" OWNED BY public."EbookWorkers".id;


--
-- Name: Ebooks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Ebooks" (
    id integer NOT NULL,
    title_id integer NOT NULL,
    price numeric(10,2),
    is_published boolean DEFAULT true,
    publish_date text,
    release_date text,
    formats text[],
    character_count integer,
    file_path text,
    demo_path text,
    discount numeric(10,2),
    sold boolean DEFAULT false
);


--
-- Name: Ebooks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Ebooks_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Ebooks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Ebooks_id_seq" OWNED BY public."Ebooks".id;


--
-- Name: GiftCardProducts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."GiftCardProducts" (
    id integer NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    face_value integer NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    image_path text,
    CONSTRAINT "GiftCardProducts_face_value_check" CHECK ((face_value > 0))
);


--
-- Name: GiftCardProducts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."GiftCardProducts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: GiftCardProducts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."GiftCardProducts_id_seq" OWNED BY public."GiftCardProducts".id;


--
-- Name: GiftCards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."GiftCards" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    product_id integer NOT NULL,
    owner_user_id uuid,
    initial_value integer NOT NULL,
    balance integer NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    claim_token text,
    pending_recipient_email text,
    sent_at timestamp with time zone,
    order_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "GiftCards_balance_check" CHECK ((balance >= 0)),
    CONSTRAINT "GiftCards_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'pending'::text, 'depleted'::text]))),
    CONSTRAINT gift_cards_balance_bounds CHECK ((balance <= initial_value)),
    CONSTRAINT gift_cards_pending_token_state CHECK ((((status = 'pending'::text) AND (claim_token IS NOT NULL) AND (sent_at IS NOT NULL)) OR ((status <> 'pending'::text) AND (claim_token IS NULL) AND (sent_at IS NULL)))),
    CONSTRAINT gift_cards_status_balance CHECK ((((status = 'depleted'::text) AND (balance = 0)) OR ((status = ANY (ARRAY['active'::text, 'pending'::text])) AND (balance > 0))))
);


--
-- Name: Likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Likes" (
    user_id uuid NOT NULL,
    item_type text NOT NULL,
    item_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: COLUMN "Likes".item_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."Likes".item_type IS 'Polymorphic target type: ''title'' for Titles, ''box_set'' for BoxSets, etc.';


--
-- Name: OrderGiftCardApplications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrderGiftCardApplications" (
    id integer NOT NULL,
    order_id integer NOT NULL,
    gift_card_id uuid NOT NULL,
    amount integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "OrderGiftCardApplications_amount_check" CHECK ((amount > 0))
);


--
-- Name: OrderGiftCardApplications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."OrderGiftCardApplications_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: OrderGiftCardApplications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."OrderGiftCardApplications_id_seq" OWNED BY public."OrderGiftCardApplications".id;


--
-- Name: OrderItems; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrderItems" (
    id integer NOT NULL,
    order_id integer NOT NULL,
    book_id text NOT NULL,
    name text DEFAULT ''::text NOT NULL,
    price numeric(10,2) DEFAULT 0 NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    category text,
    box_set_name text
);


--
-- Name: OrderItems_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."OrderItems_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: OrderItems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."OrderItems_id_seq" OWNED BY public."OrderItems".id;


--
-- Name: Orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Orders" (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    original_total numeric(10,2) DEFAULT 0 NOT NULL,
    book_discount_total numeric(10,2) DEFAULT 0 NOT NULL,
    promo_code text,
    promo_discount numeric(10,2) DEFAULT 0 NOT NULL,
    shipping_cost numeric(10,2) DEFAULT 0 NOT NULL,
    total numeric(10,2) DEFAULT 0 NOT NULL,
    full_name text,
    phone text,
    email text,
    city text,
    address text,
    postal_code text,
    comment text,
    paid_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    shipping_name text,
    shipping_phone text,
    shipping_city text,
    shipping_street text,
    shipping_building text,
    shipping_postal_code text,
    gift_card_total_applied numeric(10,2) DEFAULT 0 NOT NULL,
    amount_due numeric(10,2) DEFAULT 0 NOT NULL,
    recurring boolean DEFAULT false NOT NULL,
    recurring_amount numeric(10,2) DEFAULT 0 NOT NULL,
    payment_provider text DEFAULT 'mock'::text NOT NULL,
    recurring_subscription_id integer,
    fulfillment_status text DEFAULT 'processing'::text NOT NULL,
    tracking_number text,
    tracking_carrier text,
    admin_note text,
    delivery_method text,
    delivery_email text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT orders_fulfillment_status_check CHECK ((fulfillment_status = ANY (ARRAY['processing'::text, 'shipped'::text, 'delivered'::text, 'completed'::text]))),
    CONSTRAINT orders_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'cancelled'::text])))
);


--
-- Name: Orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Orders_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Orders_id_seq" OWNED BY public."Orders".id;


--
-- Name: Partners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Partners" (
    id integer NOT NULL,
    name text NOT NULL,
    logo_path text,
    website_url text,
    sort_order integer DEFAULT 0 NOT NULL,
    logo_caption text
);


--
-- Name: Partners_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Partners_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Partners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Partners_id_seq" OWNED BY public."Partners".id;


--
-- Name: PrintedBookWorkers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PrintedBookWorkers" (
    id integer NOT NULL,
    printed_book_id integer NOT NULL,
    worker_id integer NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: PrintedBookWorkers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."PrintedBookWorkers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: PrintedBookWorkers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."PrintedBookWorkers_id_seq" OWNED BY public."PrintedBookWorkers".id;


--
-- Name: PrintedBooks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PrintedBooks" (
    id integer NOT NULL,
    title_id integer NOT NULL,
    price numeric(10,2),
    sold_out boolean DEFAULT false,
    is_published boolean DEFAULT true,
    publish_date text,
    release_date text,
    format text,
    page_count integer,
    paper text,
    cover_material text,
    binding text,
    illustrations text,
    demo_path text,
    discount numeric(10,2),
    sold boolean DEFAULT false
);


--
-- Name: PrintedBooks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."PrintedBooks_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: PrintedBooks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."PrintedBooks_id_seq" OWNED BY public."PrintedBooks".id;


--
-- Name: PromoCodes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PromoCodes" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    kind text NOT NULL,
    target_title_id integer,
    target_product_id text,
    discount_pct smallint NOT NULL,
    starts_at timestamp with time zone NOT NULL,
    ends_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "PromoCodes_discount_pct_check" CHECK (((discount_pct >= 1) AND (discount_pct <= 100))),
    CONSTRAINT "PromoCodes_kind_check" CHECK ((kind = ANY (ARRAY['cart'::text, 'item'::text]))),
    CONSTRAINT promo_dates CHECK ((starts_at < ends_at)),
    CONSTRAINT promo_kind_targets CHECK ((((kind = 'cart'::text) AND (target_title_id IS NULL) AND (target_product_id IS NULL)) OR ((kind = 'item'::text) AND (((target_title_id IS NOT NULL) AND (target_product_id IS NULL)) OR ((target_title_id IS NULL) AND (target_product_id IS NOT NULL))))))
);


--
-- Name: Subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Subscriptions" (
    id integer NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    perks text[] DEFAULT '{}'::text[] NOT NULL,
    price integer NOT NULL,
    image text,
    "position" integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    description text,
    discount integer,
    is_published boolean DEFAULT true NOT NULL,
    publish_date text,
    image_blur text
);


--
-- Name: Subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Subscriptions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Subscriptions_id_seq" OWNED BY public."Subscriptions".id;


--
-- Name: TitleSimilarTitles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TitleSimilarTitles" (
    id integer NOT NULL,
    title_id integer NOT NULL,
    similar_title_id integer NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "TitleSimilarTitles_check" CHECK ((title_id <> similar_title_id))
);


--
-- Name: TitleSimilarTitles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."TitleSimilarTitles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: TitleSimilarTitles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."TitleSimilarTitles_id_seq" OWNED BY public."TitleSimilarTitles".id;


--
-- Name: Titles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Titles" (
    id integer NOT NULL,
    name text NOT NULL,
    slug text,
    cover text,
    description text,
    thesis text,
    demo text,
    trailer text,
    trailer_poster text,
    age_restriction integer,
    first_release text,
    is_compilation boolean DEFAULT false NOT NULL,
    is_featured boolean DEFAULT false,
    lit_form text,
    cover_blur text,
    book_photos_blurs jsonb,
    status text DEFAULT 'published'::text NOT NULL,
    CONSTRAINT titles_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text])))
);


--
-- Name: Titles_Authors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Titles_Authors" (
    id integer NOT NULL,
    title_id integer NOT NULL,
    author_id integer NOT NULL
);


--
-- Name: Titles_Authors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Titles_Authors_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Titles_Authors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Titles_Authors_id_seq" OWNED BY public."Titles_Authors".id;


--
-- Name: Titles_Awards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Titles_Awards" (
    id integer NOT NULL,
    title_id integer NOT NULL,
    award_id integer NOT NULL,
    "position" integer DEFAULT 0 NOT NULL
);


--
-- Name: Titles_Awards_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Titles_Awards_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Titles_Awards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Titles_Awards_id_seq" OWNED BY public."Titles_Awards".id;


--
-- Name: Titles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Titles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Titles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Titles_id_seq" OWNED BY public."Titles".id;


--
-- Name: UserSubscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserSubscriptions" (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    subscription_id integer NOT NULL,
    anchor_order_id integer NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_provider text DEFAULT 'mock'::text NOT NULL,
    current_period_start timestamp with time zone DEFAULT now() NOT NULL,
    next_charge_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    cancelled_at timestamp with time zone,
    CONSTRAINT "UserSubscriptions_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'cancelled'::text, 'past_due'::text])))
);


--
-- Name: UserSubscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."UserSubscriptions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: UserSubscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."UserSubscriptions_id_seq" OWNED BY public."UserSubscriptions".id;


--
-- Name: Workers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Workers" (
    id integer NOT NULL,
    name text NOT NULL,
    job text NOT NULL,
    photo_path text,
    city text,
    is_team_member boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: Workers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Workers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Workers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Workers_id_seq" OWNED BY public."Workers".id;


--
-- Name: featured_books; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.featured_books (
    id bigint NOT NULL,
    title_id bigint NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: featured_books_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.featured_books ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.featured_books_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: Articles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Articles" ALTER COLUMN id SET DEFAULT nextval('public."Articles_id_seq"'::regclass);


--
-- Name: AudiobookWorkers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AudiobookWorkers" ALTER COLUMN id SET DEFAULT nextval('public."AudiobookWorkers_id_seq"'::regclass);


--
-- Name: Audiobooks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Audiobooks" ALTER COLUMN id SET DEFAULT nextval('public."Audiobooks_id_seq"'::regclass);


--
-- Name: AuthorContacts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuthorContacts" ALTER COLUMN id SET DEFAULT nextval('public."AuthorContacts_id_seq"'::regclass);


--
-- Name: Authors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Authors" ALTER COLUMN id SET DEFAULT nextval('public."Authors_id_seq"'::regclass);


--
-- Name: Awards id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Awards" ALTER COLUMN id SET DEFAULT nextval('public."Awards_id_seq"'::regclass);


--
-- Name: BookContexts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BookContexts" ALTER COLUMN id SET DEFAULT nextval('public."BookContexts_id_seq"'::regclass);


--
-- Name: Booktrailers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Booktrailers" ALTER COLUMN id SET DEFAULT nextval('public."Booktrailers_id_seq"'::regclass);


--
-- Name: BoxSetBooks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BoxSetBooks" ALTER COLUMN id SET DEFAULT nextval('public."BoxSetBooks_id_seq"'::regclass);


--
-- Name: BoxSets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BoxSets" ALTER COLUMN id SET DEFAULT nextval('public."BoxSets_id_seq"'::regclass);


--
-- Name: CardBookWorkers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CardBookWorkers" ALTER COLUMN id SET DEFAULT nextval('public."CardBookWorkers_id_seq"'::regclass);


--
-- Name: CardBooks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CardBooks" ALTER COLUMN id SET DEFAULT nextval('public."CardBooks_id_seq"'::regclass);


--
-- Name: EbookWorkers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EbookWorkers" ALTER COLUMN id SET DEFAULT nextval('public."EbookWorkers_id_seq"'::regclass);


--
-- Name: Ebooks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ebooks" ALTER COLUMN id SET DEFAULT nextval('public."Ebooks_id_seq"'::regclass);


--
-- Name: GiftCardProducts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GiftCardProducts" ALTER COLUMN id SET DEFAULT nextval('public."GiftCardProducts_id_seq"'::regclass);


--
-- Name: OrderGiftCardApplications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderGiftCardApplications" ALTER COLUMN id SET DEFAULT nextval('public."OrderGiftCardApplications_id_seq"'::regclass);


--
-- Name: OrderItems id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItems" ALTER COLUMN id SET DEFAULT nextval('public."OrderItems_id_seq"'::regclass);


--
-- Name: Orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Orders" ALTER COLUMN id SET DEFAULT nextval('public."Orders_id_seq"'::regclass);


--
-- Name: Partners id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Partners" ALTER COLUMN id SET DEFAULT nextval('public."Partners_id_seq"'::regclass);


--
-- Name: PrintedBookWorkers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrintedBookWorkers" ALTER COLUMN id SET DEFAULT nextval('public."PrintedBookWorkers_id_seq"'::regclass);


--
-- Name: PrintedBooks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrintedBooks" ALTER COLUMN id SET DEFAULT nextval('public."PrintedBooks_id_seq"'::regclass);


--
-- Name: Subscriptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subscriptions" ALTER COLUMN id SET DEFAULT nextval('public."Subscriptions_id_seq"'::regclass);


--
-- Name: TitleSimilarTitles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TitleSimilarTitles" ALTER COLUMN id SET DEFAULT nextval('public."TitleSimilarTitles_id_seq"'::regclass);


--
-- Name: Titles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Titles" ALTER COLUMN id SET DEFAULT nextval('public."Titles_id_seq"'::regclass);


--
-- Name: Titles_Authors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Titles_Authors" ALTER COLUMN id SET DEFAULT nextval('public."Titles_Authors_id_seq"'::regclass);


--
-- Name: Titles_Awards id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Titles_Awards" ALTER COLUMN id SET DEFAULT nextval('public."Titles_Awards_id_seq"'::regclass);


--
-- Name: UserSubscriptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserSubscriptions" ALTER COLUMN id SET DEFAULT nextval('public."UserSubscriptions_id_seq"'::regclass);


--
-- Name: Workers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Workers" ALTER COLUMN id SET DEFAULT nextval('public."Workers_id_seq"'::regclass);


--
-- Name: AdminAuditLog AdminAuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminAuditLog"
    ADD CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY (id);


--
-- Name: Articles Articles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Articles"
    ADD CONSTRAINT "Articles_pkey" PRIMARY KEY (id);


--
-- Name: Articles Articles_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Articles"
    ADD CONSTRAINT "Articles_slug_key" UNIQUE (slug);


--
-- Name: AudiobookWorkers AudiobookWorkers_audiobook_id_worker_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AudiobookWorkers"
    ADD CONSTRAINT "AudiobookWorkers_audiobook_id_worker_id_key" UNIQUE (audiobook_id, worker_id);


--
-- Name: AudiobookWorkers AudiobookWorkers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AudiobookWorkers"
    ADD CONSTRAINT "AudiobookWorkers_pkey" PRIMARY KEY (id);


--
-- Name: Audiobooks Audiobooks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Audiobooks"
    ADD CONSTRAINT "Audiobooks_pkey" PRIMARY KEY (id);


--
-- Name: AuthorContacts AuthorContacts_author_id_channel_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuthorContacts"
    ADD CONSTRAINT "AuthorContacts_author_id_channel_key" UNIQUE (author_id, channel);


--
-- Name: AuthorContacts AuthorContacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuthorContacts"
    ADD CONSTRAINT "AuthorContacts_pkey" PRIMARY KEY (id);


--
-- Name: Authors Authors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Authors"
    ADD CONSTRAINT "Authors_pkey" PRIMARY KEY (id);


--
-- Name: Awards Awards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Awards"
    ADD CONSTRAINT "Awards_pkey" PRIMARY KEY (id);


--
-- Name: Awards Awards_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Awards"
    ADD CONSTRAINT "Awards_slug_key" UNIQUE (slug);


--
-- Name: BookContexts BookContexts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BookContexts"
    ADD CONSTRAINT "BookContexts_pkey" PRIMARY KEY (id);


--
-- Name: Booktrailers Booktrailers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Booktrailers"
    ADD CONSTRAINT "Booktrailers_pkey" PRIMARY KEY (id);


--
-- Name: Booktrailers Booktrailers_title_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Booktrailers"
    ADD CONSTRAINT "Booktrailers_title_id_key" UNIQUE (title_id);


--
-- Name: BoxSetBooks BoxSetBooks_box_set_id_title_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BoxSetBooks"
    ADD CONSTRAINT "BoxSetBooks_box_set_id_title_id_key" UNIQUE (box_set_id, title_id);


--
-- Name: BoxSetBooks BoxSetBooks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BoxSetBooks"
    ADD CONSTRAINT "BoxSetBooks_pkey" PRIMARY KEY (id);


--
-- Name: BoxSets BoxSets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BoxSets"
    ADD CONSTRAINT "BoxSets_pkey" PRIMARY KEY (id);


--
-- Name: BoxSets BoxSets_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BoxSets"
    ADD CONSTRAINT "BoxSets_slug_key" UNIQUE (slug);


--
-- Name: CardBookWorkers CardBookWorkers_card_book_id_worker_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CardBookWorkers"
    ADD CONSTRAINT "CardBookWorkers_card_book_id_worker_id_key" UNIQUE (card_book_id, worker_id);


--
-- Name: CardBookWorkers CardBookWorkers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CardBookWorkers"
    ADD CONSTRAINT "CardBookWorkers_pkey" PRIMARY KEY (id);


--
-- Name: CardBooks CardBooks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CardBooks"
    ADD CONSTRAINT "CardBooks_pkey" PRIMARY KEY (id);


--
-- Name: CardBooks CardBooks_title_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CardBooks"
    ADD CONSTRAINT "CardBooks_title_id_key" UNIQUE (title_id);


--
-- Name: CartPromo CartPromo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CartPromo"
    ADD CONSTRAINT "CartPromo_pkey" PRIMARY KEY (user_id);


--
-- Name: Cart Cart_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_pkey" PRIMARY KEY (user_id, id);


--
-- Name: EbookWorkers EbookWorkers_ebook_id_worker_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EbookWorkers"
    ADD CONSTRAINT "EbookWorkers_ebook_id_worker_id_key" UNIQUE (ebook_id, worker_id);


--
-- Name: EbookWorkers EbookWorkers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EbookWorkers"
    ADD CONSTRAINT "EbookWorkers_pkey" PRIMARY KEY (id);


--
-- Name: Ebooks Ebooks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ebooks"
    ADD CONSTRAINT "Ebooks_pkey" PRIMARY KEY (id);


--
-- Name: GiftCardProducts GiftCardProducts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GiftCardProducts"
    ADD CONSTRAINT "GiftCardProducts_pkey" PRIMARY KEY (id);


--
-- Name: GiftCardProducts GiftCardProducts_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GiftCardProducts"
    ADD CONSTRAINT "GiftCardProducts_slug_key" UNIQUE (slug);


--
-- Name: GiftCards GiftCards_claim_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GiftCards"
    ADD CONSTRAINT "GiftCards_claim_token_key" UNIQUE (claim_token);


--
-- Name: GiftCards GiftCards_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GiftCards"
    ADD CONSTRAINT "GiftCards_code_key" UNIQUE (code);


--
-- Name: GiftCards GiftCards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GiftCards"
    ADD CONSTRAINT "GiftCards_pkey" PRIMARY KEY (id);


--
-- Name: Likes Likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Likes"
    ADD CONSTRAINT "Likes_pkey" PRIMARY KEY (user_id, item_type, item_id);


--
-- Name: OrderGiftCardApplications OrderGiftCardApplications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderGiftCardApplications"
    ADD CONSTRAINT "OrderGiftCardApplications_pkey" PRIMARY KEY (id);


--
-- Name: OrderItems OrderItems_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_pkey" PRIMARY KEY (id);


--
-- Name: Orders Orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_pkey" PRIMARY KEY (id);


--
-- Name: Partners Partners_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Partners"
    ADD CONSTRAINT "Partners_name_key" UNIQUE (name);


--
-- Name: Partners Partners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Partners"
    ADD CONSTRAINT "Partners_pkey" PRIMARY KEY (id);


--
-- Name: PrintedBookWorkers PrintedBookWorkers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrintedBookWorkers"
    ADD CONSTRAINT "PrintedBookWorkers_pkey" PRIMARY KEY (id);


--
-- Name: PrintedBookWorkers PrintedBookWorkers_printed_book_id_worker_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrintedBookWorkers"
    ADD CONSTRAINT "PrintedBookWorkers_printed_book_id_worker_id_key" UNIQUE (printed_book_id, worker_id);


--
-- Name: PrintedBooks PrintedBooks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrintedBooks"
    ADD CONSTRAINT "PrintedBooks_pkey" PRIMARY KEY (id);


--
-- Name: Profiles Profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Profiles"
    ADD CONSTRAINT "Profiles_pkey" PRIMARY KEY (user_id);


--
-- Name: PromoCodes PromoCodes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PromoCodes"
    ADD CONSTRAINT "PromoCodes_pkey" PRIMARY KEY (id);


--
-- Name: Subscriptions Subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subscriptions"
    ADD CONSTRAINT "Subscriptions_pkey" PRIMARY KEY (id);


--
-- Name: Subscriptions Subscriptions_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subscriptions"
    ADD CONSTRAINT "Subscriptions_slug_key" UNIQUE (slug);


--
-- Name: TitleSimilarTitles TitleSimilarTitles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TitleSimilarTitles"
    ADD CONSTRAINT "TitleSimilarTitles_pkey" PRIMARY KEY (id);


--
-- Name: TitleSimilarTitles TitleSimilarTitles_title_id_similar_title_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TitleSimilarTitles"
    ADD CONSTRAINT "TitleSimilarTitles_title_id_similar_title_id_key" UNIQUE (title_id, similar_title_id);


--
-- Name: Titles_Authors Titles_Authors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Titles_Authors"
    ADD CONSTRAINT "Titles_Authors_pkey" PRIMARY KEY (id);


--
-- Name: Titles_Awards Titles_Awards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Titles_Awards"
    ADD CONSTRAINT "Titles_Awards_pkey" PRIMARY KEY (id);


--
-- Name: Titles_Awards Titles_Awards_title_id_award_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Titles_Awards"
    ADD CONSTRAINT "Titles_Awards_title_id_award_id_key" UNIQUE (title_id, award_id);


--
-- Name: Titles Titles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Titles"
    ADD CONSTRAINT "Titles_pkey" PRIMARY KEY (id);


--
-- Name: Titles Titles_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Titles"
    ADD CONSTRAINT "Titles_slug_key" UNIQUE (slug);


--
-- Name: UserSubscriptions UserSubscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserSubscriptions"
    ADD CONSTRAINT "UserSubscriptions_pkey" PRIMARY KEY (id);


--
-- Name: Workers Workers_name_job_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Workers"
    ADD CONSTRAINT "Workers_name_job_key" UNIQUE (name, job);


--
-- Name: Workers Workers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Workers"
    ADD CONSTRAINT "Workers_pkey" PRIMARY KEY (id);


--
-- Name: featured_books featured_books_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.featured_books
    ADD CONSTRAINT featured_books_pkey PRIMARY KEY (id);


--
-- Name: featured_books featured_books_title_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.featured_books
    ADD CONSTRAINT featured_books_title_id_key UNIQUE (title_id);


--
-- Name: Likes_user_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Likes_user_id_created_at_idx" ON public."Likes" USING btree (user_id, created_at DESC);


--
-- Name: admin_audit_entity_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_audit_entity_idx ON public."AdminAuditLog" USING btree (entity_type, entity_id, created_at DESC);


--
-- Name: bookcontexts_title_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bookcontexts_title_id_idx ON public."BookContexts" USING btree (title_id);


--
-- Name: gift_cards_claim_token_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gift_cards_claim_token_idx ON public."GiftCards" USING btree (claim_token) WHERE (claim_token IS NOT NULL);


--
-- Name: gift_cards_owner_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gift_cards_owner_active_idx ON public."GiftCards" USING btree (owner_user_id) WHERE (status = 'active'::text);


--
-- Name: idx_articles_author; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_articles_author ON public."Articles" USING btree (author_id);


--
-- Name: idx_articles_published_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_articles_published_desc ON public."Articles" USING btree (published_at DESC, id DESC);


--
-- Name: idx_authors_name_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_authors_name_trgm ON public."Authors" USING gin (name public.gin_trgm_ops);


--
-- Name: idx_title_similar_titles_title_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_title_similar_titles_title_id ON public."TitleSimilarTitles" USING btree (title_id);


--
-- Name: idx_titles_name_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_titles_name_trgm ON public."Titles" USING gin (name public.gin_trgm_ops);


--
-- Name: order_gift_card_apps_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_gift_card_apps_order_idx ON public."OrderGiftCardApplications" USING btree (order_id);


--
-- Name: order_items_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_items_order_idx ON public."OrderItems" USING btree (order_id);


--
-- Name: promo_codes_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX promo_codes_active_idx ON public."PromoCodes" USING btree (starts_at, ends_at);


--
-- Name: promo_codes_code_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX promo_codes_code_unique ON public."PromoCodes" USING btree (upper(code));


--
-- Name: titles_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX titles_status_idx ON public."Titles" USING btree (status);


--
-- Name: user_subscriptions_due_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_subscriptions_due_idx ON public."UserSubscriptions" USING btree (next_charge_at) WHERE (status = 'active'::text);


--
-- Name: user_subscriptions_owner_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_subscriptions_owner_active_idx ON public."UserSubscriptions" USING btree (user_id) WHERE (status = 'active'::text);


--
-- Name: workers_team_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX workers_team_idx ON public."Workers" USING btree (sort_order) WHERE (is_team_member = true);


--
-- Name: Profiles profiles_touch_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER profiles_touch_updated_at BEFORE UPDATE ON public."Profiles" FOR EACH ROW EXECUTE FUNCTION public.profiles_touch_updated_at();


--
-- Name: AdminAuditLog AdminAuditLog_actor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminAuditLog"
    ADD CONSTRAINT "AdminAuditLog_actor_user_id_fkey" FOREIGN KEY (actor_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: Articles Articles_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Articles"
    ADD CONSTRAINT "Articles_author_id_fkey" FOREIGN KEY (author_id) REFERENCES public."Authors"(id) ON DELETE RESTRICT;


--
-- Name: AudiobookWorkers AudiobookWorkers_audiobook_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AudiobookWorkers"
    ADD CONSTRAINT "AudiobookWorkers_audiobook_id_fkey" FOREIGN KEY (audiobook_id) REFERENCES public."Audiobooks"(id) ON DELETE CASCADE;


--
-- Name: AudiobookWorkers AudiobookWorkers_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AudiobookWorkers"
    ADD CONSTRAINT "AudiobookWorkers_worker_id_fkey" FOREIGN KEY (worker_id) REFERENCES public."Workers"(id) ON DELETE CASCADE;


--
-- Name: Audiobooks Audiobooks_title_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Audiobooks"
    ADD CONSTRAINT "Audiobooks_title_id_fkey" FOREIGN KEY (title_id) REFERENCES public."Titles"(id) ON DELETE CASCADE;


--
-- Name: AuthorContacts AuthorContacts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuthorContacts"
    ADD CONSTRAINT "AuthorContacts_author_id_fkey" FOREIGN KEY (author_id) REFERENCES public."Authors"(id) ON DELETE CASCADE;


--
-- Name: BookContexts BookContexts_title_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BookContexts"
    ADD CONSTRAINT "BookContexts_title_id_fkey" FOREIGN KEY (title_id) REFERENCES public."Titles"(id) ON DELETE CASCADE;


--
-- Name: Booktrailers Booktrailers_title_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Booktrailers"
    ADD CONSTRAINT "Booktrailers_title_id_fkey" FOREIGN KEY (title_id) REFERENCES public."Titles"(id) ON DELETE CASCADE;


--
-- Name: BoxSetBooks BoxSetBooks_box_set_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BoxSetBooks"
    ADD CONSTRAINT "BoxSetBooks_box_set_id_fkey" FOREIGN KEY (box_set_id) REFERENCES public."BoxSets"(id) ON DELETE CASCADE;


--
-- Name: BoxSetBooks BoxSetBooks_title_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BoxSetBooks"
    ADD CONSTRAINT "BoxSetBooks_title_id_fkey" FOREIGN KEY (title_id) REFERENCES public."Titles"(id) ON DELETE CASCADE;


--
-- Name: CardBookWorkers CardBookWorkers_card_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CardBookWorkers"
    ADD CONSTRAINT "CardBookWorkers_card_book_id_fkey" FOREIGN KEY (card_book_id) REFERENCES public."CardBooks"(id) ON DELETE CASCADE;


--
-- Name: CardBookWorkers CardBookWorkers_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CardBookWorkers"
    ADD CONSTRAINT "CardBookWorkers_worker_id_fkey" FOREIGN KEY (worker_id) REFERENCES public."Workers"(id) ON DELETE CASCADE;


--
-- Name: CardBooks CardBooks_title_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CardBooks"
    ADD CONSTRAINT "CardBooks_title_id_fkey" FOREIGN KEY (title_id) REFERENCES public."Titles"(id) ON DELETE CASCADE;


--
-- Name: CartPromo CartPromo_promo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CartPromo"
    ADD CONSTRAINT "CartPromo_promo_id_fkey" FOREIGN KEY (promo_id) REFERENCES public."PromoCodes"(id) ON DELETE CASCADE;


--
-- Name: CartPromo CartPromo_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CartPromo"
    ADD CONSTRAINT "CartPromo_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: Cart Cart_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: EbookWorkers EbookWorkers_ebook_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EbookWorkers"
    ADD CONSTRAINT "EbookWorkers_ebook_id_fkey" FOREIGN KEY (ebook_id) REFERENCES public."Ebooks"(id) ON DELETE CASCADE;


--
-- Name: EbookWorkers EbookWorkers_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EbookWorkers"
    ADD CONSTRAINT "EbookWorkers_worker_id_fkey" FOREIGN KEY (worker_id) REFERENCES public."Workers"(id) ON DELETE CASCADE;


--
-- Name: Ebooks Ebooks_title_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ebooks"
    ADD CONSTRAINT "Ebooks_title_id_fkey" FOREIGN KEY (title_id) REFERENCES public."Titles"(id) ON DELETE CASCADE;


--
-- Name: GiftCards GiftCards_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GiftCards"
    ADD CONSTRAINT "GiftCards_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public."Orders"(id) ON DELETE SET NULL;


--
-- Name: GiftCards GiftCards_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GiftCards"
    ADD CONSTRAINT "GiftCards_owner_user_id_fkey" FOREIGN KEY (owner_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: GiftCards GiftCards_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GiftCards"
    ADD CONSTRAINT "GiftCards_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."GiftCardProducts"(id);


--
-- Name: Likes Likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Likes"
    ADD CONSTRAINT "Likes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: OrderGiftCardApplications OrderGiftCardApplications_gift_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderGiftCardApplications"
    ADD CONSTRAINT "OrderGiftCardApplications_gift_card_id_fkey" FOREIGN KEY (gift_card_id) REFERENCES public."GiftCards"(id);


--
-- Name: OrderGiftCardApplications OrderGiftCardApplications_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderGiftCardApplications"
    ADD CONSTRAINT "OrderGiftCardApplications_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public."Orders"(id) ON DELETE CASCADE;


--
-- Name: OrderItems OrderItems_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public."Orders"(id) ON DELETE CASCADE;


--
-- Name: Orders Orders_recurring_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_recurring_subscription_id_fkey" FOREIGN KEY (recurring_subscription_id) REFERENCES public."UserSubscriptions"(id);


--
-- Name: Orders Orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: PrintedBookWorkers PrintedBookWorkers_printed_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrintedBookWorkers"
    ADD CONSTRAINT "PrintedBookWorkers_printed_book_id_fkey" FOREIGN KEY (printed_book_id) REFERENCES public."PrintedBooks"(id) ON DELETE CASCADE;


--
-- Name: PrintedBookWorkers PrintedBookWorkers_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrintedBookWorkers"
    ADD CONSTRAINT "PrintedBookWorkers_worker_id_fkey" FOREIGN KEY (worker_id) REFERENCES public."Workers"(id) ON DELETE CASCADE;


--
-- Name: PrintedBooks PrintedBooks_title_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrintedBooks"
    ADD CONSTRAINT "PrintedBooks_title_id_fkey" FOREIGN KEY (title_id) REFERENCES public."Titles"(id) ON DELETE CASCADE;


--
-- Name: Profiles Profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Profiles"
    ADD CONSTRAINT "Profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: PromoCodes PromoCodes_target_title_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PromoCodes"
    ADD CONSTRAINT "PromoCodes_target_title_id_fkey" FOREIGN KEY (target_title_id) REFERENCES public."Titles"(id) ON DELETE CASCADE;


--
-- Name: TitleSimilarTitles TitleSimilarTitles_similar_title_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TitleSimilarTitles"
    ADD CONSTRAINT "TitleSimilarTitles_similar_title_id_fkey" FOREIGN KEY (similar_title_id) REFERENCES public."Titles"(id) ON DELETE CASCADE;


--
-- Name: TitleSimilarTitles TitleSimilarTitles_title_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TitleSimilarTitles"
    ADD CONSTRAINT "TitleSimilarTitles_title_id_fkey" FOREIGN KEY (title_id) REFERENCES public."Titles"(id) ON DELETE CASCADE;


--
-- Name: Titles_Authors Titles_Authors_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Titles_Authors"
    ADD CONSTRAINT "Titles_Authors_author_id_fkey" FOREIGN KEY (author_id) REFERENCES public."Authors"(id) ON DELETE CASCADE;


--
-- Name: Titles_Authors Titles_Authors_title_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Titles_Authors"
    ADD CONSTRAINT "Titles_Authors_title_id_fkey" FOREIGN KEY (title_id) REFERENCES public."Titles"(id) ON DELETE CASCADE;


--
-- Name: Titles_Awards Titles_Awards_award_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Titles_Awards"
    ADD CONSTRAINT "Titles_Awards_award_id_fkey" FOREIGN KEY (award_id) REFERENCES public."Awards"(id) ON DELETE CASCADE;


--
-- Name: Titles_Awards Titles_Awards_title_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Titles_Awards"
    ADD CONSTRAINT "Titles_Awards_title_id_fkey" FOREIGN KEY (title_id) REFERENCES public."Titles"(id) ON DELETE CASCADE;


--
-- Name: UserSubscriptions UserSubscriptions_anchor_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserSubscriptions"
    ADD CONSTRAINT "UserSubscriptions_anchor_order_id_fkey" FOREIGN KEY (anchor_order_id) REFERENCES public."Orders"(id);


--
-- Name: UserSubscriptions UserSubscriptions_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserSubscriptions"
    ADD CONSTRAINT "UserSubscriptions_subscription_id_fkey" FOREIGN KEY (subscription_id) REFERENCES public."Subscriptions"(id);


--
-- Name: featured_books featured_books_title_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.featured_books
    ADD CONSTRAINT featured_books_title_id_fkey FOREIGN KEY (title_id) REFERENCES public."Titles"(id) ON DELETE CASCADE;


--
-- Name: AdminAuditLog; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."AdminAuditLog" ENABLE ROW LEVEL SECURITY;

--
-- Name: Articles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Articles" ENABLE ROW LEVEL SECURITY;

--
-- Name: AudiobookWorkers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."AudiobookWorkers" ENABLE ROW LEVEL SECURITY;

--
-- Name: Audiobooks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Audiobooks" ENABLE ROW LEVEL SECURITY;

--
-- Name: featured_books Authenticated users can modify featured books; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can modify featured books" ON public.featured_books USING ((auth.uid() IS NOT NULL)) WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: AuthorContacts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."AuthorContacts" ENABLE ROW LEVEL SECURITY;

--
-- Name: Awards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Awards" ENABLE ROW LEVEL SECURITY;

--
-- Name: BookContexts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."BookContexts" ENABLE ROW LEVEL SECURITY;

--
-- Name: Booktrailers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Booktrailers" ENABLE ROW LEVEL SECURITY;

--
-- Name: BoxSetBooks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."BoxSetBooks" ENABLE ROW LEVEL SECURITY;

--
-- Name: BoxSets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."BoxSets" ENABLE ROW LEVEL SECURITY;

--
-- Name: CardBookWorkers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."CardBookWorkers" ENABLE ROW LEVEL SECURITY;

--
-- Name: Cart; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Cart" ENABLE ROW LEVEL SECURITY;

--
-- Name: CartPromo; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."CartPromo" ENABLE ROW LEVEL SECURITY;

--
-- Name: EbookWorkers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."EbookWorkers" ENABLE ROW LEVEL SECURITY;

--
-- Name: Ebooks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Ebooks" ENABLE ROW LEVEL SECURITY;

--
-- Name: featured_books Featured books are publicly readable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Featured books are publicly readable" ON public.featured_books FOR SELECT USING (true);


--
-- Name: GiftCardProducts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."GiftCardProducts" ENABLE ROW LEVEL SECURITY;

--
-- Name: GiftCards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."GiftCards" ENABLE ROW LEVEL SECURITY;

--
-- Name: Likes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Likes" ENABLE ROW LEVEL SECURITY;

--
-- Name: Likes Likes_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Likes_delete_own" ON public."Likes" FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: Likes Likes_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Likes_insert_own" ON public."Likes" FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: Likes Likes_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Likes_select_own" ON public."Likes" FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: OrderGiftCardApplications Order gift card apps insert own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Order gift card apps insert own" ON public."OrderGiftCardApplications" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public."Orders" o
  WHERE ((o.id = "OrderGiftCardApplications".order_id) AND (o.user_id = auth.uid())))));


--
-- Name: OrderGiftCardApplications Order gift card apps select own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Order gift card apps select own" ON public."OrderGiftCardApplications" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public."Orders" o
  WHERE ((o.id = "OrderGiftCardApplications".order_id) AND (o.user_id = auth.uid())))));


--
-- Name: OrderGiftCardApplications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."OrderGiftCardApplications" ENABLE ROW LEVEL SECURITY;

--
-- Name: OrderItems; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."OrderItems" ENABLE ROW LEVEL SECURITY;

--
-- Name: Orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Orders" ENABLE ROW LEVEL SECURITY;

--
-- Name: Orders Orders_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Orders_insert_own" ON public."Orders" FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: Orders Orders_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Orders_select_own" ON public."Orders" FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: Orders Orders_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Orders_update_own" ON public."Orders" FOR UPDATE USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: GiftCards Owner inserts own gift cards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner inserts own gift cards" ON public."GiftCards" FOR INSERT WITH CHECK ((auth.uid() = owner_user_id));


--
-- Name: GiftCards Owner reads own gift cards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner reads own gift cards" ON public."GiftCards" FOR SELECT USING ((auth.uid() = owner_user_id));


--
-- Name: UserSubscriptions Owner reads own subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner reads own subscriptions" ON public."UserSubscriptions" FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: GiftCards Owner updates own gift cards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner updates own gift cards" ON public."GiftCards" FOR UPDATE USING ((auth.uid() = owner_user_id)) WITH CHECK ((auth.uid() = owner_user_id));


--
-- Name: Partners; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Partners" ENABLE ROW LEVEL SECURITY;

--
-- Name: PrintedBookWorkers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."PrintedBookWorkers" ENABLE ROW LEVEL SECURITY;

--
-- Name: PrintedBooks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."PrintedBooks" ENABLE ROW LEVEL SECURITY;

--
-- Name: Profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Profiles" ENABLE ROW LEVEL SECURITY;

--
-- Name: PromoCodes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."PromoCodes" ENABLE ROW LEVEL SECURITY;

--
-- Name: Articles Public read articles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read articles" ON public."Articles" FOR SELECT USING (true);


--
-- Name: AudiobookWorkers Public read audiobook workers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read audiobook workers" ON public."AudiobookWorkers" FOR SELECT USING (true);


--
-- Name: Audiobooks Public read audiobooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read audiobooks" ON public."Audiobooks" FOR SELECT USING (true);


--
-- Name: AuthorContacts Public read author contacts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read author contacts" ON public."AuthorContacts" FOR SELECT USING (true);


--
-- Name: Awards Public read awards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read awards" ON public."Awards" FOR SELECT USING ((is_active = true));


--
-- Name: BookContexts Public read book contexts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read book contexts" ON public."BookContexts" FOR SELECT USING (true);


--
-- Name: Booktrailers Public read booktrailers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read booktrailers" ON public."Booktrailers" FOR SELECT USING (true);


--
-- Name: BoxSetBooks Public read box set books; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read box set books" ON public."BoxSetBooks" FOR SELECT USING (true);


--
-- Name: BoxSets Public read box sets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read box sets" ON public."BoxSets" FOR SELECT USING (((is_active = true) AND (is_published = true)));


--
-- Name: CardBookWorkers Public read card book workers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read card book workers" ON public."CardBookWorkers" FOR SELECT USING (true);


--
-- Name: EbookWorkers Public read ebook workers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read ebook workers" ON public."EbookWorkers" FOR SELECT USING (true);


--
-- Name: Ebooks Public read ebooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read ebooks" ON public."Ebooks" FOR SELECT USING (true);


--
-- Name: GiftCardProducts Public read gift card products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read gift card products" ON public."GiftCardProducts" FOR SELECT USING (true);


--
-- Name: Partners Public read partners; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read partners" ON public."Partners" FOR SELECT USING (true);


--
-- Name: PrintedBookWorkers Public read printed book workers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read printed book workers" ON public."PrintedBookWorkers" FOR SELECT USING (true);


--
-- Name: PrintedBooks Public read printed books; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read printed books" ON public."PrintedBooks" FOR SELECT USING (true);


--
-- Name: TitleSimilarTitles Public read similar titles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read similar titles" ON public."TitleSimilarTitles" FOR SELECT USING (true);


--
-- Name: Subscriptions Public read subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read subscriptions" ON public."Subscriptions" FOR SELECT USING (((is_active = true) AND (is_published = true)));


--
-- Name: Titles_Awards Public read title awards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read title awards" ON public."Titles_Awards" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public."Awards" a
  WHERE ((a.id = "Titles_Awards".award_id) AND (a.is_active = true)))));


--
-- Name: Workers Public read workers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read workers" ON public."Workers" FOR SELECT USING (true);


--
-- Name: Subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Subscriptions" ENABLE ROW LEVEL SECURITY;

--
-- Name: TitleSimilarTitles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."TitleSimilarTitles" ENABLE ROW LEVEL SECURITY;

--
-- Name: Titles_Awards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Titles_Awards" ENABLE ROW LEVEL SECURITY;

--
-- Name: UserSubscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."UserSubscriptions" ENABLE ROW LEVEL SECURITY;

--
-- Name: Workers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Workers" ENABLE ROW LEVEL SECURITY;

--
-- Name: AdminAuditLog admin_audit_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_audit_select ON public."AdminAuditLog" FOR SELECT USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));


--
-- Name: Cart cart_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cart_delete ON public."Cart" FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: Cart cart_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cart_insert ON public."Cart" FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: CartPromo cart_promo_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cart_promo_delete ON public."CartPromo" FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: CartPromo cart_promo_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cart_promo_insert ON public."CartPromo" FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: CartPromo cart_promo_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cart_promo_select ON public."CartPromo" FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: CartPromo cart_promo_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cart_promo_update ON public."CartPromo" FOR UPDATE USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: Cart cart_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cart_select ON public."Cart" FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: Cart cart_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cart_update ON public."Cart" FOR UPDATE USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: featured_books; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.featured_books ENABLE ROW LEVEL SECURITY;

--
-- Name: OrderItems order_items_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY order_items_insert_own ON public."OrderItems" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public."Orders" o
  WHERE ((o.id = "OrderItems".order_id) AND (o.user_id = auth.uid())))));


--
-- Name: OrderItems order_items_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY order_items_select_own ON public."OrderItems" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public."Orders" o
  WHERE ((o.id = "OrderItems".order_id) AND (o.user_id = auth.uid())))));


--
-- Name: Profiles profiles_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_insert ON public."Profiles" FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: Profiles profiles_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_select ON public."Profiles" FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: Profiles profiles_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_update ON public."Profiles" FOR UPDATE USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: PromoCodes promo_codes_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY promo_codes_select ON public."PromoCodes" FOR SELECT TO authenticated, anon USING (true);


--
-- PostgreSQL database dump complete
--

\unrestrict gfUgm29Fn5dnwuZPud72SGbOWtDrxFcOOJRUEBkD7r7asSaUqJkU0Ex0GbetQOJ


-- ─── Storage buckets ──────────────────────────────────────────────────────
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types) VALUES ('articles','articles','t','20971520','{image/jpeg,image/png,image/webp,image/avif}') ON CONFLICT (id) DO UPDATE SET public=EXCLUDED.public,file_size_limit=EXCLUDED.file_size_limit,allowed_mime_types=EXCLUDED.allowed_mime_types;
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types) VALUES ('authors','authors','t','10485760','{image/jpeg,image/png,image/webp,image/avif}') ON CONFLICT (id) DO UPDATE SET public=EXCLUDED.public,file_size_limit=EXCLUDED.file_size_limit,allowed_mime_types=EXCLUDED.allowed_mime_types;
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types) VALUES ('avatars','avatars','t','2097152','{image/jpeg,image/png,image/webp}') ON CONFLICT (id) DO UPDATE SET public=EXCLUDED.public,file_size_limit=EXCLUDED.file_size_limit,allowed_mime_types=EXCLUDED.allowed_mime_types;
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types) VALUES ('awards','awards','t','5242880','{image/svg+xml,image/png,image/jpeg,image/webp}') ON CONFLICT (id) DO UPDATE SET public=EXCLUDED.public,file_size_limit=EXCLUDED.file_size_limit,allowed_mime_types=EXCLUDED.allowed_mime_types;
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types) VALUES ('book-photos','book-photos','t','20971520','{image/jpeg,image/png,image/webp,image/avif}') ON CONFLICT (id) DO UPDATE SET public=EXCLUDED.public,file_size_limit=EXCLUDED.file_size_limit,allowed_mime_types=EXCLUDED.allowed_mime_types;
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types) VALUES ('booktrailers','booktrailers','t','104857600','{video/mp4,video/webm,image/jpeg,image/png,image/webp}') ON CONFLICT (id) DO UPDATE SET public=EXCLUDED.public,file_size_limit=EXCLUDED.file_size_limit,allowed_mime_types=EXCLUDED.allowed_mime_types;
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types) VALUES ('box-sets','box-sets','t','5242880','{image/svg+xml,image/png,image/jpeg,image/webp}') ON CONFLICT (id) DO UPDATE SET public=EXCLUDED.public,file_size_limit=EXCLUDED.file_size_limit,allowed_mime_types=EXCLUDED.allowed_mime_types;
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types) VALUES ('covers','covers','t',NULL,NULL) ON CONFLICT (id) DO UPDATE SET public=EXCLUDED.public,file_size_limit=EXCLUDED.file_size_limit,allowed_mime_types=EXCLUDED.allowed_mime_types;
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types) VALUES ('demos','demos','t','52428800','{application/pdf,application/epub+zip,text/plain,text/html,audio/mpeg,audio/mp4,audio/ogg,audio/webm,audio/wav,audio/x-m4a}') ON CONFLICT (id) DO UPDATE SET public=EXCLUDED.public,file_size_limit=EXCLUDED.file_size_limit,allowed_mime_types=EXCLUDED.allowed_mime_types;
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types) VALUES ('digital-files','digital-files','f','524288000',NULL) ON CONFLICT (id) DO UPDATE SET public=EXCLUDED.public,file_size_limit=EXCLUDED.file_size_limit,allowed_mime_types=EXCLUDED.allowed_mime_types;
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types) VALUES ('gift-cards','gift-cards','t',NULL,NULL) ON CONFLICT (id) DO UPDATE SET public=EXCLUDED.public,file_size_limit=EXCLUDED.file_size_limit,allowed_mime_types=EXCLUDED.allowed_mime_types;
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types) VALUES ('partners','partners','t','2097152','{image/svg+xml,image/png,image/jpeg}') ON CONFLICT (id) DO UPDATE SET public=EXCLUDED.public,file_size_limit=EXCLUDED.file_size_limit,allowed_mime_types=EXCLUDED.allowed_mime_types;
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types) VALUES ('story-submissions','story-submissions','f','4194304',NULL) ON CONFLICT (id) DO UPDATE SET public=EXCLUDED.public,file_size_limit=EXCLUDED.file_size_limit,allowed_mime_types=EXCLUDED.allowed_mime_types;
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types) VALUES ('subscriptions','subscriptions','t',NULL,NULL) ON CONFLICT (id) DO UPDATE SET public=EXCLUDED.public,file_size_limit=EXCLUDED.file_size_limit,allowed_mime_types=EXCLUDED.allowed_mime_types;
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types) VALUES ('videos','videos','t','83886080','{video/mp4}') ON CONFLICT (id) DO UPDATE SET public=EXCLUDED.public,file_size_limit=EXCLUDED.file_size_limit,allowed_mime_types=EXCLUDED.allowed_mime_types;
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types) VALUES ('workers','workers','t','2097152','{image/jpeg,image/png,image/webp}') ON CONFLICT (id) DO UPDATE SET public=EXCLUDED.public,file_size_limit=EXCLUDED.file_size_limit,allowed_mime_types=EXCLUDED.allowed_mime_types;

-- ─── Storage object policies ──────────────────────────────────────────────
CREATE POLICY "Public read article images" ON storage.objects FOR SELECT USING ((bucket_id = 'articles'::text));
CREATE POLICY "Public read author photos" ON storage.objects FOR SELECT USING ((bucket_id = 'authors'::text));
CREATE POLICY "Public read book photos" ON storage.objects FOR SELECT USING ((bucket_id = 'book-photos'::text));
CREATE POLICY "Public read booktrailers storage" ON storage.objects FOR SELECT USING ((bucket_id = 'booktrailers'::text));
CREATE POLICY avatars_delete ON storage.objects FOR DELETE USING (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));
CREATE POLICY avatars_insert ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));
CREATE POLICY avatars_select ON storage.objects FOR SELECT USING ((bucket_id = 'avatars'::text));
CREATE POLICY avatars_update ON storage.objects FOR UPDATE USING (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text))) WITH CHECK (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));
CREATE POLICY demos_delete ON storage.objects FOR DELETE USING (((bucket_id = 'demos'::text) AND ((auth.jwt() ->> 'role'::text) = 'service_role'::text)));
CREATE POLICY demos_insert ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'demos'::text) AND ((auth.jwt() ->> 'role'::text) = 'service_role'::text)));
CREATE POLICY demos_select ON storage.objects FOR SELECT USING ((bucket_id = 'demos'::text));
CREATE POLICY demos_update ON storage.objects FOR UPDATE USING (((bucket_id = 'demos'::text) AND ((auth.jwt() ->> 'role'::text) = 'service_role'::text)));
CREATE POLICY partners_select ON storage.objects FOR SELECT USING ((bucket_id = 'partners'::text));
CREATE POLICY story_submissions_insert ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'story-submissions'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));
CREATE POLICY story_submissions_select ON storage.objects FOR SELECT USING (((bucket_id = 'story-submissions'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));
CREATE POLICY videos_select ON storage.objects FOR SELECT USING ((bucket_id = 'videos'::text));
CREATE POLICY workers_select ON storage.objects FOR SELECT USING ((bucket_id = 'workers'::text));

-- Restored from archived migration 20260603160000_order_tracking_and_audit.sql
-- (lost during the D1 consolidation; Orders columns + AdminAuditLog survived, the function did not).
-- ─── 3. Atomic fulfillment update + audit entry ─────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_set_order_fulfillment(
  p_order_id        integer,
  p_status          text,
  p_tracking_number text,
  p_carrier         text,
  p_note            text,
  p_actor           uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_order "Orders"%ROWTYPE;
BEGIN
  IF p_status NOT IN ('processing', 'shipped', 'delivered', 'completed') THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'invalid_status');
  END IF;

  SELECT * INTO v_order FROM "Orders" WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'order_not_found');
  END IF;

  UPDATE "Orders"
     SET fulfillment_status = p_status,
         tracking_number    = NULLIF(btrim(coalesce(p_tracking_number, '')), ''),
         tracking_carrier   = NULLIF(btrim(coalesce(p_carrier, '')), ''),
         admin_note         = NULLIF(btrim(coalesce(p_note, '')), '')
   WHERE id = p_order_id;

  INSERT INTO "AdminAuditLog" (actor_user_id, action, entity_type, entity_id, summary, metadata)
  VALUES (
    p_actor,
    'order.fulfillment',
    'order',
    p_order_id::text,
    format('Статус доставки: %s → %s', v_order.fulfillment_status, p_status),
    jsonb_build_object(
      'from', v_order.fulfillment_status,
      'to', p_status,
      'tracking_number', NULLIF(btrim(coalesce(p_tracking_number, '')), ''),
      'carrier', NULLIF(btrim(coalesce(p_carrier, '')), '')
    )
  );

  RETURN jsonb_build_object('status', 'ok', 'orderId', p_order_id);
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_set_order_fulfillment(integer, text, text, text, text, uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_order_fulfillment(integer, text, text, text, text, uuid)
  TO service_role;
