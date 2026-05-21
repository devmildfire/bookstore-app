-- migrate_anonymous_user(from, to) — replaces migrate_cart for the anon→OAuth
-- handoff. Moves every user-scoped row from the anon user onto the caller's
-- (authenticated) UID, then deletes the anon auth.users row. SECURITY DEFINER
-- so it can bypass RLS and write auth.users; caller is constrained to
-- to_user_id = auth.uid().
--
-- Why this exists: linkIdentity (the "in-place upgrade" Supabase API) cannot
-- handle the multi-device case — a returning user whose anon session on a
-- new device tries to "link" Google fails because that Google identity is
-- already attached to another user, locking them out. The robust dispatch is
-- always signInWithOAuth, then migrate. See src/lib/profile/actions.ts.
--
-- Tables touched (every table FK'd to auth.users plus Orders which has no FK):
--   • Cart                — merge: sum quantities for shared rows, move the rest
--   • CartPromo           — PK is user_id: keep target's if present, drop source's
--   • Profiles            — PK is user_id: keep target's if present, drop source's
--   • Orders              — no FK: just reassign user_id (multi-row, no PK conflict)
--   • auth.users (anon)   — delete at the end

CREATE OR REPLACE FUNCTION migrate_anonymous_user(from_user_id uuid, to_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only the authenticated user may pull data onto themselves.
  IF to_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: may only migrate into your own user';
  END IF;

  -- No-op for from = to (defensive; callers shouldn't hit this).
  IF from_user_id = to_user_id THEN
    RETURN;
  END IF;

  -- Only allow migration FROM an anonymous user. Refusing here prevents
  -- a hostile caller from collapsing a real user's data into theirs.
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = from_user_id AND is_anonymous = true
  ) THEN
    RAISE EXCEPTION 'Source user is not anonymous (or does not exist)';
  END IF;

  -- ─── Cart: merge quantities for shared rows ────────────────────────────────
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

  -- ─── Orders: reassign every row to the new user ────────────────────────────
  UPDATE "Orders" SET user_id = to_user_id WHERE user_id = from_user_id;

  -- ─── CartPromo: target wins on conflict ────────────────────────────────────
  DELETE FROM "CartPromo"
   WHERE user_id = from_user_id
     AND EXISTS (SELECT 1 FROM "CartPromo" WHERE user_id = to_user_id);
  UPDATE "CartPromo" SET user_id = to_user_id WHERE user_id = from_user_id;

  -- ─── Profiles: target wins on conflict (see "Profile merge" decision) ─────
  DELETE FROM "Profiles"
   WHERE user_id = from_user_id
     AND EXISTS (SELECT 1 FROM "Profiles" WHERE user_id = to_user_id);
  UPDATE "Profiles" SET user_id = to_user_id WHERE user_id = from_user_id;

  -- ─── Drop the anon auth.users row ──────────────────────────────────────────
  -- All FK-dependent rows have been moved or removed above; CASCADE finds
  -- nothing to delete. is_anonymous guard mirrors the entry check.
  DELETE FROM auth.users WHERE id = from_user_id AND is_anonymous = true;
END;
$$;

REVOKE ALL ON FUNCTION migrate_anonymous_user(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION migrate_anonymous_user(uuid, uuid) TO authenticated;
