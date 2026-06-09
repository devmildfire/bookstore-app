-- Orders had RLS ENABLED but ZERO policies (lost in the 2026-06-06 wipe), which
-- blocks the SECURITY INVOKER checkout RPC (create_pending_order) from inserting
-- orders. Restore the owner-scoped policies from orders_rls. See CONCERNS D1.
DROP POLICY IF EXISTS "Orders_select_own" ON "Orders";
CREATE POLICY "Orders_select_own" ON "Orders" FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Orders_insert_own" ON "Orders";
CREATE POLICY "Orders_insert_own" ON "Orders" FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Orders_update_own" ON "Orders";
CREATE POLICY "Orders_update_own" ON "Orders" FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
