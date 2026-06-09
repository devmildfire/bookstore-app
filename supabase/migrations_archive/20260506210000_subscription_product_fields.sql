-- Subscriptions are standalone products, not Titles.
-- Keep them in their own product table and add the shared storefront fields
-- used by other purchasable product tables.

ALTER TABLE "Subscriptions"
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS discount integer,
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS publish_date text;

UPDATE "Subscriptions"
SET
  description = CASE slug
    WHEN 'blizkost' THEN 'Базовый ежемесячный доступ к новым цифровым и аудиоизданиям Чтива.'
    WHEN 'prichastie' THEN 'Расширенная подписка с новинками и ежемесячной классикой Чтива.'
    WHEN 'edinstvo' THEN 'Полная подписка с цифровыми, аудио и печатными изданиями в день релиза.'
    ELSE description
  END,
  publish_date = coalesce(publish_date, '2026-01-01')
WHERE description IS NULL
   OR publish_date IS NULL;

DROP POLICY IF EXISTS "Public read subscriptions" ON "Subscriptions";

CREATE POLICY "Public read subscriptions"
  ON "Subscriptions" FOR SELECT
  USING (is_active = true AND is_published = true);
