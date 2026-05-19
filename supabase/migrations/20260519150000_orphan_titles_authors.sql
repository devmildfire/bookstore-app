-- Backfill authors for the six titles that had no Titles_Authors rows.
--
-- Sources:
--   * Худшее (slug hudshee)             — chtivo.spb.ru/book-hudshee.html  «Авторы»
--   * Худшее-2 (slug hudshee-2)         — chtivo.spb.ru/book-hudshee-2.html «Авторы»
--   * Адвент-календарь (advent-calendar)— chtivo.spb.ru/advent-calendar.html
--   * Я есть Россия (i-est-rossia)      — chtivo.spb.ru/book-i-est-rossia.html
--   * Абзац (abzac-workshop)            — no contributor list on old site → fallback Издательство Чтиво
--   * Локал (local_press)               — no contributor list on old site → fallback Издательство Чтиво
--
-- Co-credits are split into separate Authors rows ("Две буквы при уч. Виктор Зилов" →
-- Две буквы + Виктор Зилов; "Ночная глупость, Руслан Стебунов" → both; same for
-- "Две Буквы и Владислав Данилов"). "Две Буквы" (capital Б) and "Две буквы" (lower
-- б) are kept as distinct rows because chtivo.spb.ru lists them that way.
--
-- Idempotent: every INSERT uses WHERE NOT EXISTS keyed on Authors.name (unique by
-- convention here) and on (title_id, author_id) for the link rows.

-- The Authors / Titles_Authors id sequences are not advanced by the seed file
-- (which inserts explicit ids). Resync them before generating new ids.
SELECT setval('"Authors_id_seq"',         GREATEST((SELECT COALESCE(MAX(id), 0) FROM "Authors"),         1));
SELECT setval('"Titles_Authors_id_seq"',  GREATEST((SELECT COALESCE(MAX(id), 0) FROM "Titles_Authors"),  1));

