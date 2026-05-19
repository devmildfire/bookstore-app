-- Populate Authors profile data + AuthorContacts scraped from chtivo.spb.ru.
--
-- Each book detail page on the old site embeds a single "Об авторе" block;
-- the scrape (scripts/scrape-author-profiles.mjs → scraped-author-profiles.json)
-- aggregates all of them by author name. This migration applies the result.
--
-- Idempotent: each field is filled only when the existing value is NULL or
-- empty (COALESCE on NULLIF), and contact inserts use ON CONFLICT DO NOTHING.
-- That means already-curated rows (e.g. Authors.id = 29 from seed-books.sql)
-- are left alone.
--
-- The 'website' value is added to author_contact_channel in the previous
-- migration (it must be committed before being used here).
--
-- Photo column stores the source filename from chtivo.spb.ru assets/img/;
-- the actual JPGs need to be uploaded separately to the public "authors"
-- Supabase Storage bucket. Files to upload are listed at the bottom of this
-- file as a reference comment.

-- Александр Гаврилов
UPDATE "Authors" SET
  bio        = COALESCE(NULLIF(bio, ''),        'Родился в Тверской области. Детство и юность провёл в Ленинграде. Учился в ЛХУ им. В. А. Серова. Служил в ВМФ. В начале девяностых годов переехал на Южный Урал. Зарабатывал живописью. Имеет публикации в журналах «Литературная учёба», «Нижний Новгород», «Изящная словесность», «Зарубежные задворки», «Метаморфозы», Edita. В настоящее время живёт в Лобне, занимается литературным трудом.'),
  city       = COALESCE(NULLIF(city, ''),       'г. Лобня'),
  birth_date = COALESCE(NULLIF(birth_date, ''), '1958-09-07'),
  death_date = COALESCE(NULLIF(death_date, ''), NULL),
  phrase     = COALESCE(NULLIF(phrase, ''),     'Я вовремя понял, что постигать смысл жизни — пустое занятие: это не удастся никому.'),
  photo      = COALESCE(NULLIF(photo, ''),      'author_gavrilov.jpg')
WHERE name = 'Александр Гаврилов';

INSERT INTO "AuthorContacts" (author_id, channel, url, sort_order)
SELECT a.id, v.channel::author_contact_channel, v.url, v.sort_order
FROM "Authors" a, (VALUES
  ('email', 'mailto:alecsandr0709@mail.ru', 0)
) AS v(channel, url, sort_order)
WHERE a.name = 'Александр Гаврилов'
ON CONFLICT (author_id, channel) DO NOTHING;

-- Алексей Колесников
UPDATE "Authors" SET
  bio        = COALESCE(NULLIF(bio, ''),        'Окончил юридический факультет НИУ БелГУ, сейчас работает юристом. Рассказы выходили в журналах «Дружба народов», «Нева», «Вопросы литературы», «Дон», «Волга», «Новый берег» и альманахе «Кто я?».'),
  city       = COALESCE(NULLIF(city, ''),       'Белгород'),
  birth_date = COALESCE(NULLIF(birth_date, ''), '1993-12-01'),
  death_date = COALESCE(NULLIF(death_date, ''), NULL),
  phrase     = COALESCE(NULLIF(phrase, ''),     'Настоящая удача случается раза два за всю страницу. Всё дело в словах — тяжело подобрать подходящие.'),
  photo      = COALESCE(NULLIF(photo, ''),      'author_kolesnikov.jpg')
WHERE name = 'Алексей Колесников';

INSERT INTO "AuthorContacts" (author_id, channel, url, sort_order)
SELECT a.id, v.channel::author_contact_channel, v.url, v.sort_order
FROM "Authors" a, (VALUES
  ('website', 'https://vk.com/id45567246', 0)
) AS v(channel, url, sort_order)
WHERE a.name = 'Алексей Колесников'
ON CONFLICT (author_id, channel) DO NOTHING;

