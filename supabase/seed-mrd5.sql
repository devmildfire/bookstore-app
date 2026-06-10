-- МРД №5 (2024) — a second issue of the «Могучий Русский Динозавр» periodical.
-- Cover (Обложка.jpg → covers/mrd-5.jpg) and stories (seed-articles-mrd5.sql,
-- run first) come from the supplied EPUB. Editions mirror МРД6: a print book and
-- a Book2.0, both 600 ₽, one release cycle earlier.
--
-- Re-runnable. Requires the periodical (seed-periodicals.sql) + seed-articles-mrd5.sql.
--   docker exec -i supabase_db_chtivo-next psql -U postgres -d postgres < supabase/seed-mrd5.sql

BEGIN;

-- The catalog tables were loaded with explicit ids, so realign their sequences.
SELECT setval('"Titles_id_seq"', COALESCE((SELECT MAX(id) FROM "Titles"), 0) + 1, false);
SELECT setval('"PrintedBooks_id_seq"', COALESCE((SELECT MAX(id) FROM "PrintedBooks"), 0) + 1, false);
SELECT setval('"CardBooks_id_seq"', COALESCE((SELECT MAX(id) FROM "CardBooks"), 0) + 1, false);
SELECT setval('"Titles_Authors_id_seq"', COALESCE((SELECT MAX(id) FROM "Titles_Authors"), 0) + 1, false);

INSERT INTO "Titles" (name, slug, cover, is_compilation, age_restriction, lit_form, first_release, status, periodical_id, volume_number, volume_year)
SELECT 'МРД5', 'mrd-5', 'mrd-5.jpg', true, 18, 'ежегодник', '2024', 'published',
       (SELECT id FROM "Periodicals" WHERE slug = 'moguchij-russkij-dinozavr'), 5, '2024'
WHERE NOT EXISTS (SELECT 1 FROM "Titles" WHERE slug = 'mrd-5');

UPDATE "Titles" SET
  periodical_id = (SELECT id FROM "Periodicals" WHERE slug = 'moguchij-russkij-dinozavr'),
  volume_number = 5, volume_year = '2024', cover = 'mrd-5.jpg'
WHERE slug = 'mrd-5';

-- Editions mirror МРД6 (print + Book2.0, 600 ₽), dated one cycle earlier.
INSERT INTO "PrintedBooks" (title_id, price, is_published, publish_date, release_date)
SELECT (SELECT id FROM "Titles" WHERE slug = 'mrd-5'), 600, true, '2025-01-01', '2024-10-15'
WHERE NOT EXISTS (SELECT 1 FROM "PrintedBooks" WHERE title_id = (SELECT id FROM "Titles" WHERE slug = 'mrd-5'));

INSERT INTO "CardBooks" (title_id, price, is_published, publish_date, release_date)
SELECT (SELECT id FROM "Titles" WHERE slug = 'mrd-5'), 600, true, '2025-01-01', '2024-10-15'
WHERE NOT EXISTS (SELECT 1 FROM "CardBooks" WHERE title_id = (SELECT id FROM "Titles" WHERE slug = 'mrd-5'));

-- Link the issue's stories + derive its authors.
UPDATE "Articles" SET title_id = (SELECT id FROM "Titles" WHERE slug = 'mrd-5') WHERE slug LIKE 'mrd5-%';

INSERT INTO "Titles_Authors" (title_id, author_id)
SELECT DISTINCT a.title_id, a.author_id FROM "Articles" a
WHERE a.slug LIKE 'mrd5-%' AND a.title_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "Titles_Authors" ta WHERE ta.title_id = a.title_id AND ta.author_id = a.author_id);

COMMIT;
