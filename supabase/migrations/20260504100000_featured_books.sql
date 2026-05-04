-- Featured books table — admin-controlled highlights for the homepage slider.
-- Ordered by sort_order (ascending). Each title can appear at most once.

CREATE TABLE IF NOT EXISTS "featured_books" (
  id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title_id  bigint NOT NULL REFERENCES "Titles"(id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(title_id)
);

-- Enable RLS
ALTER TABLE "featured_books" ENABLE ROW LEVEL SECURITY;

-- Anyone can read featured books
CREATE POLICY "Featured books are publicly readable"
  ON "featured_books" FOR SELECT
  USING (true);

-- Only authenticated users can modify (admin use)
CREATE POLICY "Authenticated users can modify featured books"
  ON "featured_books" FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Seed: the 5 highlighted books for the homepage slider
INSERT INTO "featured_books" (title_id, sort_order) VALUES
  (65, 1),  -- Deleted
  (55, 2),  -- Ирокез
  (2,  3),  -- Архив барона Унгерна
  (41, 4),  -- Глас земли
  (49, 5)   -- Двойник
;