-- Андрей Янкус
UPDATE "Authors" SET
  bio        = COALESCE(NULLIF(bio, ''),        NULL),
  city       = COALESCE(NULLIF(city, ''),       'п. Давша'),
  birth_date = COALESCE(NULLIF(birth_date, ''), '1991-09-01'),
  death_date = COALESCE(NULLIF(death_date, ''), NULL),
  phrase     = COALESCE(NULLIF(phrase, ''),     'У человека четыре конечности — и одна бесконечность.'),
  photo      = COALESCE(NULLIF(photo, ''),      'author_yankus.jpg')
WHERE name = 'Андрей Янкус';

INSERT INTO "AuthorContacts" (author_id, channel, url, sort_order)
SELECT a.id, v.channel::author_contact_channel, v.url, v.sort_order
FROM "Authors" a, (VALUES
  ('telegram', 'https://t.me/jankus_txt', 0),
  ('website', 'https://vk.com/jahnkus', 1),
  ('email', 'mailto:oraoliveyra@gmail.com', 2)
) AS v(channel, url, sort_order)
WHERE a.name = 'Андрей Янкус'
ON CONFLICT (author_id, channel) DO NOTHING;

-- Анна Пашкова
UPDATE "Authors" SET
  bio        = COALESCE(NULLIF(bio, ''),        'Выпускница филологического факультета МПГУ, журналист. С детства носит очки с толстыми стеклами.

Любит семейные саги, еврейскую культуру, коллекционирует старинные фотографии, потому что считает, что

истории не должны умирать.'),
  city       = COALESCE(NULLIF(city, ''),       'Москва'),
  birth_date = COALESCE(NULLIF(birth_date, ''), '1988-09-29'),
  death_date = COALESCE(NULLIF(death_date, ''), NULL),
  phrase     = COALESCE(NULLIF(phrase, ''),     'Нам нужны истории. Нам необходимо знать, что случившееся с нами уже происходило с кем-то ещё. История обнимает человека за плечи: ты больше никогда не будешь одинок. Всё уже случалось когда-то и повторится снова.'),
  photo      = COALESCE(NULLIF(photo, ''),      'author_annPashkova.jpg')
WHERE name = 'Анна Пашкова';

INSERT INTO "AuthorContacts" (author_id, channel, url, sort_order)
SELECT a.id, v.channel::author_contact_channel, v.url, v.sort_order
FROM "Authors" a, (VALUES
  ('facebook', 'https://www.facebook.com/utkina.an', 0),
  ('email', 'mailto:utkina.an@gmail.com', 1)
) AS v(channel, url, sort_order)
WHERE a.name = 'Анна Пашкова'
ON CONFLICT (author_id, channel) DO NOTHING;

-- Артём Северский
UPDATE "Authors" SET
  bio        = COALESCE(NULLIF(bio, ''),        'Прозаик, драматург, выпускник ЕГТИ (курс Николая Коляды). Имеет публикации в журнале «Урал»,

коллективных сборниках пьес и сборниках рассказов издательства «Перископ». Чтит классику

двух предыдущих веков. Уважает реализм и модернизм, стремясь найти в своём творчестве

равновесие между ними.'),
  city       = COALESCE(NULLIF(city, ''),       'Екатеринбург'),
  birth_date = COALESCE(NULLIF(birth_date, ''), NULL),
  death_date = COALESCE(NULLIF(death_date, ''), NULL),
  phrase     = COALESCE(NULLIF(phrase, ''),     'Писать — вести бесконечную самотерапию'),
  photo      = COALESCE(NULLIF(photo, ''),      'author_severskyi.jpg')
WHERE name = 'Артём Северский';

INSERT INTO "AuthorContacts" (author_id, channel, url, sort_order)
SELECT a.id, v.channel::author_contact_channel, v.url, v.sort_order
FROM "Authors" a, (VALUES
  ('email', 'mailto:artem.severskiy.77@mail.ru', 0),
  ('website', 'https://vk.com/seversky_artem', 1)
) AS v(channel, url, sort_order)
WHERE a.name = 'Артём Северский'
ON CONFLICT (author_id, channel) DO NOTHING;

-- Борис Майнаев
UPDATE "Authors" SET
  bio        = COALESCE(NULLIF(bio, ''),        NULL),
  city       = COALESCE(NULLIF(city, ''),       'г. Саарбрюккен'),
  birth_date = COALESCE(NULLIF(birth_date, ''), '1947-07-21'),
  death_date = COALESCE(NULLIF(death_date, ''), NULL),
  phrase     = COALESCE(NULLIF(phrase, ''),     'Жизнь имеет смысл только тогда, когда ты занят тем, что тебе интересно'),
  photo      = COALESCE(NULLIF(photo, ''),      'author_boris.jpg')
WHERE name = 'Борис Майнаев';

INSERT INTO "AuthorContacts" (author_id, channel, url, sort_order)
SELECT a.id, v.channel::author_contact_channel, v.url, v.sort_order
FROM "Authors" a, (VALUES
  ('instagram', 'https://www.instagram.com/borismainaev?igsh=MXQ5dGJmYWc4YzIyaA==', 0)
) AS v(channel, url, sort_order)
WHERE a.name = 'Борис Майнаев'
ON CONFLICT (author_id, channel) DO NOTHING;

-- Василий Вялый
UPDATE "Authors" SET
  bio        = COALESCE(NULLIF(bio, ''),        'Окончил Кубанский государственный университет, факультет художественной графики. Автор шести книг. Любит искусство и женщин. Печатался в газете «Литературная Россия», альманахах «Кубань», «Родная Кубань», «Глагол Кавказа», журналах «Новая литература», «День и ночь», «Русский глобус», «Топос», журнале Московской Патриархии «Свиток» и других. С 2003 года член Союза российских писателей. Серебряный лауреат Международного литературного конкурса «Золотое перо Руси 2010».'),
  city       = COALESCE(NULLIF(city, ''),       'Краснодар'),
  birth_date = COALESCE(NULLIF(birth_date, ''), '1953-02-07'),
  death_date = COALESCE(NULLIF(death_date, ''), NULL),
  phrase     = COALESCE(NULLIF(phrase, ''),     'Человек высших помыслов отличается от человека низших помыслов тем, что предъявляет требования к себе, а не к другим.'),
  photo      = COALESCE(NULLIF(photo, ''),      'author_vasVyaluj.jpg')
WHERE name = 'Василий Вялый';

INSERT INTO "AuthorContacts" (author_id, channel, url, sort_order)
SELECT a.id, v.channel::author_contact_channel, v.url, v.sort_order
FROM "Authors" a, (VALUES
  ('email', 'mailto:vialiy@mail.ru', 0)
) AS v(channel, url, sort_order)
WHERE a.name = 'Василий Вялый'
ON CONFLICT (author_id, channel) DO NOTHING;

-- Георгий Панкратов
UPDATE "Authors" SET
  bio        = COALESCE(NULLIF(bio, ''),        NULL),
  city       = COALESCE(NULLIF(city, ''),       'Санкт-Петербург'),
  birth_date = COALESCE(NULLIF(birth_date, ''), NULL),
  death_date = COALESCE(NULLIF(death_date, ''), NULL),
  phrase     = COALESCE(NULLIF(phrase, ''),     'Это вообще наше, русское счастье такое: только достигнув пределов отчаяния, человек может стать счастливым. Счастье — это очищение и ничто другое: когда свет белый был не мил, так что выть, лезть на стену хотелось, когда было больно, нестерпимо больно, и вот наконец отпустило'),
  photo      = COALESCE(NULLIF(photo, ''),      'author_ponkratov.jpg')
WHERE name = 'Георгий Панкратов';

INSERT INTO "AuthorContacts" (author_id, channel, url, sort_order)
SELECT a.id, v.channel::author_contact_channel, v.url, v.sort_order
FROM "Authors" a, (VALUES
  ('telegram', 'https://t.me/pankratov_live', 0),
  ('website', 'https://vk.com/pankratov_live', 1),
  ('email', 'mailto:pankratov_g@bk.ru', 2)
) AS v(channel, url, sort_order)
WHERE a.name = 'Георгий Панкратов'
ON CONFLICT (author_id, channel) DO NOTHING;

-- Даша Стрельцова
UPDATE "Authors" SET
  bio        = COALESCE(NULLIF(bio, ''),        'В детстве хотела стать астрономом, носить синий колпак с жёлтыми звездами и жить в обсерватории. Затем передумала и стала писать.

Училась во ВГИКе на сценарном, была отличницей, но сценаристом не стала. Работает редактором, продюсером, помощником начинающих писателей и сама иногда пишет рассказы.'),
  city       = COALESCE(NULLIF(city, ''),       'Москва'),
  birth_date = COALESCE(NULLIF(birth_date, ''), '1992-07-30'),
  death_date = COALESCE(NULLIF(death_date, ''), NULL),
  phrase     = COALESCE(NULLIF(phrase, ''),     'Проза и всё ей подобное происходит от сильного чувства, тщательно скрываемого внутри'),
  photo      = COALESCE(NULLIF(photo, ''),      'author_strelcova.jpg')
WHERE name = 'Даша Стрельцова';

INSERT INTO "AuthorContacts" (author_id, channel, url, sort_order)
SELECT a.id, v.channel::author_contact_channel, v.url, v.sort_order
FROM "Authors" a, (VALUES
  ('facebook', 'https://www.facebook.com/dasha.streltsova.3', 0),
  ('website', 'https://deriendutout.livejournal.com/', 1),
  ('instagram', 'https://www.instagram.com/deriendutout/', 2)
) AS v(channel, url, sort_order)
WHERE a.name = 'Даша Стрельцова'
ON CONFLICT (author_id, channel) DO NOTHING;

-- Джек Керуак
UPDATE "Authors" SET
  bio        = COALESCE(NULLIF(bio, ''),        'Американский писатель, поэт, важнейший представитель литературы «бит-поколения». Пользовавшийся

читательским успехом, но не избалованный вниманием критиков при жизни, Керуак сегодня считается одним

из самых значительных американских писателей.'),
  city       = COALESCE(NULLIF(city, ''),       'г. Лоуэлл'),
  birth_date = COALESCE(NULLIF(birth_date, ''), '1922-03-12'),
  death_date = COALESCE(NULLIF(death_date, ''), '1969-10-21'),
  phrase     = COALESCE(NULLIF(phrase, ''),     'В этом мире жить невозможно, но больше негде.'),
  photo      = COALESCE(NULLIF(photo, ''),      'author_keruak.jpg')
WHERE name = 'Джек Керуак';

INSERT INTO "AuthorContacts" (author_id, channel, url, sort_order)
SELECT a.id, v.channel::author_contact_channel, v.url, v.sort_order
FROM "Authors" a, (VALUES
  ('email', 'mailto:eisensarg@mail.ru', 0)
) AS v(channel, url, sort_order)
WHERE a.name = 'Джек Керуак'
ON CONFLICT (author_id, channel) DO NOTHING;

-- Евгений Орлов
UPDATE "Authors" SET
  bio        = COALESCE(NULLIF(bio, ''),        NULL),
  city       = COALESCE(NULLIF(city, ''),       'Владивосток'),
  birth_date = COALESCE(NULLIF(birth_date, ''), '1970-09-17'),
  death_date = COALESCE(NULLIF(death_date, ''), NULL),
  phrase     = COALESCE(NULLIF(phrase, ''),     'Мы есть те, каких героев себе выбираем'),
  photo      = COALESCE(NULLIF(photo, ''),      'author_EvgOrl.jpg')
WHERE name = 'Евгений Орлов';

INSERT INTO "AuthorContacts" (author_id, channel, url, sort_order)
SELECT a.id, v.channel::author_contact_channel, v.url, v.sort_order
FROM "Authors" a, (VALUES
  ('email', 'mailto:maazay@yandex.ru', 0)
) AS v(channel, url, sort_order)
WHERE a.name = 'Евгений Орлов'
ON CONFLICT (author_id, channel) DO NOTHING;

-- Катерина Кюне
UPDATE "Authors" SET
  bio        = COALESCE(NULLIF(bio, ''),        'Катерина Кюне, родилась в 1984 году в Магадане. По семейной легенде, родители нашли её в громадном

сугробе, который намело под их окнами.

В детстве писала стихи и песни, придумывала страшные истории, которыми пугала подруг.

Училась в Санкт-Петербургском университете телекоммуникаций, но бросила после второго курса. Переехала

в Москву. Окончила Литературный институт имени Горького.

Работала методистом, корреспондентом, копирайтером, координатором благотворительного фонда,

выпускающим редактором, репетитором по математике, продавцом-буфетчицей, разработчиком электронных

курсов. Делала лампы из мусора. Занималась научной журналистикой. На заказ написала историческую

биографию предков одного из российских олигархов. Книга была дорого издана и богата иллюстрирована, но

кроме семьи олигарха её никто не прочёл.

Жила в разных городах: в Магадане, Майкопе, Санкт-Петербурге, Москве, Севастополе, Ярославле,

Бангкоке, Берлине.

Сейчас живёт в Аскере — норвежском городке рядом с Осло.

Зарабатывает трейдингом.

Имеет публикации в журналах «Знамя», «Эмигрантская лира», «Дружба народов», «Лиterraтура», «Этажи»,

«Берлин. Берега» (Германия) и других. Лауреат премии литературного журнала «Знамя». Автор повести

«Здесь должна быть я».'),
  city       = COALESCE(NULLIF(city, ''),       'Аскер'),
  birth_date = COALESCE(NULLIF(birth_date, ''), '1984-03-24'),
  death_date = COALESCE(NULLIF(death_date, ''), NULL),
  phrase     = COALESCE(NULLIF(phrase, ''),     'Мне всегда нравилось представлять себя кем-то другим: собакой, тюльпаном, соседом дядей Васей, путешественницей к другим планетам. В детстве я так играла. Мне хотелось прожить много разных жизней, попробовать много разных занятий. Писательство — это реинкарнация без необходимости умирать. Можно оказаться там, куда тебе не добраться физически, исследовать то, к чему у тебя нет доступа. И даже то, чего не существует. Я просто продолжаю играть, вот и всё.'),
  photo      = COALESCE(NULLIF(photo, ''),      'author_KaterinaKune.jpg')
WHERE name = 'Катерина Кюне';

INSERT INTO "AuthorContacts" (author_id, channel, url, sort_order)
SELECT a.id, v.channel::author_contact_channel, v.url, v.sort_order
FROM "Authors" a, (VALUES
  ('email', 'mailto:littlekat@list.ru', 0),
  ('telegram', 'https://t.me/katerina_kuhne', 1),
  ('facebook', 'https://www.facebook.com/katherina.kuhne', 2),
  ('website', 'https://vk.com/kuhne', 3),
  ('instagram', 'https://www.instagram.com/katherina.kuhne/', 4)
) AS v(channel, url, sort_order)
WHERE a.name = 'Катерина Кюне'
ON CONFLICT (author_id, channel) DO NOTHING;

-- Николай Гоголь
UPDATE "Authors" SET
  bio        = COALESCE(NULLIF(bio, ''),        NULL),
  city       = COALESCE(NULLIF(city, ''),       'с. Великие Сорочинцы'),
  birth_date = COALESCE(NULLIF(birth_date, ''), '1809-04-01'),
  death_date = COALESCE(NULLIF(death_date, ''), '1852-03-04'),
  phrase     = COALESCE(NULLIF(phrase, ''),     'Как ни глупы слова дурака, а иногда бывают они достаточны, чтобы смутить умного человека'),
  photo      = COALESCE(NULLIF(photo, ''),      'gogol.webp')
WHERE name = 'Николай Гоголь';

-- Николай Старообрядцев
UPDATE "Authors" SET
  bio        = COALESCE(NULLIF(bio, ''),        'Начинает свой творческий путь в Архангельске, где пишет тексты и музыку, выступает с группой

сподвижников на андеграундной сцене. Неистовые, почти истерические выступления привлекают к себе

особое внимание — на группу пишут донос и вызывают на допросы в прокуратуру, двоих участников запирают

в психиатрическую больницу, выступления запрещают. Укрывшись от мира, Николай читает классическую

и религиозную литературу, проводит культурологические исследования, изучает инженерное дело и шахматы,

начинает создавать роман «Белый цветок». В какой-то момент он понимает, что его духовный опыт не может

быть достоверно переведён на страницы книги без специальной теоретической и аскетической подготовки.

Притворившись поэтом, он бежит в Петербург, где немедленно поступает на философский факультет.

Оказавшись в новой благотворной среде, активно выступает на конференциях, под разными псевдонимами

публикует статьи о феноменологии, языке и искусстве, продолжает совершенствовать мастерство

художественного слова.'),
  city       = COALESCE(NULLIF(city, ''),       'Санкт-Петербург'),
  birth_date = COALESCE(NULLIF(birth_date, ''), '1983-10-12'),
  death_date = COALESCE(NULLIF(death_date, ''), NULL),
  phrase     = COALESCE(NULLIF(phrase, ''),     'Я исповедую физиологический метод письма. Описание и его предмет должны быть единым организмом: нужно научиться быть стоптанным сапогом, осколком кувшина, водосточной трубой, бешеной собакой, сквозняком или стороной треугольника. И когда далёкое и чужое обратится в интимнейшую дрожь — только тогда можно дотронуться до письменных принадлежностей.'),
  photo      = COALESCE(NULLIF(photo, ''),      'author_nikolStar.jpg')
WHERE name = 'Николай Старообрядцев';

INSERT INTO "AuthorContacts" (author_id, channel, url, sort_order)
SELECT a.id, v.channel::author_contact_channel, v.url, v.sort_order
FROM "Authors" a, (VALUES
  ('email', 'mailto:eisensarg@mail.ru', 0)
) AS v(channel, url, sort_order)
WHERE a.name = 'Николай Старообрядцев'
ON CONFLICT (author_id, channel) DO NOTHING;

-- Оганес Мартиросян
UPDATE "Authors" SET
  bio        = COALESCE(NULLIF(bio, ''),        'Родился и живёт в Саратове. В 2006 году окончил СГУ им. Н. Г. Чернышевского по специальности «Философия». Учился в аспирантуре в СГТУ им. Ю. А. Гагарина. Публиковался в журналах «Нева», «Волга», «Юность», «Воздух», «День и ночь» и других, а также в литературных альманахах. Автор романов «Кубок войны и танца» (Чтиво, 2019), «Небо Мадагаскар» («Эксмо», 2021), «Достоевские дни» (Чтиво, 2022), сборника стихов «Поезд Москва — Нью-Йорк» («Кубик», 2020) и других книг. Участник поэтических и драматургических конкурсов, среди которых «Поэтех», «Турнир поэтов», «Любимовка», «Евразия», «Молодые люди». Трижды лауреат премии «Золотое перо Руси» (2021–2023) и международной премии «В начале было слово» (2024). Стихи переведены на армянский язык.'),
  city       = COALESCE(NULLIF(city, ''),       'Саратов'),
  birth_date = COALESCE(NULLIF(birth_date, ''), '1983-07-16'),
  death_date = COALESCE(NULLIF(death_date, ''), NULL),
  phrase     = COALESCE(NULLIF(phrase, ''),     'Достичь бессмертия сейчас'),
  photo      = COALESCE(NULLIF(photo, ''),      'author_martirosyan.jpg')
WHERE name = 'Оганес Мартиросян';

INSERT INTO "AuthorContacts" (author_id, channel, url, sort_order)
SELECT a.id, v.channel::author_contact_channel, v.url, v.sort_order
FROM "Authors" a, (VALUES
  ('website', 'https://vk.com/oganesmartirosyan', 0),
  ('facebook', 'https://www.facebook.com/profile.php?id=100041174074023', 1)
) AS v(channel, url, sort_order)
WHERE a.name = 'Оганес Мартиросян'
ON CONFLICT (author_id, channel) DO NOTHING;

-- Олег Новокщёнов
UPDATE "Authors" SET
  bio        = COALESCE(NULLIF(bio, ''),        NULL),
  city       = COALESCE(NULLIF(city, ''),       'Воронеж'),
  birth_date = COALESCE(NULLIF(birth_date, ''), NULL),
  death_date = COALESCE(NULLIF(death_date, ''), NULL),
  phrase     = COALESCE(NULLIF(phrase, ''),     'Когда часы мне указали полночь, Я мирно спал. Зачем они вообще?'),
  photo      = COALESCE(NULLIF(photo, ''),      'author_novokschenov.jpg')
WHERE name = 'Олег Новокщёнов';

INSERT INTO "AuthorContacts" (author_id, channel, url, sort_order)
SELECT a.id, v.channel::author_contact_channel, v.url, v.sort_order
FROM "Authors" a, (VALUES
  ('email', 'mailto:novokoleg79@yandex.ru', 0),
  ('website', 'https://vk.com/id569882966', 1)
) AS v(channel, url, sort_order)
WHERE a.name = 'Олег Новокщёнов'
ON CONFLICT (author_id, channel) DO NOTHING;

-- Сергей Дедович
UPDATE "Authors" SET
  bio        = COALESCE(NULLIF(bio, ''),        NULL),
  city       = COALESCE(NULLIF(city, ''),       'г. Санкт-Петербург'),
  birth_date = COALESCE(NULLIF(birth_date, ''), '1988-04-01'),
  death_date = COALESCE(NULLIF(death_date, ''), NULL),
  phrase     = COALESCE(NULLIF(phrase, ''),     'Это не то, чем оно является'),
  photo      = COALESCE(NULLIF(photo, ''),      'author_dedovich.jpg')
WHERE name = 'Сергей Дедович';

INSERT INTO "AuthorContacts" (author_id, channel, url, sort_order)
SELECT a.id, v.channel::author_contact_channel, v.url, v.sort_order
FROM "Authors" a, (VALUES
  ('telegram', 'https://t.me/deadowitch', 0)
) AS v(channel, url, sort_order)
WHERE a.name = 'Сергей Дедович'
ON CONFLICT (author_id, channel) DO NOTHING;

-- Сергей Иннер
UPDATE "Authors" SET
  bio        = COALESCE(NULLIF(bio, ''),        'Родился ночью, когда был страшный ураган, в Таганроге. В 2011 году переехал в Санкт-Петербург. Однажды

кому-то сказал, что молчание — золото, и понял, что лучше было молчать. Основатель группы «Сверхновая

Зеландия». Психоделически исчез 8 мая 2019 года, после презентации антиромана «Овердрайв».

Видеокурс «Проза» Сергея Иннера'),
  city       = COALESCE(NULLIF(city, ''),       'Санкт-Петербург'),
  birth_date = COALESCE(NULLIF(birth_date, ''), '1988-10-04'),
  death_date = COALESCE(NULLIF(death_date, ''), NULL),
  phrase     = COALESCE(NULLIF(phrase, ''),     'Порой куда важнее того, что ты делаешь, то, чего ты не делаешь'),
  photo      = COALESCE(NULLIF(photo, ''),      'author_inner.jpg')
WHERE name = 'Сергей Иннер';

INSERT INTO "AuthorContacts" (author_id, channel, url, sort_order)
SELECT a.id, v.channel::author_contact_channel, v.url, v.sort_order
FROM "Authors" a, (VALUES
  ('email', 'mailto:inner.inbox@gmail.com', 0),
  ('facebook', 'https://www.facebook.com/rocknword', 1),
  ('website', 'https://www.patreon.com/russiandino', 2),
  ('instagram', 'https://www.instagram.com/rocknword/', 4)
) AS v(channel, url, sort_order)
WHERE a.name = 'Сергей Иннер'
ON CONFLICT (author_id, channel) DO NOTHING;

-- Эдуард Диа Диникин
UPDATE "Authors" SET
  bio        = COALESCE(NULLIF(bio, ''),        'Уроженец Челябинска. Работал журналистом, вахтовиком на Севере, в кинематографе

(около тридцати эпизодов и ролей второго плана). Пишет для российских общественно-политических изданий.

Публиковался в журналах «Урал» и «Бронзовый век», в литжурнале Русского Динозавра.

Победил с эссе в конкурсе «Воспевая Китай» (при поддержке посольства КНР) в 2018 году.

Автор романа «Серебро» (Чтиво, 2022). Живёт в Санкт-Петербурге.'),
  city       = COALESCE(NULLIF(city, ''),       'г. Челябинск'),
  birth_date = COALESCE(NULLIF(birth_date, ''), NULL),
  death_date = COALESCE(NULLIF(death_date, ''), NULL),
  phrase     = COALESCE(NULLIF(phrase, ''),     'Двум смертям не бывать, на одну наплевать'),
  photo      = COALESCE(NULLIF(photo, ''),      'author_dinikin.jpg')
WHERE name = 'Эдуард Диа Диникин';

INSERT INTO "AuthorContacts" (author_id, channel, url, sort_order)
SELECT a.id, v.channel::author_contact_channel, v.url, v.sort_order
FROM "Authors" a, (VALUES
  ('website', 'https://vk.com/id167965294', 0)
) AS v(channel, url, sort_order)
WHERE a.name = 'Эдуард Диа Диникин'
ON CONFLICT (author_id, channel) DO NOTHING;

-- Эрих фон Нефф
UPDATE "Authors" SET
  bio        = COALESCE(NULLIF(bio, ''),        'Родился на Филиппинах, в Маниле, переехал в США, служил в Корпусе морской пехоты. Получил учёную степень по философии в Государственном Университете Сан-Франциско, был аспирантом университета Данди в Шотландии. Состоит в «Обществе французских поэтов и художников».

Работал докером в порту Окленда (Калифорния) до начала 2019 года. Награждён 22 литературными премиями, в том числе премией Виктора Гюго за книгу ‘Une Lancia rouge dévale Lombard Street tombeau ouvert’ (Красная Lancia рвёт вниз по Ломбард-стрит).

В Чтиве дебютировал с книгой Проститутки на обочине.'),
  city       = COALESCE(NULLIF(city, ''),       'Сан-Франциско'),
  birth_date = COALESCE(NULLIF(birth_date, ''), '1939-01-03'),
  death_date = COALESCE(NULLIF(death_date, ''), NULL),
  phrase     = COALESCE(NULLIF(phrase, ''),     'Have a beer and a blowjob and relax'),
  photo      = COALESCE(NULLIF(photo, ''),      'author_vonNeff.jpg')
WHERE name = 'Эрих фон Нефф';

INSERT INTO "AuthorContacts" (author_id, channel, url, sort_order)
SELECT a.id, v.channel::author_contact_channel, v.url, v.sort_order
FROM "Authors" a, (VALUES
  ('facebook', 'https://www.facebook.com/erich.vonneff', 0),
  ('website', 'https://www.overdrive.com/publishers/erich-von-neff', 1)
) AS v(channel, url, sort_order)
WHERE a.name = 'Эрих фон Нефф'
ON CONFLICT (author_id, channel) DO NOTHING;

-- ─── Author photos required in Storage bucket "authors" ────────────
-- The UPDATE rows above set Authors.photo to these filenames. Download
-- the originals from chtivo.spb.ru/assets/img/ and upload to the bucket
-- with the same names (scripts/download-author-photos.mjs can do this).
--   author_gavrilov.jpg  (Александр Гаврилов)
--   author_kolesnikov.jpg  (Алексей Колесников)
--   author_yankus.jpg  (Андрей Янкус)
--   author_annPashkova.jpg  (Анна Пашкова)
--   author_severskyi.jpg  (Артём Северский)
--   author_boris.jpg  (Борис Майнаев)
--   author_vasVyaluj.jpg  (Василий Вялый)
--   author_ponkratov.jpg  (Георгий Панкратов)
--   author_strelcova.jpg  (Даша Стрельцова)
--   author_keruak.jpg  (Джек Керуак)
--   author_EvgOrl.jpg  (Евгений Орлов)
--   author_KaterinaKune.jpg  (Катерина Кюне)
--   gogol.webp  (Николай Гоголь)
--   author_nikolStar.jpg  (Николай Старообрядцев)
--   author_martirosyan.jpg  (Оганес Мартиросян)
--   author_novokschenov.jpg  (Олег Новокщёнов)
--   author_dedovich.jpg  (Сергей Дедович)
--   author_inner.jpg  (Сергей Иннер)
--   author_dinikin.jpg  (Эдуард Диа Диникин)
--   author_vonNeff.jpg  (Эрих фон Нефф)
