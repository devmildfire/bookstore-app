-- Promo codes: cart-level and item-level (title-target or product-target).
-- See docs/plans/promo-codes.md for the design.

-- ─── PromoCodes ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "PromoCodes" (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code              TEXT NOT NULL,
  kind              TEXT NOT NULL CHECK (kind IN ('cart', 'item')),
  target_title_id   INTEGER NULL REFERENCES "Titles"(id) ON DELETE CASCADE,
  target_product_id TEXT NULL,
  discount_pct      SMALLINT NOT NULL CHECK (discount_pct BETWEEN 1 AND 100),
  starts_at         TIMESTAMPTZ NOT NULL,
  ends_at           TIMESTAMPTZ NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT promo_kind_targets CHECK (
    (kind = 'cart' AND target_title_id IS NULL AND target_product_id IS NULL)
    OR
    (kind = 'item' AND (
      (target_title_id IS NOT NULL AND target_product_id IS NULL)
      OR
      (target_title_id IS NULL AND target_product_id IS NOT NULL)
    ))
  ),

  CONSTRAINT promo_dates CHECK (starts_at < ends_at)
);

-- Case-insensitive uniqueness — codes are normalized to upper-case on insert
-- by the application layer; the index makes accidental case duplicates impossible.
CREATE UNIQUE INDEX IF NOT EXISTS promo_codes_code_unique
  ON "PromoCodes" (UPPER(code));

CREATE INDEX IF NOT EXISTS promo_codes_active_idx
  ON "PromoCodes" (starts_at, ends_at);

ALTER TABLE "PromoCodes" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS promo_codes_select ON "PromoCodes";
CREATE POLICY promo_codes_select ON "PromoCodes"
  FOR SELECT TO authenticated, anon
  USING (true);

-- No INSERT/UPDATE/DELETE policies — writes go through service_role
-- (admin tooling, not yet implemented).


-- ─── CartPromo ──────────────────────────────────────────────────────────────
-- One row per user — the currently applied promo code. Applying a new code
-- is an UPSERT on user_id; removing is a DELETE.
CREATE TABLE IF NOT EXISTS "CartPromo" (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  promo_id   UUID NOT NULL REFERENCES "PromoCodes"(id) ON DELETE CASCADE,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE "CartPromo" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cart_promo_select ON "CartPromo";
CREATE POLICY cart_promo_select ON "CartPromo"
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS cart_promo_insert ON "CartPromo";
CREATE POLICY cart_promo_insert ON "CartPromo"
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS cart_promo_update ON "CartPromo";
CREATE POLICY cart_promo_update ON "CartPromo"
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS cart_promo_delete ON "CartPromo";
CREATE POLICY cart_promo_delete ON "CartPromo"
  FOR DELETE
  USING (user_id = auth.uid());
