-- Retrofit: the «Могучий Русский Динозавр» periodical + its issue №6 (the existing
-- МРД6 title). Each issue is a Title; its stories (Articles) link to it via
-- Articles.title_id; the issue's author list = the distinct authors of its stories.
--
-- Re-runnable. Requires the 20260610120000_periodicals migration.
--   docker exec -i supabase_db_chtivo-next psql -U postgres -d postgres < supabase/seed-periodicals.sql

BEGIN;

INSERT INTO "Periodicals" (name, slug, sort_order)
SELECT 'Могучий Русский Динозавр', 'moguchij-russkij-dinozavr', 0
WHERE NOT EXISTS (SELECT 1 FROM "Periodicals" WHERE slug = 'moguchij-russkij-dinozavr');

-- Shared lede (from chtivo.spb.ru/book-moguchij-russkij-dinozavr.html).
UPDATE "Periodicals" SET
  description = 'В начале было Чтиво. Затем родился Русский Динозавр. Вместе они плечом к плечу стоят на защите современной малой прозы, публикуя для вас исключительные произведения. Перед вами все номера ежегодника: каждый год двенадцать избранных публикаций, двенадцать авторов под одной обложкой — итог двенадцати месяцев работы литжурнала. Выпуски также включают рассказы победителей конкурса рок-прозы «Гроза» радио Овердрайв. Держись, читатель, ибо Русский Динозавр воистину могуч!',
  thesis = 'Ежегодный альманах современной малой прозы от издательства «Чтиво» и арт-конгрегации «Русский Динозавр».'
WHERE slug = 'moguchij-russkij-dinozavr';

-- The periodical owns the shared page slug 'moguchij-russkij-dinozavr'; the issue
-- itself moves to 'mrd-6' (the legacy МРД6 title slug). Idempotent.
UPDATE "Titles" SET slug = 'mrd-6' WHERE slug = 'moguchij-russkij-dinozavr';

-- Issue №6 (2025).
UPDATE "Titles" SET
  periodical_id = (SELECT id FROM "Periodicals" WHERE slug = 'moguchij-russkij-dinozavr'),
  volume_number = 6,
  volume_year = '2025'
WHERE slug = 'mrd-6';

-- Editions per chtivo.spb.ru: МРД6 is digital-only (free «Цифровое издание»).
SELECT setval('"Ebooks_id_seq"', COALESCE((SELECT MAX(id) FROM "Ebooks"), 0) + 1, false);
DELETE FROM "PrintedBooks" WHERE title_id = (SELECT id FROM "Titles" WHERE slug = 'mrd-6');
DELETE FROM "CardBooks" WHERE title_id = (SELECT id FROM "Titles" WHERE slug = 'mrd-6');
DELETE FROM "Ebooks" WHERE title_id = (SELECT id FROM "Titles" WHERE slug = 'mrd-6');
INSERT INTO "Ebooks" (title_id, price, is_published, publish_date, release_date, formats, character_count)
SELECT (SELECT id FROM "Titles" WHERE slug = 'mrd-6'), 0, true, '2026-01-20', '2026-01-20', ARRAY['FB2', 'EPUB'], 280000;

-- Link the issue's stories to it.
UPDATE "Articles" SET title_id = (SELECT id FROM "Titles" WHERE slug = 'mrd-6')
WHERE slug LIKE 'mrd6-%';

-- Issue authors = distinct authors of its stories (skip any already linked).
INSERT INTO "Titles_Authors" (title_id, author_id)
SELECT DISTINCT a.title_id, a.author_id
FROM "Articles" a
WHERE a.slug LIKE 'mrd6-%' AND a.title_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "Titles_Authors" ta WHERE ta.title_id = a.title_id AND ta.author_id = a.author_id
  );

COMMIT;
