-- Team members (Workers.is_team_member = true) for the About page "Мы" strip.
-- Real roster + photos extracted from Figma (node 4069:6807). Photos live in the
-- `workers` storage bucket (bare filename = Workers.photo_path); upload them with
-- scripts/upload-workers-to-supabase.mjs from public/workers/.
--
-- Re-runnable: drops the placeholder team rows seeded by the about-page migration,
-- then upserts the real roster. ON CONFLICT (name, job) promotes an existing book-
-- contributor row to a team member instead of creating a duplicate person.
--   docker exec -i supabase_db_chtivo-next psql -U postgres -d postgres < supabase/seed-team.sql

BEGIN;

-- Remove the 6 placeholder team members from the about-page seed (not real people).
DELETE FROM "Workers"
WHERE is_team_member = true
  AND name IN ('Анна Соколова', 'Дмитрий Орлов', 'Мария Лебедева', 'Игорь Беляев', 'Елена Кузнецова', 'Сергей Морозов');

INSERT INTO "Workers" (name, job, city, photo_path, is_team_member, sort_order) VALUES
  ('Андрей Янкус',          'продюсер',              'Санкт-Петербург',  'andrey-yankus.jpg',             true, 0),
  ('Сергей Дедович',        'шеф-редактор',          'Санкт-Петербург',  'sergey-dedovich.jpg',           true, 1),
  ('Алёна Купчинская',      'ведущий редактор',      NULL,               'alyona-kupchinskaya.jpg',       true, 2),
  ('Катерина Видяскина',    'ведущий дизайнер',      'Санкт-Петербург',  'katerina-vidyaskina.jpg',       true, 3),
  ('Екатерина Курносова',   'иллюстратор',           NULL,               'ekaterina-kurnosova.jpg',       true, 4),
  ('Екатерина Ковалевская', 'иллюстратор',           'Нижний Новгород',  'ekaterina-kovalevskaya.jpg',    true, 5),
  ('Анастасия Мальцева',    'режиссёр буктрейлеров', 'Санкт-Петербург',  'anastasia-malceva.jpg',         true, 6),
  ('Вероника Плосконос',    'художник анимации',     NULL,               'veronika-ploskonos.jpg',        true, 7),
  ('Диана Гильманова',      'продюсер изданий',      'Екатеринбург',     'gilmanova-diana.jpg',           true, 8),
  ('Екатерина Гребенщикова','корректор',             NULL,               'ekaterina-grebenshchikova.jpg', true, 9),
  ('Алексей Капустяк',      'верстальщик',           NULL,               'aleksey-kapustyak.jpg',         true, 10)
ON CONFLICT (name, job) DO UPDATE SET
  city = EXCLUDED.city,
  photo_path = EXCLUDED.photo_path,
  is_team_member = true,
  sort_order = EXCLUDED.sort_order;

COMMIT;
