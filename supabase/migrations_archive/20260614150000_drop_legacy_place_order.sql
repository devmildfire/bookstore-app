-- Remove the legacy place_order RPC (data-architecture audit F9).
--
-- The single-shot place_order(...) was superseded by the two-phase checkout
-- (create_pending_order → mark_order_paid). Both overloads are unused — the TS
-- wrapper (placeOrder) and its action (placeOrderAction) had zero callers and are
-- deleted. Dropping them also removes a second, divergent copy of the pricing math
-- (pricing now lives only in compute_cart_totals).

DROP FUNCTION IF EXISTS public.place_order(
  p_shipping_name text, p_shipping_phone text, p_shipping_city text,
  p_shipping_street text, p_shipping_building text, p_shipping_postal_code text,
  p_email text
);

DROP FUNCTION IF EXISTS public.place_order(
  p_shipping_name text, p_shipping_phone text, p_shipping_city text,
  p_shipping_street text, p_shipping_building text, p_shipping_postal_code text,
  p_email text, p_gift_cards jsonb
);
