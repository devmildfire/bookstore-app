-- Rebuild Cart + OrderItems to the schema the codebase actually uses.
--
-- The live tables were a STALE shape (Cart: product_type; OrderItems:
-- product_id/product_type/title_id/original_price/final_price) that did not
-- match the write RPCs (create_pending_order / place_order insert
-- book_id/name/price/category/box_set_name), the read code (getOrders /
-- getDownloadUrl read book_id), or src/types/supabase.ts. As a result checkout
-- errored ("column book_id does not exist") and get_cart_with_title_ids failed
-- ("column category does not exist"). Both tables were empty, so this DROP+CREATE
-- loses no data. DDL reconstructed from the committed types + RPC column lists +
-- the cart_user_isolation RLS. See docs/CONCERNS.md (authoritative-schema gap).

-- ─── OrderItems ──────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS "OrderItems" CASCADE;
CREATE TABLE "OrderItems" (
  id           serial PRIMARY KEY,
  order_id     integer NOT NULL REFERENCES "Orders"(id) ON DELETE CASCADE,
  book_id      text NOT NULL,
  name         text NOT NULL DEFAULT '',
  price        numeric(10,2) NOT NULL DEFAULT 0,
  quantity     integer NOT NULL DEFAULT 1,
  category     text,
  box_set_name text
);
CREATE INDEX order_items_order_idx ON "OrderItems" (order_id);
ALTER TABLE "OrderItems" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_select_own" ON "OrderItems" FOR SELECT
  USING (EXISTS (SELECT 1 FROM "Orders" o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "order_items_insert_own" ON "OrderItems" FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM "Orders" o WHERE o.id = order_id AND o.user_id = auth.uid()));

-- ─── Cart ────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS "Cart" CASCADE;
CREATE TABLE "Cart" (
  id         text NOT NULL,
  user_id    uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL DEFAULT '',
  price      numeric(10,2),
  quantity   integer DEFAULT 1,
  category   category NOT NULL,
  discount   numeric,
  picture    text,
  subtitle   text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, id)
);
ALTER TABLE "Cart" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cart_select" ON "Cart" FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "cart_insert" ON "Cart" FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "cart_update" ON "Cart" FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "cart_delete" ON "Cart" FOR DELETE USING (user_id = auth.uid());
