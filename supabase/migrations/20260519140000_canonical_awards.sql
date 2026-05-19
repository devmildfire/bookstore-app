-- Replace the auto-generated placeholder awards with the canonical, specially-
-- designed award badges (laurel-pattern SVGs) under public/awards/.
--
-- Drops all prior award assignments and the old award rows so only the curated
-- set remains. `book-of-the-year-{YEAR}` is auto-assigned by `first_release`
-- year; the four real-world longlist/bronze awards are left unassigned for
-- editor curation.

DELETE FROM "Titles_Awards";
DELETE FROM "Awards";

INSERT INTO "Awards" (slug, title, image, position) VALUES
  ('book-of-the-year-2019',     'Книга года 2019',                       '/awards/book_of_the_year_2019.svg',          1),
  ('book-of-the-year-2020',     'Книга года 2020',                       '/awards/book_of_the_year_2020.svg',          2),
  ('book-of-the-year-2021',     'Книга года 2021',                       '/awards/book_of_the_year_2021.svg',          3),
  ('book-of-the-year-2022',     'Книга года 2022',                       '/awards/book_of_the_year_2022.svg',          4),
  ('book-of-the-year-2023',     'Книга года 2023',                       '/awards/book_of_the_year_2023.svg',          5),
  ('book-of-the-year-2024',     'Книга года 2024',                       '/awards/book_of_the_year_2024.svg',          6),
  ('book-of-the-year-2025',     'Книга года 2025',                       '/awards/book_of_the_year_2025.svg',          7),
  ('book-of-the-year-2026',     'Книга года 2026',                       '/awards/book_of_the_year_2026.svg',          8),
  ('longlist-big-book-2020',    'Большая книга 2020 — длинный список',   '/awards/award_longlist_big_book_2020.svg',   9),
  ('longlist-fiction-35-2020',  'Fiction-35 2020 — длинный список',      '/awards/award_longlist_fiction-35_2020.svg', 10),
  ('longlist-liceum-2022',      'Лицей 2022 — длинный список',           '/awards/award_longlist_liceum_2022.svg',     11),
  ('bronze-liceum-2022',        'Лицей 2022 — бронза',                   '/awards/award_bronze_liceum_2022.svg',       12);

-- Auto-assign book_of_the_year_{YEAR} to titles whose first_release year matches.
INSERT INTO "Titles_Awards" (title_id, award_id, position)
SELECT t.id, a.id, 1
FROM "Titles" t
JOIN "Awards" a
  ON a.slug = 'book-of-the-year-' || left(t.first_release, 4)
WHERE t.first_release IS NOT NULL;
