-- Orders was missing checkout columns that create_pending_order/place_order
-- INSERT and the admin/frontend read (delivery_method, delivery_email,
-- updated_at) — a stale-table remnant of the 2026-06-06 wipe. Additive only;
-- Orders is empty. See docs/CONCERNS.md (D1). The fulfillment-aware
-- mark_order_paid (which reads delivery_method) is restored right after.
ALTER TABLE "Orders"
  ADD COLUMN IF NOT EXISTS delivery_method text,
  ADD COLUMN IF NOT EXISTS delivery_email  text,
  ADD COLUMN IF NOT EXISTS updated_at      timestamptz NOT NULL DEFAULT now();
