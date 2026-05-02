-- Seed data for local development
-- Creates the necessary tables and populates them with sample books

-- ─── Enums ────────────────────────────────────────────────────────────────────

CREATE TYPE category AS ENUM (
  'PrintBook',
  'AudioBook',
  'EBook',
  'Book2.0',
  'GiftCard',
  'BoxSet',
  'Subscription',
  'Course'
);

-- ─── Tables ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Authors" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  photo TEXT,
  birth_date TEXT,
  death_date TEXT,
  city TEXT,
  phrase TEXT,
  nonsalable BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS "Titles" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  cover TEXT,
  description TEXT,
  thesis TEXT,
  demo TEXT,
  trailer TEXT,
  trailer_poster TEXT,
  age_restriction INTEGER,
  first_release TEXT,
  is_compilation BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  lit_form TEXT
);

CREATE TABLE IF NOT EXISTS "Titles_Authors" (
  id SERIAL PRIMARY KEY,
  title_id INTEGER NOT NULL REFERENCES "Titles"(id) ON DELETE CASCADE,
  author_id INTEGER NOT NULL REFERENCES "Authors"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "CardBooks" (
  id SERIAL PRIMARY KEY,
  title_id INTEGER NOT NULL UNIQUE REFERENCES "Titles"(id) ON DELETE CASCADE,
  price NUMERIC(10, 2),
  sold_out BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  publish_date TEXT,
  release_date TEXT,
  discount NUMERIC(10, 2),
  sold INTEGER DEFAULT 0,
  demo TEXT,
  extra TEXT,
  counter_color TEXT
);

-- ─── Sample Authors ───────────────────────────────────────────────────────────

INSERT INTO "Authors" (id, name, bio) VALUES
  (1, 'Михаил Булгаков', 'Русский писатель, драматург, театральный режиссёр.'),
  (2, 'Фёдор Достоевский', 'Русский писатель, мыслитель, философ и публицист.'),
  (3, 'Лев Толстой', 'Русский писатель и мыслитель, один из величайших романистов мира.'),
  (4, 'Антон Чехов', 'Русский писатель, драматург, врач.'),
  (5, 'Александр Пушкин', 'Русский поэт, драматург и прозаик.')
ON CONFLICT (id) DO NOTHING;

-- ─── Sample Titles ────────────────────────────────────────────────────────────

INSERT INTO "Titles" (id, name, slug, cover, description) VALUES
  (1, 'Мастер и Маргарита', 'master-i-margarita', '/images/book-covers/chtivo-covers-opt/aristotel-v-kazahstane.webp', 'Роман о визите дьявола в Москву 1930-х годов, о любви Мастера и Маргариты, о Понтии Пилате и Иешуа Га-Ноцри.'),
  (2, 'Преступление и наказание', 'prestuplenie-i-nakazanie', '/images/book-covers/chtivo-covers-opt/craft.webp', 'Роман о студенте Раскольникове, совершившем убийство и проходящем через муки совести.'),
  (3, 'Война и мир', 'voina-i-mir', '/images/book-covers/chtivo-covers-opt/deleted.webp', 'Эпопея о жизни русского общества в эпоху наполеоновских войн.'),
  (4, 'Анна Каренина', 'anna-karenina', '/images/book-covers/chtivo-covers-opt/dostoevskie-dni.webp', 'Роман о трагической любви замужней женщины и офицера.'),
  (5, 'Евгений Онегин', 'evgeniy-onegin', '/images/book-covers/chtivo-covers-opt/dvoinik.webp', 'Роман в стихах о жизни петербургского дворянина.'),
  (6, 'Собачье сердце', 'sobachie-serdce', '/images/book-covers/chtivo-covers-opt/frida-i-gitta.webp', 'Повесть о профессоре Преображенском, превратившем собаку в человека.'),
  (7, 'Идиот', 'idiot', '/images/book-covers/chtivo-covers-opt/irokez.webp', 'Роман о князе Мышкине — человеке необыкновенной доброты и чистоты.'),
  (8, 'Вишнёвый сад', 'vishnevy-sad', '/images/book-covers/chtivo-covers-opt/kubok-voiny-i-tanca.webp', 'Пьеса о дворянской усадьбе, которую продают за долги.')
ON CONFLICT (id) DO NOTHING;

-- ─── Sample Title-Author Links ────────────────────────────────────────────────

INSERT INTO "Titles_Authors" (title_id, author_id) VALUES
  (1, 1),
  (6, 1),
  (2, 2),
  (7, 2),
  (3, 3),
  (4, 3),
  (8, 4),
  (5, 5)
ON CONFLICT DO NOTHING;

-- ─── Sample CardBooks ─────────────────────────────────────────────────────────

INSERT INTO "CardBooks" (id, title_id, price, sold_out, is_published, publish_date, release_date) VALUES
  (1, 1, 299, false, true, '2024-01-15', '2024-01-15'),
  (2, 2, 249, false, true, '2024-02-01', '2024-02-01'),
  (3, 3, 399, false, true, '2024-03-10', '2024-03-10'),
  (4, 4, 299, false, true, '2024-04-05', '2024-04-05'),
  (5, 5, 199, false, true, '2024-05-20', '2024-05-20'),
  (6, 6, 249, true, true, '2024-06-15', '2024-06-15'),
  (7, 7, 299, false, true, '2024-07-01', '2024-07-01'),
  (8, 8, 199, false, true, '2024-08-10', '2024-08-10')
ON CONFLICT (id) DO NOTHING;
