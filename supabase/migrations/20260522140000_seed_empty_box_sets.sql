-- Fill four box sets that were left empty when seeded:
--   usa-literature   — American authors (Kerouac, Erich von Neff)
--   womens-power     — women authors
--   russian-death    — dark / death-themed Russian titles
--   far-from-moscow  — regional Russian authors (Воронеж / Екатеринбург /
--                      Саратов / Белгород / Лобня)
--
-- Idempotent: BoxSetBooks has a UNIQUE(box_set_id, title_id) constraint
-- so re-running these INSERTs is a no-op. Mirrors the seed-books.sql
-- pattern (slug-based lookups + ROW_NUMBER for position).

INSERT INTO "BoxSetBooks" (box_set_id, title_id, position)
SELECT
  (SELECT id FROM "BoxSets" WHERE slug = 'usa-literature'),
  t.id,
  ROW_NUMBER() OVER (ORDER BY t.id)
FROM "Titles" t
WHERE t.slug IN (
  'doctor-sax',
  'kolmi-press',
  'podzemnie',
  'v-doroge',
  'prostitutes',
  'frieda-and-gitta'
)
ON CONFLICT (box_set_id, title_id) DO NOTHING;

INSERT INTO "BoxSetBooks" (box_set_id, title_id, position)
SELECT
  (SELECT id FROM "BoxSets" WHERE slug = 'womens-power'),
  t.id,
  ROW_NUMBER() OVER (ORDER BY t.id)
FROM "Titles" t
WHERE t.slug IN (
  'makintosh-dlya-bliznecov',
  'unhappened',
  'leshu-neubitiy-zhivoy',
  'bog-ego-imya',
  'na-zemle-zaratushtry'
)
ON CONFLICT (box_set_id, title_id) DO NOTHING;

INSERT INTO "BoxSetBooks" (box_set_id, title_id, position)
SELECT
  (SELECT id FROM "BoxSets" WHERE slug = 'russian-death'),
  t.id,
  ROW_NUMBER() OVER (ORDER BY t.id)
FROM "Titles" t
WHERE t.slug IN (
  'doch-greha',
  'sin-greha',
  'prizrachnye-istorii',
  'predsetatel-tomskiy',
  'prizraki',
  'kotlovan',
  'rossia',
  'glas-zemli',
  'smerti-net'
)
ON CONFLICT (box_set_id, title_id) DO NOTHING;

INSERT INTO "BoxSetBooks" (box_set_id, title_id, position)
SELECT
  (SELECT id FROM "BoxSets" WHERE slug = 'far-from-moscow'),
  t.id,
  ROW_NUMBER() OVER (ORDER BY t.id)
FROM "Titles" t
WHERE t.slug IN (
  'amystis',              -- Олег Новокщёнов / Воронеж
  'vremyapadenie',        -- Артём Северский / Екатеринбург
  'my-komu-to-nujni',     -- Артём Северский / Екатеринбург
  'irokez',               -- Алексей Колесников / Белгород
  'kubok-voiny-i-tanca',  -- Оганес Мартиросян / Саратов
  'sepiya'                -- Александр Гаврилов / Лобня
)
ON CONFLICT (box_set_id, title_id) DO NOTHING;
