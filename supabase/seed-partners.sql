-- Partner logos + links for the About page "Наши партнёры" strip.
-- Transparent logo assets (no background — the frosted carousel tile shows
-- through) extracted from Figma (node 1306:8039) live in the `partners` storage
-- bucket (bare filename = Partners.logo_path); upload them with
-- scripts/upload-partners-to-supabase.mjs from public/partners/.
--
-- Re-runnable: updates the 7 partner rows seeded by the about-page migration.
--   docker exec -i supabase_db_chtivo-next psql -U postgres -d postgres < supabase/seed-partners.sql

BEGIN;

UPDATE "Partners" SET logo_path = 'nochlezhka.png'    WHERE name = 'Ночлежка';
UPDATE "Partners" SET logo_path = 'smena.png'         WHERE name = 'Смена';
UPDATE "Partners" SET logo_path = 'poryadok-slov.png' WHERE name = 'Порядок Слов';
UPDATE "Partners" SET logo_path = 'farengeyt-451.png' WHERE name = 'Фаренгейт 451';
UPDATE "Partners" SET logo_path = 'ahuli.png'         WHERE name = 'Ахули';
UPDATE "Partners" SET logo_path = 'diskurs.png'       WHERE name = 'Дискурс';
UPDATE "Partners" SET logo_path = 'podpisnye.png'     WHERE name = 'Подписные Издания';

-- Captions under mark-only logos (wordmark logos already carry their name, so
-- they stay NULL). Rendered uppercase beneath the shrunk logo by PartnerLogo.
UPDATE "Partners" SET logo_caption = 'ФАРЕНГЕЙТ 451' WHERE name = 'Фаренгейт 451';
UPDATE "Partners" SET logo_caption = 'АХУЛИ'         WHERE name = 'Ахули';
UPDATE "Partners" SET logo_caption = 'ДИСКУРС'       WHERE name = 'Дискурс';

-- Known official sites (confident only; the rest stay NULL, editable in /admin/partners).
UPDATE "Partners" SET website_url = 'https://nochlezhka.org'   WHERE name = 'Ночлежка';
UPDATE "Partners" SET website_url = 'https://podpisnie.ru'     WHERE name = 'Подписные Издания';
UPDATE "Partners" SET website_url = 'https://www.wordorder.ru' WHERE name = 'Порядок Слов';

COMMIT;
