-- Add image_path to GiftCardProducts so each tier can render its own
-- artwork on the storefront. Files live in the public `gift-cards`
-- storage bucket; the column holds the bare filename ('prelest.png',
-- 'blagost.png', 'transcendent.png'), matching the convention used by
-- Titles.cover and Subscriptions.image.

ALTER TABLE "GiftCardProducts"
  ADD COLUMN IF NOT EXISTS image_path text;

UPDATE "GiftCardProducts" SET image_path = 'prelest.png'       WHERE slug = 'prelest';
UPDATE "GiftCardProducts" SET image_path = 'blagost.png'       WHERE slug = 'blagost';
UPDATE "GiftCardProducts" SET image_path = 'transcendent.png'  WHERE slug = 'transcendent';
