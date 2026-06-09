-- Articles: editorial pieces displayed under /dino-magazine.
-- One author per article; body is an ordered JSONB array of typed blocks
-- (paragraph + image). Cover image and inline illustration files live in
-- the public `articles` Storage bucket and are referenced by bare
-- filename, mirroring the covers/subscriptions/gift-cards conventions.

CREATE TABLE IF NOT EXISTS "Articles" (
  id              serial      PRIMARY KEY,
  slug            text        NOT NULL UNIQUE,
  title           text        NOT NULL,
  author_id       integer     NOT NULL REFERENCES "Authors"(id) ON DELETE RESTRICT,
  cover_path      text,
  cover_blur      text,
  excerpt         text,
  content_blocks  jsonb       NOT NULL DEFAULT '[]'::jsonb,
  published_at    timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_blocks_is_array
    CHECK (jsonb_typeof(content_blocks) = 'array')
);

CREATE INDEX IF NOT EXISTS idx_articles_published_desc
  ON "Articles" (published_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_articles_author
  ON "Articles" (author_id);

ALTER TABLE "Articles" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read articles" ON "Articles";
CREATE POLICY "Public read articles" ON "Articles"
  FOR SELECT USING (true);

-- ─── Storage bucket ──────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'articles',
  'articles',
  true,
  20971520, -- 20 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read article images" ON storage.objects;
CREATE POLICY "Public read article images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'articles');
