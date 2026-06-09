-- Cart user isolation — adds user_id column, composite PK, RLS policies, and
-- a migrate_cart function for transferring anonymous cart items on login.
-- Unblocks A6 (cart migration) and resolves C6 (unverified RLS).

-- ─── 1. Add user_id column ────────────────────────────────────────────────────
-- Nullable first so existing rows are not immediately rejected.
ALTER TABLE "Cart"
  ADD COLUMN IF NOT EXISTS user_id uuid
    REFERENCES auth.users(id) ON DELETE CASCADE;

-- Delete rows that have no owner — they are unrecoverable anonymous orphans.
DELETE FROM "Cart" WHERE user_id IS NULL;

-- Now enforce NOT NULL and set the default for future inserts.
ALTER TABLE "Cart" ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE "Cart" ALTER COLUMN user_id SET DEFAULT auth.uid();

-- ─── 2. Replace single-column PK with composite (user_id, id) ─────────────────
-- id stores the product ID — multiple users can each have the same product.
DO $$
DECLARE
  _pk text;
BEGIN
  SELECT constraint_name INTO _pk
  FROM information_schema.table_constraints
  WHERE table_name = 'Cart' AND constraint_type = 'PRIMARY KEY';
  IF _pk IS NOT NULL THEN
    EXECUTE format('ALTER TABLE "Cart" DROP CONSTRAINT %I', _pk);
  END IF;
END $$;

ALTER TABLE "Cart" ADD PRIMARY KEY (user_id, id);

-- ─── 3. Enable RLS ────────────────────────────────────────────────────────────
ALTER TABLE "Cart" ENABLE ROW LEVEL SECURITY;

-- Drop any pre-existing policies (dashboard-created names are unknown, so try common patterns)
DROP POLICY IF EXISTS "cart_select"                                  ON "Cart";
DROP POLICY IF EXISTS "cart_insert"                                  ON "Cart";
DROP POLICY IF EXISTS "cart_update"                                  ON "Cart";
DROP POLICY IF EXISTS "cart_delete"                                  ON "Cart";
DROP POLICY IF EXISTS "Enable read access for all users"             ON "Cart";
DROP POLICY IF EXISTS "Enable insert for authenticated users only"   ON "Cart";
DROP POLICY IF EXISTS "Enable update for users based on id"          ON "Cart";
DROP POLICY IF EXISTS "Enable delete for users based on id"          ON "Cart";

CREATE POLICY "cart_select" ON "Cart"
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "cart_insert" ON "Cart"
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "cart_update" ON "Cart"
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "cart_delete" ON "Cart"
  FOR DELETE USING (user_id = auth.uid());

-- ─── 4. migrate_cart ─────────────────────────────────────────────────────────
-- Merges the anonymous user's cart into the authenticated user's cart.
-- SECURITY DEFINER lets it bypass RLS to move rows across user_id values.
-- Validates that the caller is migrating TO themselves (auth.uid() = to_user_id).
CREATE OR REPLACE FUNCTION migrate_cart(from_user_id uuid, to_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

REVOKE ALL ON FUNCTION migrate_cart(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION migrate_cart(uuid, uuid) TO authenticated;
