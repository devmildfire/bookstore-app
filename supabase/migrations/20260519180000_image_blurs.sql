-- Image blur placeholders.
--
-- Adds tiny base64 LQIP (low-quality image placeholder) data URLs alongside
-- every Storage-backed image that the app renders via `next/image`.
--
-- The blur values are precomputed by upload / sync scripts using `sharp`
-- (resize 10x15, JPEG q40, base64). Each cell holds ~700–1500 bytes of text.
-- Empty / NULL is valid; consumers fall back to `placeholder="empty"` then.
--
-- - Titles.cover_blur          → matches Titles.cover (bucket: covers)
-- - Titles.book_photos_blurs   → map filename → blur for `book-photos/{slug}/*`
-- - Authors.photo_blur         → matches Authors.photo (bucket: authors)
-- - Subscriptions.image_blur   → matches Subscriptions.image (bucket: subscriptions)

alter table "Titles"        add column cover_blur        text  null;
alter table "Titles"        add column book_photos_blurs jsonb null;
alter table "Authors"       add column photo_blur        text  null;
alter table "Subscriptions" add column image_blur        text  null;
