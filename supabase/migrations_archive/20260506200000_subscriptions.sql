-- ─── Subscriptions table ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Subscriptions" (
  id         serial      PRIMARY KEY,
  slug       text        NOT NULL UNIQUE,
  name       text        NOT NULL,
  perks      text[]      NOT NULL DEFAULT '{}',
  price      integer     NOT NULL,
  image      text,
  position   integer     NOT NULL DEFAULT 0,
  is_active  boolean     NOT NULL DEFAULT true
);

ALTER TABLE "Subscriptions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read subscriptions"
  ON "Subscriptions" FOR SELECT
  USING (is_active = true);

-- ─── Seed data ────────────────────────────────────────────────────────────────

INSERT INTO "Subscriptions" (slug, name, perks, price, image, position) VALUES
  (
    'blizkost',
    'ЧУДО БЛИЗОСТИ',
    ARRAY[
      'Цифровые издания в день релиза',
      'Аудиоиздания в день релиза'
    ],
    300,
    'sub_blizkost.png',
    1
  ),
  (
    'prichastie',
    'ЧУДО ПРИЧАСТИЯ',
    ARRAY[
      'Цифровые издания в день релиза',
      'Аудиоиздания в день релиза',
      'Классика Чтива раз в месяц'
    ],
    500,
    'sub_prichastie.png',
    2
  ),
  (
    'edinstvo',
    'ЧУДО ЕДИНСТВА',
    ARRAY[
      'Цифровые издания в день релиза',
      'Аудиоиздания в день релиза',
      'Классика Чтива раз в месяц',
      'Печатные издания в день релиза'
    ],
    1000,
    'sub_edinstvo.png',
    3
  )
ON CONFLICT (slug) DO NOTHING;
