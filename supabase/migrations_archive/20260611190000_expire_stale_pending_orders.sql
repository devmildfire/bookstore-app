-- Auto-expire abandoned checkouts.
--
-- Every checkout writes a `pending` Orders row before the buyer is sent to the
-- gateway; if they never pay, that row lingers forever (visible in the cabinet's
-- order history as "Ожидает оплаты", and cluttering the admin list). After 7
-- days we cancel it: cancel_pending_order releases any reserved gift-card
-- balances and flips status → 'cancelled'. Run daily by pg_cron.

CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.expire_stale_pending_orders(p_days integer DEFAULT 7)
  RETURNS integer
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
DECLARE
  v_id    integer;
  v_count integer := 0;
BEGIN
  -- cancel_pending_order is reused for the gift-card release + status flip; with
  -- auth.uid() NULL (cron / service role) it skips the owner check.
  FOR v_id IN
    SELECT id FROM "Orders"
    WHERE status = 'pending'
      AND created_at < now() - make_interval(days => p_days)
  LOOP
    PERFORM cancel_pending_order(v_id);
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$function$;

-- Schedule (idempotent): daily at 03:17. The function defaults to 7 days.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-stale-pending-orders') THEN
    PERFORM cron.unschedule('expire-stale-pending-orders');
  END IF;
END $$;

SELECT cron.schedule(
  'expire-stale-pending-orders',
  '17 3 * * *',
  $$SELECT public.expire_stale_pending_orders(7)$$
);
