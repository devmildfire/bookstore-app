-- Polymorphic Likes table — one row per (user, item_type, item_id).
--
-- item_type is a free-form string ('title', 'box_set', and future entities
-- like 'subscription', 'course', etc.) so adding a new likeable product
-- needs no schema or migration changes.
--
-- We do NOT FK item_id to any specific table; the trade-off is no
-- DB-enforced referential integrity for likes, but full flexibility
-- across polymorphic targets. Orphan rows (item deleted) just become
-- invisible — the favorites page joins against the target table and
-- drops anything that doesn't resolve.
--
-- RLS scopes every row to its owner (user_id = auth.uid()). The
-- `toggle_like(item_type, item_id)` RPC runs as caller (SECURITY INVOKER)
-- and just lets RLS gate writes — no special privilege needed.

CREATE TABLE IF NOT EXISTS "Likes" (
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type  TEXT        NOT NULL,
  item_id    INTEGER     NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, item_type, item_id)
);

COMMENT ON COLUMN "Likes".item_type IS
  'Polymorphic target type: ''title'' for Titles, ''box_set'' for BoxSets, etc.';

-- "All my likes, newest first" is the dominant query (favorites page).
CREATE INDEX IF NOT EXISTS "Likes_user_id_created_at_idx"
  ON "Likes" (user_id, created_at DESC);

-- ─── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE "Likes" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes_select_own" ON "Likes"
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Likes_insert_own" ON "Likes"
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Likes_delete_own" ON "Likes"
  FOR DELETE USING (user_id = auth.uid());

-- (No UPDATE policy — likes are immutable: insert or delete only.)

-- ─── toggle_like RPC ────────────────────────────────────────────────────────
-- Atomic: returns true if the item is NOW liked (inserted), false if it
-- was unliked (deleted). Single round-trip from the client.
CREATE OR REPLACE FUNCTION toggle_like(p_item_type TEXT, p_item_id INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
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

REVOKE ALL ON FUNCTION toggle_like(TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION toggle_like(TEXT, INTEGER) TO authenticated;

-- ─── Extend migrate_anonymous_user to move Likes ────────────────────────────
-- The body adds a Likes block before the final DELETE FROM auth.users.
-- Conflict policy: target wins (anon's like on an item already liked by
-- target gets dropped; otherwise anon's row is moved over).
CREATE OR REPLACE FUNCTION migrate_anonymous_user(from_user_id uuid, to_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

  -- ─── Cart: merge quantities for shared rows ──────────────────────────────
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

  -- ─── Orders: reassign every row ──────────────────────────────────────────
  UPDATE "Orders" SET user_id = to_user_id WHERE user_id = from_user_id;

  -- ─── CartPromo: target wins on conflict ──────────────────────────────────
  DELETE FROM "CartPromo"
   WHERE user_id = from_user_id
     AND EXISTS (SELECT 1 FROM "CartPromo" WHERE user_id = to_user_id);
  UPDATE "CartPromo" SET user_id = to_user_id WHERE user_id = from_user_id;

  -- ─── Profiles: target wins on conflict ───────────────────────────────────
  DELETE FROM "Profiles"
   WHERE user_id = from_user_id
     AND EXISTS (SELECT 1 FROM "Profiles" WHERE user_id = to_user_id);
  UPDATE "Profiles" SET user_id = to_user_id WHERE user_id = from_user_id;

  -- ─── Likes: target wins on conflict ──────────────────────────────────────
  -- Drop anon rows that would duplicate an existing target row, then move
  -- the remainder. PK is (user_id, item_type, item_id).
  DELETE FROM "Likes" anon
   WHERE anon.user_id = from_user_id
     AND EXISTS (
       SELECT 1 FROM "Likes" tgt
        WHERE tgt.user_id = to_user_id
          AND tgt.item_type = anon.item_type
          AND tgt.item_id = anon.item_id
     );
  UPDATE "Likes" SET user_id = to_user_id WHERE user_id = from_user_id;

  -- ─── Drop the anonymous auth.users row ───────────────────────────────────
  DELETE FROM auth.users WHERE id = from_user_id AND is_anonymous = true;
END;
$$;
