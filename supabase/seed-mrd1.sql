-- МРД №1 (2020) — the first issue of «Могучий Русский Динозавр».
-- Cover + stories parsed from the print PDF (scripts/extract-mrd1-from-pdf.mjs →
-- seed-articles-mrd1.sql, run first; cover → covers/mrd-1.jpg). Early issues are
-- digital-only (free «Цифровое издание») per chtivo.spb.ru.
--
-- Re-runnable. Requires the periodical (seed-periodicals.sql) + seed-articles-mrd1.sql.
--   docker exec -i supabase_db_chtivo-next psql -U postgres -d postgres < supabase/seed-mrd1.sql

BEGIN;

SELECT setval('"Titles_id_seq"', COALESCE((SELECT MAX(id) FROM "Titles"), 0) + 1, false);
SELECT setval('"Ebooks_id_seq"', COALESCE((SELECT MAX(id) FROM "Ebooks"), 0) + 1, false);
SELECT setval('"Titles_Authors_id_seq"', COALESCE((SELECT MAX(id) FROM "Titles_Authors"), 0) + 1, false);

INSERT INTO "Titles" (name, slug, cover, is_compilation, age_restriction, lit_form, first_release, status, periodical_id, volume_number, volume_year)
SELECT 'МРД1', 'mrd-1', 'mrd-1.jpg', true, 18, 'ежегодник', '2020', 'published',
       (SELECT id FROM "Periodicals" WHERE slug = 'moguchij-russkij-dinozavr'), 1, '2020'
WHERE NOT EXISTS (SELECT 1 FROM "Titles" WHERE slug = 'mrd-1');

UPDATE "Titles" SET
  periodical_id = (SELECT id FROM "Periodicals" WHERE slug = 'moguchij-russkij-dinozavr'),
  volume_number = 1, volume_year = '2020', cover = 'mrd-1.jpg'
WHERE slug = 'mrd-1';

-- Digital-only (free «Цифровое издание»).
DELETE FROM "PrintedBooks" WHERE title_id = (SELECT id FROM "Titles" WHERE slug = 'mrd-1');
DELETE FROM "CardBooks" WHERE title_id = (SELECT id FROM "Titles" WHERE slug = 'mrd-1');
DELETE FROM "Ebooks" WHERE title_id = (SELECT id FROM "Titles" WHERE slug = 'mrd-1');
INSERT INTO "Ebooks" (title_id, price, is_published, publish_date, release_date, formats)
SELECT (SELECT id FROM "Titles" WHERE slug = 'mrd-1'), 0, true, '2020-12-30', '2020-12-30', ARRAY['FB2', 'EPUB'];

-- Link the issue's stories + derive its authors.
UPDATE "Articles" SET title_id = (SELECT id FROM "Titles" WHERE slug = 'mrd-1') WHERE slug LIKE 'mrd1-%';

INSERT INTO "Titles_Authors" (title_id, author_id)
SELECT DISTINCT a.title_id, a.author_id FROM "Articles" a
WHERE a.slug LIKE 'mrd1-%' AND a.title_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "Titles_Authors" ta WHERE ta.title_id = a.title_id AND ta.author_id = a.author_id);

COMMIT;
