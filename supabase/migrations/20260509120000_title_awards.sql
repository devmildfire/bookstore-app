-- Title awards.
-- Awards are reusable badges with images; Titles_Awards attaches one or more
-- awarded prizes to each title.

CREATE TABLE IF NOT EXISTS "Awards" (
  id        serial PRIMARY KEY,
  slug      text    NOT NULL UNIQUE,
  title     text    NOT NULL,
  image     text,
  position  integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "Titles_Awards" (
  id       serial PRIMARY KEY,
  title_id integer NOT NULL REFERENCES "Titles"(id) ON DELETE CASCADE,
  award_id integer NOT NULL REFERENCES "Awards"(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  UNIQUE (title_id, award_id)
);

ALTER TABLE "Awards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Titles_Awards" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read awards" ON "Awards";
CREATE POLICY "Public read awards"
  ON "Awards" FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Public read title awards" ON "Titles_Awards";
CREATE POLICY "Public read title awards"
  ON "Titles_Awards" FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM "Awards" a
      WHERE a.id = award_id
        AND a.is_active = true
    )
  );

INSERT INTO "Awards" (slug, title, image, position) VALUES
  ('book-of-year-2019', 'Книга года 2019', '/awards/book-of-year-2019.svg', 1),
  ('editor-choice', 'Выбор редакции Чтива', '/awards/editor-choice.svg', 2),
  ('reader-choice', 'Голос читателей', '/awards/reader-choice.svg', 3),
  ('debut-shortlist', 'Дебютный список', '/awards/debut-shortlist.svg', 4),
  ('best-prose', 'Лучшая проза', '/awards/best-prose.svg', 5),
  ('formal-experiment', 'Формальный эксперимент', '/awards/formal-experiment.svg', 6),
  ('literary-game', 'Литературная игра', '/awards/literary-game.svg', 7)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  image = EXCLUDED.image,
  position = EXCLUDED.position,
  is_active = true;

INSERT INTO "Titles_Awards" (title_id, award_id, position)
SELECT t.id, a.id, awarded.position
FROM (
  SELECT slug, 'literary-game' AS award_slug, 1 AS position
  FROM "Titles"
  WHERE slug IN ('segamegadrive', 'igra-v-mayaki')

  UNION ALL

  SELECT slug, 'book-of-year-2019', 1
  FROM "Titles"
  WHERE left(first_release, 4) = '2019'

  UNION ALL

  SELECT slug, 'editor-choice', 2
  FROM "Titles"
  WHERE id % 3 = 0

  UNION ALL

  SELECT slug, 'reader-choice', 3
  FROM "Titles"
  WHERE id % 4 = 0

  UNION ALL

  SELECT slug, 'debut-shortlist', 4
  FROM "Titles"
  WHERE id % 5 = 0

  UNION ALL

  SELECT slug, 'best-prose', 5
  FROM "Titles"
  WHERE id % 6 = 0

  UNION ALL

  SELECT slug, 'formal-experiment', 6
  FROM "Titles"
  WHERE id % 7 = 0
) awarded
JOIN "Titles" t ON t.slug = awarded.slug
JOIN "Awards" a ON a.slug = awarded.award_slug
ON CONFLICT (title_id, award_id) DO UPDATE SET
  position = EXCLUDED.position;

DROP FUNCTION IF EXISTS get_catalog_book_by_slug(text);

CREATE OR REPLACE FUNCTION get_catalog_book_by_slug(title_slug text)
RETURNS TABLE (
  id                    integer,
  price                 numeric,
  discount              integer,
  sold_out              boolean,
  is_published          boolean,
  publish_date          text,
  release_date          text,
  title_id              integer,
  product_type          text,
  title_name            text,
  title_slug            text,
  title_cover           text,
  title_description     text,
  title_thesis          text,
  title_lit_form        text,
  title_age_restriction integer,
  title_first_release   text,
  author_names          text[],
  title_awards          jsonb
)
LANGUAGE sql
STABLE
AS $$
  WITH all_products AS (
    SELECT id, price, discount, coalesce(sold_out, false) AS sold_out,
           coalesce(is_published, false) AS is_published,
           publish_date, release_date, title_id, 'Book2.0'::text AS product_type, 2 AS type_rank
    FROM "CardBooks"
    UNION ALL
    SELECT id, price, discount, false, coalesce(is_published, false),
           publish_date, release_date, title_id, 'EBook'::text, 1
    FROM "Ebooks"
    UNION ALL
    SELECT id, price, discount, false, coalesce(is_published, false),
           publish_date, release_date, title_id, 'AudioBook'::text, 3
    FROM "Audiobooks"
    UNION ALL
    SELECT id, price, discount, coalesce(sold_out, false), coalesce(is_published, false),
           publish_date, release_date, title_id, 'PrintBook'::text, 4
    FROM "PrintedBooks"
  )
  SELECT
    p.id,
    p.price,
    p.discount,
    p.sold_out,
    p.is_published,
    p.publish_date,
    p.release_date,
    p.title_id,
    p.product_type,
    t.name            AS title_name,
    t.slug            AS title_slug,
    t.cover           AS title_cover,
    t.description     AS title_description,
    t.thesis          AS title_thesis,
    t.lit_form        AS title_lit_form,
    t.age_restriction AS title_age_restriction,
    t.first_release   AS title_first_release,
    (
      SELECT coalesce(array_agg(a.name ORDER BY a.name), '{}')
      FROM "Titles_Authors" ta
      JOIN "Authors" a ON a.id = ta.author_id
      WHERE ta.title_id = t.id
    ) AS author_names,
    (
      SELECT coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', a.id,
            'title', a.title,
            'image', a.image
          )
          ORDER BY ta.position ASC, a.position ASC, a.title ASC
        ),
        '[]'::jsonb
      )
      FROM "Titles_Awards" ta
      JOIN "Awards" a ON a.id = ta.award_id
      WHERE ta.title_id = t.id
        AND a.is_active = true
    ) AS title_awards
  FROM all_products p
  INNER JOIN "Titles" t ON t.id = p.title_id
  WHERE t.slug = title_slug
    AND p.is_published = true
  ORDER BY p.type_rank ASC;
$$;
