-- Idempotent seed for testing the promo-codes feature.
-- Codes target the "Белый цветок" title (id 58) — its ebook (id 50) and
-- audiobook (id 4) — plus a cart-wide code and an expired code for
-- negative-path testing.
--
-- Re-running this script just upserts the same rows.

INSERT INTO "PromoCodes" (code, kind, target_title_id, target_product_id, discount_pct, starts_at, ends_at)
VALUES
  -- Cart-level: 20% off the entire cart, active for one year
  ('SUMMER25', 'cart', NULL, NULL, 20, now() - interval '1 day', now() + interval '365 days'),

  -- Cart-level: 100% off (free) — for giveaway testing
  ('FREECART',  'cart', NULL, NULL, 100, now() - interval '1 day', now() + interval '30 days'),

  -- Item-level (title-target): 30% off all editions of "Белый цветок"
  ('WHITE30',   'item', 58, NULL, 30, now() - interval '1 day', now() + interval '365 days'),

  -- Item-level (product-target): 50% off only the audiobook of "Белый цветок"
  ('AUDIO50',   'item', NULL, 'AudioBook-4', 50, now() - interval '1 day', now() + interval '365 days'),

  -- Expired (negative-path test)
  ('OLDCODE',   'cart', NULL, NULL, 50, now() - interval '60 days', now() - interval '1 day')

ON CONFLICT DO NOTHING;
