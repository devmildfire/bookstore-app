-- Post-restore security re-grant pass.
--
-- A pg_dump/pg_restore into a fresh Supabase DB does NOT preserve REVOKEs: the
-- supabase roles get ALL privileges back via ALTER DEFAULT PRIVILEGES on object
-- creation, and pg_dump emits no compensating REVOKE. So after every bootstrap
-- restore, re-apply the explicit grants/revokes the app relies on.
--
-- Run as the superuser after pg_restore:
--   docker compose exec -T db psql -U supabase_admin -d postgres -f - < post-restore-grants.sql
-- (or mount + \i). Idempotent.

-- Catalog tables: public read only; writes go through the admin (service role).
-- RLS already blocks anon writes, but keep the grant-level revoke as defense-in-depth.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public."Titles"         FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public."Authors"        FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public."Titles_Authors" FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public."Editions"       FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public."EditionWorkers" FROM anon, authenticated;

-- Admin-only RPC: must NOT be callable by anon/authenticated via PostgREST.
-- (No RLS on functions — the EXECUTE grant is the only gate.)
REVOKE ALL ON FUNCTION public.admin_set_order_fulfillment(integer, text, text, text, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_order_fulfillment(integer, text, text, text, text, uuid) TO service_role;
