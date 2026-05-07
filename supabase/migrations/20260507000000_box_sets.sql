CREATE TABLE "BoxSets" (
  id          serial PRIMARY KEY,
  slug        text    NOT NULL UNIQUE,
  name        text    NOT NULL,
  description text,
  price       integer NOT NULL CHECK (price >= 0),
  discount    integer,
  image       text,
  position    integer NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  is_published boolean NOT NULL DEFAULT true,
  publish_date text
);

ALTER TABLE "BoxSets" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read box sets"
  ON "BoxSets" FOR SELECT
  USING (is_active = true AND is_published = true);

INSERT INTO "BoxSets" (slug, name, description, price, image, position, publish_date) VALUES
  ('usa-literature',  'Соединённые Штаты Литературы',   'Произведения американских авторов',                                                                              1100, 'usa-literature.svg',  1, '2026-01-01'),
  ('inner',           'Весь Иннер',                     'Все изданные в Чтиве произведения Сергея Иннера (и одно о нём)',                                                   1100, 'inner.svg',           2, '2026-01-01'),
  ('staroobryad',     'Весь Старообрядцев',              'Все изданные в Чтиве произведения Николая Старообрядцева',                                                        1100, 'staroobryad.svg',     3, '2026-01-01'),
  ('von-neff',        'Весь фон Нефф',                  'Все изданные в Чтиве произведения Эриха фон Неффа',                                                               1100, 'von-neff.svg',        4, '2026-01-01'),
  ('womens-power',    'Женская сила',                   'Книги прекрасной части коллектива авторов Чтива',                                                                 1100, 'womens-power.svg',    5, '2026-01-01'),
  ('pankratov',       'Весь Панкратов',                 'Все изданные в Чтиве произведения Георгия Панкратова',                                                            1100, 'pankratov.svg',       6, '2026-01-01'),
  ('novokshchenov',   'Весь Новокщёнов и сотоварищи',  'Все изданные в Чтиве произведения Олега Новокщёнова, Александра Киреева и Дмитрия Горшечникова',                  1100, 'novokshchenov.svg',   7, '2026-01-01'),
  ('russian-death',   'Российская смерть',              'Знакомая действительность и тёмные миры близ необъятной',                                                         1100, 'russian-death.svg',   8, '2026-01-01'),
  ('far-from-moscow', 'Далеко от Москвы',               'Произведения авторов из разных городов России',                                                                   1100, 'far-from-moscow.svg', 9, '2026-01-01');
