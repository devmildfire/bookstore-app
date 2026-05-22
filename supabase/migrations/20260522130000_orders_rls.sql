-- Lock down Orders and OrderItems.
--
-- These tables were left with RLS disabled, which meant a plain
-- `SELECT * FROM "Orders"` from any authenticated user returned every
-- order in the database. The orders list filtered nothing explicitly,
-- so users were seeing other users' orders (and any 'not_owner' check
-- downstream failed when they tried to act on those rows).
--
-- Policies:
--   • Orders     — SELECT / UPDATE: owner only. INSERT: only insert
--                  rows for yourself (place_order runs as caller).
--   • OrderItems — SELECT / INSERT / DELETE: only when the parent
--                  Order belongs to you. No UPDATE policy (OrderItems
--                  are immutable snapshots).

ALTER TABLE "Orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItems" ENABLE ROW LEVEL SECURITY;

-- ─── Orders ─────────────────────────────────────────────────────────────────
CREATE POLICY "Orders_select_own" ON "Orders"
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Orders_insert_own" ON "Orders"
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Orders_update_own" ON "Orders"
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- No DELETE policy: orders are kept for the record even when a user is
-- deleted (Orders.user_id has no FK).

-- ─── OrderItems ─────────────────────────────────────────────────────────────
CREATE POLICY "OrderItems_select_own" ON "OrderItems"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Orders" o
       WHERE o.id = "OrderItems".order_id
         AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "OrderItems_insert_own" ON "OrderItems"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Orders" o
       WHERE o.id = "OrderItems".order_id
         AND o.user_id = auth.uid()
    )
  );

-- OrderItems are immutable snapshots — no UPDATE / DELETE policies.
-- (CASCADE on Orders.id handles cleanup if an Order is ever deleted.)
