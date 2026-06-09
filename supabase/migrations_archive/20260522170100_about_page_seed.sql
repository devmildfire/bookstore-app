-- Seed about-page team + partners.
--
--   • 6 placeholder Workers with is_team_member=true. Names/positions are
--     plausible Russian placeholders so the component renders meaningfully
--     before ops uploads real photos. photo_path stays NULL until photos
--     land in the `workers` bucket — the component renders a placeholder
--     SVG in that case.
--   • The 7 Figma partner rows (Ночлежка, Смена, Порядок Слов, Фаренгейт 451,
--     Ахули, Дискурс, Подписные Издания). logo_path NULL → placeholder square.
--
-- See docs/plans/about-page.md § Seed migration.

-- ─── Team members ───────────────────────────────────────────────────────────
INSERT INTO "Workers" (name, job, is_team_member, city, sort_order, photo_path)
VALUES
  ('Анна Соколова',     'Главный редактор',  true, 'Санкт-Петербург', 0, NULL),
  ('Дмитрий Орлов',     'Арт-директор',       true, 'Санкт-Петербург', 1, NULL),
  ('Мария Лебедева',    'Литературный редактор', true, 'Санкт-Петербург', 2, NULL),
  ('Игорь Беляев',      'Дизайнер',           true, 'Санкт-Петербург', 3, NULL),
  ('Елена Кузнецова',   'Корректор',          true, 'Санкт-Петербург', 4, NULL),
  ('Сергей Морозов',    'Координатор',        true, 'Санкт-Петербург', 5, NULL)
ON CONFLICT DO NOTHING;

-- ─── Partners ───────────────────────────────────────────────────────────────
INSERT INTO "Partners" (name, sort_order, logo_path, website_url)
VALUES
  ('Ночлежка',          0, NULL, NULL),
  ('Смена',             1, NULL, NULL),
  ('Порядок Слов',      2, NULL, NULL),
  ('Фаренгейт 451',     3, NULL, NULL),
  ('Ахули',             4, NULL, NULL),
  ('Дискурс',           5, NULL, NULL),
  ('Подписные Издания', 6, NULL, NULL)
ON CONFLICT (name) DO NOTHING;
