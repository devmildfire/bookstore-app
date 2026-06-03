-- Admin panel Phase 2 — order fulfillment extras + an admin audit log.
--   • Tracking number / carrier / internal note on Orders (set by logistics).
--   • AdminAuditLog: who did what, when (order transitions + destructive actions).
--   • admin_set_order_fulfillment(): atomic status update + audit entry.

-- ─── 1. Tracking + internal note ────────────────────────────────────────────
ALTER TABLE "Orders"
  ADD COLUMN IF NOT EXISTS tracking_number  text,
  ADD COLUMN IF NOT EXISTS tracking_carrier text,
  ADD COLUMN IF NOT EXISTS admin_note       text;

-- ─── 2. Admin audit log ─────────────────────────────────────────────────────
-- Written only via the service-role key (the gated admin Server Actions);
-- admins may read. No INSERT/UPDATE/DELETE policy → only service-role writes.
CREATE TABLE IF NOT EXISTS "AdminAuditLog" (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action        text NOT NULL,   -- e.g. 'order.fulfillment', 'book.archive'
  entity_type   text NOT NULL,   -- e.g. 'order', 'book'
  entity_id     text NOT NULL,
  summary       text NOT NULL,
  metadata      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_audit_entity_idx
  ON "AdminAuditLog" (entity_type, entity_id, created_at DESC);

ALTER TABLE "AdminAuditLog" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_audit_select ON "AdminAuditLog";
CREATE POLICY admin_audit_select ON "AdminAuditLog"
  FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ─── 3. Atomic fulfillment update + audit entry ─────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_set_order_fulfillment(
  p_order_id        integer,
  p_status          text,
  p_tracking_number text,
  p_carrier         text,
  p_note            text,
  p_actor           uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_order "Orders"%ROWTYPE;
BEGIN
  IF p_status NOT IN ('processing', 'shipped', 'delivered', 'completed') THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'invalid_status');
  END IF;

  SELECT * INTO v_order FROM "Orders" WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'reason', 'order_not_found');
  END IF;

  UPDATE "Orders"
     SET fulfillment_status = p_status,
         tracking_number    = NULLIF(btrim(coalesce(p_tracking_number, '')), ''),
         tracking_carrier   = NULLIF(btrim(coalesce(p_carrier, '')), ''),
         admin_note         = NULLIF(btrim(coalesce(p_note, '')), '')
   WHERE id = p_order_id;

  INSERT INTO "AdminAuditLog" (actor_user_id, action, entity_type, entity_id, summary, metadata)
  VALUES (
    p_actor,
    'order.fulfillment',
    'order',
    p_order_id::text,
    format('Статус доставки: %s → %s', v_order.fulfillment_status, p_status),
    jsonb_build_object(
      'from', v_order.fulfillment_status,
      'to', p_status,
      'tracking_number', NULLIF(btrim(coalesce(p_tracking_number, '')), ''),
      'carrier', NULLIF(btrim(coalesce(p_carrier, '')), '')
    )
  );

  RETURN jsonb_build_object('status', 'ok', 'orderId', p_order_id);
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_set_order_fulfillment(integer, text, text, text, text, uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_order_fulfillment(integer, text, text, text, text, uuid)
  TO service_role;
