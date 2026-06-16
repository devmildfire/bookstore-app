-- Garbage-collect abandoned anonymous users.
--
-- Every first visit calls signInAnonymously(), creating an `auth.users` row
-- (is_anonymous = true) that owns the visitor's Cart / CartPromo / Likes / Orders /
-- GiftCards / Profile until they register (the anon→real migration moves it on sign-in).
-- Visitors who never come back leave those rows orphaned forever.
--
-- We reap an anon user only when there has been NO sign of life for `p_days` (default 35).
-- "Sign of life" is the freshest of: row creation, last explicit sign-in, the user row's
-- updated_at, and any session's activity — sessions.updated_at / refreshed_at bump every time
-- the proxy refreshes the access token on a visit. So an anon visitor who returns even once a
-- month keeps a fresh session and is RETAINED; only the truly-abandoned rows are deleted.
-- 35 days (not 30) is deliberate: a calendar month is up to 31 days, plus a time-of-day buffer,
-- so a genuine monthly visitor is never clipped. Run daily by pg_cron (sliding window).
--
-- NOTE: must be applied as a superuser (supabase_admin on the self-hosted prod DB) so the
-- SECURITY DEFINER owner can DELETE from auth.users. See docs/deployment/.

CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.gc_stale_anonymous_users(p_days integer DEFAULT 35)
  RETURNS integer
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
DECLARE
  v_cutoff timestamptz := now() - make_interval(days => p_days);
  v_doomed uuid[];
  v_count  integer := 0;
BEGIN
  SELECT array_agg(u.id) INTO v_doomed
  FROM auth.users u
  WHERE u.is_anonymous IS TRUE
    AND GREATEST(
          u.created_at,
          u.last_sign_in_at,
          u.updated_at,
          COALESCE((
            SELECT max(GREATEST(s.created_at, s.updated_at, s.refreshed_at))
            FROM auth.sessions s
            WHERE s.user_id = u.id
          ), u.created_at)
        ) < v_cutoff;

  IF v_doomed IS NULL THEN
    RETURN 0;
  END IF;

  -- UserSubscriptions.anchor_order_id -> Orders is ON DELETE NO ACTION and UserSubscriptions
  -- has no FK to auth.users, so the auth.users -> Orders cascade would be blocked / leave
  -- orphans. Clear the doomed users' subscriptions first. Everything else self-cleans on the
  -- auth.users delete: Cart / CartPromo / GiftCards / Likes / Orders (+ OrderItems &
  -- OrderGiftCardApplications via Orders) / Profiles all CASCADE; AdminAuditLog & Subscribers
  -- are SET NULL; auth.* (identities, sessions, refresh_tokens, …) all CASCADE.
  DELETE FROM "UserSubscriptions" WHERE user_id = ANY(v_doomed);

  DELETE FROM auth.users WHERE id = ANY(v_doomed);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$function$;

-- Destructive, cron-only — never callable from the browser-facing roles.
REVOKE ALL ON FUNCTION public.gc_stale_anonymous_users(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.gc_stale_anonymous_users(integer) FROM anon, authenticated;

-- Schedule (idempotent): daily at 03:30, just after expire-stale-pending-orders (03:17).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'gc-stale-anonymous-users') THEN
    PERFORM cron.unschedule('gc-stale-anonymous-users');
  END IF;
END $$;

SELECT cron.schedule(
  'gc-stale-anonymous-users',
  '30 3 * * *',
  $$SELECT public.gc_stale_anonymous_users(35)$$
);