-- 1. Insert any Authors rows that don't yet exist (lookup by name).
WITH new_authors(name) AS (
  VALUES
    -- Худшее (hudshee)
    ('Grateful Doe'),
    ('#седыестрочки'),
    ('Софья Полякова'),
    ('Игорь Воронцов'),
    ('Юрий Кухтерин'),
    ('Константин Шарук'),
    ('Юлия Филон'),
    ('Андрей Рассказов'),
    ('Виктор Зилов'),
    ('Две Буквы'),
    ('Денис Тихонов'),
    ('Алёна Гутман'),
    ('Миша Токарев'),
    ('улицы забытых гаражей'),
    ('prosto'),
    ('Ангелина Смска'),
    ('Анна Цыбульская'),
    ('Правила переноса'),
    ('Ксения Свистунова'),
    ('Кролик в свете твоих фар'),
    ('Паша Киста'),
    ('Константин Муравьев'),
    ('сибирская язва константин замятин однохуйственно'),
    ('холодное пламя'),
    ('Майка Лунёвская'),
    ('Павел Артемьев'),
    ('аna de karité'),
    ('Человек Обычный'),
    ('Маргарита Скоморох'),
    ('Анна Зелина'),
    ('Little Human'),
    ('Рома Вахменин'),
    ('Анатолий Греча'),
    ('Лиза Гаранина'),
    ('Иван Шалаев'),
    ('Никита Печёнкин'),
    ('Тильтан-Лаван'),
    ('Adirandak'),
    ('Костенька Павлов'),
    ('Ника Русская'),
    ('Ксения Розман'),
    ('ник овлет'),
    ('Евлампия Левинсон'),
    ('Максим Дороднов'),
    ('Толя Сорф'),
    ('Рома Гонза'),
    ('Серафим Образцов'),
    ('Turgut Ay'),
    ('Юрий Тарасов'),
    ('Тимур Газизулин'),
    ('отказался назваться'),
    ('Даша Куликова'),
    ('Диана Никифорова'),
    ('Сеня Каренцева'),
    ('Олег Мельников'),
    -- Худшее-2 (hudshee-2)
    ('Алексей Блитштейн'),
    ('господин К.'),
    ('Евтаназий Агдамович'),
    ('Даня Перевозчиков'),
    ('Лена Лохманова'),
    ('Александр Апосту'),
    ('Сергей Данюшин'),
    ('Две буквы'),
    ('Евлампия Северная'),
    ('Владимир Перепелицын'),
    ('Анна Аликевич'),
    ('Ангелина Смска Антивсё'),
    ('Helga Eisenmann'),
    ('Иоанна Маслова'),
    ('Red Cake'),
    ('L. T.'),
    ('местонеимение'),
    ('Неоклассик'),
    ('Утка пират'),
    ('DELETED'),
    ('Posadki'),
    ('Иван Державин'),
    ('невкусный супчик'),
    ('Александр Беспалов'),
    ('Леха Закаулов'),
    ('Дмитрий Нецвет'),
    ('Антон Коровольников'),
    ('У лица'),
    ('Kirill K'),
    ('Егор Вьюга'),
    ('Евгений Павлов'),
    ('Евгений Крынин'),
    ('Александр Исаков'),
    ('Лемига'),
    ('Евшенко'),
    ('Ксения Левицкая'),
    ('Артём Александрович'),
    ('Алексей Третьяков'),
    ('Василий Семиглазов'),
    ('Алмаз Халиков'),
    ('Арсений Бондаренко'),
    ('Андрей Антонюк'),
    ('Ночная глупость'),
    ('Руслан Стебунов'),
    ('Alixó'),
    ('Никита Ротару'),
    ('Софа Макриди'),
    -- Адвент-календарь
    ('Юлия Микушина'),
    ('Кристина Максимова'),
    ('Артём Артамонов'),
    -- Я есть Россия
    ('Demi Anora'),
    ('goodperson'),
    ('Анна Толкачёва'),
    ('Артемий Замок'),
    ('Бубнов Безымянный'),
    ('Даниил Золотухин'),
    ('Даниэлла Бершанская'),
    ('Владислав Данилов'),
    ('Екатерина Ковалевская'),
    ('Карен Шагназадов'),
    ('Марина Дианова'),
    ('Николай Дубинин'),
    ('Софа')
)
INSERT INTO "Authors" (name)
SELECT n.name FROM new_authors n
WHERE NOT EXISTS (SELECT 1 FROM "Authors" a WHERE a.name = n.name);

-- 2. Link Худшее (title slug = hudshee) to its 57 authors.
INSERT INTO "Titles_Authors" (title_id, author_id)
SELECT t.id, a.id
FROM "Titles" t
JOIN "Authors" a ON a.name IN (
  'Grateful Doe','#седыестрочки','Софья Полякова','Игорь Воронцов','Юрий Кухтерин',
  'Константин Шарук','Юлия Филон','Андрей Рассказов','Виктор Зилов','Две Буквы',
  'Николай Старообрядцев','Андрей Янкус','Денис Тихонов','Алёна Гутман','Миша Токарев',
  'улицы забытых гаражей','prosto','Ангелина Смска','Анна Цыбульская','Правила переноса',
  'Ксения Свистунова','Кролик в свете твоих фар','Паша Киста','Константин Муравьев',
  'сибирская язва константин замятин однохуйственно','холодное пламя','Майка Лунёвская',
  'Павел Артемьев','аna de karité','Человек Обычный','Маргарита Скоморох','Анна Зелина',
  'Little Human','Рома Вахменин','Анатолий Греча','Лиза Гаранина','Иван Шалаев',
  'Никита Печёнкин','Тильтан-Лаван','Adirandak','Костенька Павлов','Ника Русская',
  'Ксения Розман','ник овлет','Евлампия Левинсон','Максим Дороднов','Толя Сорф',
  'Рома Гонза','Серафим Образцов','Turgut Ay','Юрий Тарасов','Тимур Газизулин',
  'отказался назваться','Даша Куликова','Диана Никифорова','Сеня Каренцева','Олег Мельников'
)
WHERE t.slug = 'hudshee'
  AND NOT EXISTS (
    SELECT 1 FROM "Titles_Authors" ta
    WHERE ta.title_id = t.id AND ta.author_id = a.id
  );

