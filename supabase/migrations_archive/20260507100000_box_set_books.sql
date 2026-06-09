CREATE TABLE "BoxSetBooks" (
  id         serial  PRIMARY KEY,
  box_set_id integer NOT NULL REFERENCES "BoxSets"(id) ON DELETE CASCADE,
  title_id   integer NOT NULL REFERENCES "Titles"(id)  ON DELETE CASCADE,
  position   integer NOT NULL DEFAULT 0,
  UNIQUE(box_set_id, title_id)
);

ALTER TABLE "BoxSetBooks" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read box set books"
  ON "BoxSetBooks" FOR SELECT USING (true);

-- Seed: Весь фон Нефф
INSERT INTO "BoxSetBooks" (box_set_id, title_id, position)
SELECT
  (SELECT id FROM "BoxSets" WHERE slug = 'von-neff'),
  ta.title_id,
  (ROW_NUMBER() OVER (ORDER BY t.name) - 1)::integer
FROM "Titles_Authors" ta
JOIN "Authors"  a ON a.id = ta.author_id
JOIN "Titles"   t ON t.id = ta.title_id
WHERE a.name ILIKE '%Нефф%'
ON CONFLICT DO NOTHING;

-- Seed: Весь Иннер
INSERT INTO "BoxSetBooks" (box_set_id, title_id, position)
SELECT
  (SELECT id FROM "BoxSets" WHERE slug = 'inner'),
  ta.title_id,
  (ROW_NUMBER() OVER (ORDER BY t.name) - 1)::integer
FROM "Titles_Authors" ta
JOIN "Authors"  a ON a.id = ta.author_id
JOIN "Titles"   t ON t.id = ta.title_id
WHERE a.name ILIKE '%Иннер%'
ON CONFLICT DO NOTHING;

-- Seed: Весь Старообрядцев
INSERT INTO "BoxSetBooks" (box_set_id, title_id, position)
SELECT
  (SELECT id FROM "BoxSets" WHERE slug = 'staroobryad'),
  ta.title_id,
  (ROW_NUMBER() OVER (ORDER BY t.name) - 1)::integer
FROM "Titles_Authors" ta
JOIN "Authors"  a ON a.id = ta.author_id
JOIN "Titles"   t ON t.id = ta.title_id
WHERE a.name ILIKE '%Старообряд%'
ON CONFLICT DO NOTHING;

-- Seed: Весь Панкратов
INSERT INTO "BoxSetBooks" (box_set_id, title_id, position)
SELECT
  (SELECT id FROM "BoxSets" WHERE slug = 'pankratov'),
  ta.title_id,
  (ROW_NUMBER() OVER (ORDER BY t.name) - 1)::integer
FROM "Titles_Authors" ta
JOIN "Authors"  a ON a.id = ta.author_id
JOIN "Titles"   t ON t.id = ta.title_id
WHERE a.name ILIKE '%Панкрат%'
ON CONFLICT DO NOTHING;

-- Seed: Весь Новокщёнов и сотоварищи
INSERT INTO "BoxSetBooks" (box_set_id, title_id, position)
SELECT
  (SELECT id FROM "BoxSets" WHERE slug = 'novokshchenov'),
  ta.title_id,
  (ROW_NUMBER() OVER (ORDER BY t.name) - 1)::integer
FROM "Titles_Authors" ta
JOIN "Authors"  a ON a.id = ta.author_id
JOIN "Titles"   t ON t.id = ta.title_id
WHERE a.name ILIKE '%Новокщ%' OR a.name ILIKE '%Киреев%' OR a.name ILIKE '%Горшечник%'
ON CONFLICT DO NOTHING;