-- 3. Link Худшее-2 (slug = hudshee-2) to its 53 authors (co-credits split).
INSERT INTO "Titles_Authors" (title_id, author_id)
SELECT t.id, a.id
FROM "Titles" t
JOIN "Authors" a ON a.name IN (
  'Алексей Блитштейн','господин К.','Евтаназий Агдамович','Даня Перевозчиков',
  'Лена Лохманова','Александр Апосту','Сергей Данюшин','Константин Шарук',
  'Две буквы','Виктор Зилов','Евлампия Северная','Владимир Перепелицын','Анна Аликевич',
  'Ангелина Смска Антивсё','Helga Eisenmann','Иоанна Маслова','улицы забытых гаражей',
  'Red Cake','L. T.','Серафим Образцов','местонеимение','Олег Мельников','Неоклассик',
  'Утка пират','DELETED','Posadki','Иван Державин','невкусный супчик','Александр Беспалов',
  'Леха Закаулов','Дмитрий Нецвет','Игорь Воронцов','Антон Коровольников','У лица',
  'Kirill K','Егор Вьюга','Евгений Павлов','Евгений Крынин','аna de karité',
  'Александр Исаков','Лемига','Евшенко','Ксения Левицкая','Артём Александрович',
  'Алексей Третьяков','Василий Семиглазов','Алмаз Халиков','Арсений Бондаренко',
  'Андрей Антонюк','Ночная глупость','Руслан Стебунов','Alixó','Никита Ротару','Софа Макриди'
)
WHERE t.slug = 'hudshee-2'
  AND NOT EXISTS (
    SELECT 1 FROM "Titles_Authors" ta
    WHERE ta.title_id = t.id AND ta.author_id = a.id
  );

-- 4. Link Адвент-календарь Чтива (slug = advent-calendar) to its 10 authors.
INSERT INTO "Titles_Authors" (title_id, author_id)
SELECT t.id, a.id
FROM "Titles" t
JOIN "Authors" a ON a.name IN (
  'Юлия Микушина','Кристина Максимова','Артём Артамонов','Николай Старообрядцев',
  'Сергей Дедович','Андрей Янкус','Сергей Иннер','Олег Новокщёнов','Александр Киреев',
  'Дмитрий Горшечников'
)
WHERE t.slug = 'advent-calendar'
  AND NOT EXISTS (
    SELECT 1 FROM "Titles_Authors" ta
    WHERE ta.title_id = t.id AND ta.author_id = a.id
  );

-- 5. Link Я есть Россия (slug = i-est-rossia) to its 13 authors (co-credit split).
INSERT INTO "Titles_Authors" (title_id, author_id)
SELECT t.id, a.id
FROM "Titles" t
JOIN "Authors" a ON a.name IN (
  'Demi Anora','goodperson','Анна Толкачёва','Артемий Замок','Бубнов Безымянный',
  'Даниил Золотухин','Даниэлла Бершанская','Две Буквы','Владислав Данилов',
  'Екатерина Ковалевская','Карен Шагназадов','Марина Дианова','Николай Дубинин','Софа'
)
WHERE t.slug = 'i-est-rossia'
  AND NOT EXISTS (
    SELECT 1 FROM "Titles_Authors" ta
    WHERE ta.title_id = t.id AND ta.author_id = a.id
  );

-- 6. Абзац (slug = abzac-workshop) and Локал (slug = local_press): no contributor
--    list on chtivo.spb.ru, fall back to Издательство Чтиво (existing Authors row).
INSERT INTO "Titles_Authors" (title_id, author_id)
SELECT t.id, a.id
FROM "Titles" t
JOIN "Authors" a ON a.name = 'Издательство Чтиво'
WHERE t.slug IN ('abzac-workshop', 'local_press')
  AND NOT EXISTS (
    SELECT 1 FROM "Titles_Authors" ta
    WHERE ta.title_id = t.id AND ta.author_id = a.id
  );
