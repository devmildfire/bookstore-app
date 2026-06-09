-- About page (`/about`) — schema for the team strip and partners strip.
--
--   • Extends "Workers" with team-member fields (photo_path, city,
--     is_team_member flag, sort_order). The plain Workers rows used for book
--     credits are unaffected — they keep is_team_member=false.
--   • Adds the "Partners" table.
--   • Provisions three public Storage buckets: `videos`, `partners`, `workers`.
--
-- See docs/plans/about-page.md.

-- ─── 1. Workers: add team-member fields ─────────────────────────────────────
ALTER TABLE "Workers"
  ADD COLUMN IF NOT EXISTS photo_path      text,
  ADD COLUMN IF NOT EXISTS city            text,
  ADD COLUMN IF NOT EXISTS is_team_member  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order      integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS workers_team_idx
  ON "Workers" (sort_order)
  WHERE is_team_member = true;

-- ─── 2. Partners ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Partners" (
  id          serial  PRIMARY KEY,
  name        text    NOT NULL UNIQUE,
  logo_path   text,
  website_url text,
  sort_order  integer NOT NULL DEFAULT 0
);

ALTER TABLE "Partners" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read partners" ON "Partners";
CREATE POLICY "Public read partners" ON "Partners" FOR SELECT USING (true);

-- ─── 3. Storage buckets ─────────────────────────────────────────────────────
-- All three are public-read (no auth required for the about-page assets).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('videos',   'videos',   true, 52428800, ARRAY['video/mp4']),                                    -- 50 MiB
  ('partners', 'partners', true,  2097152, ARRAY['image/svg+xml', 'image/png', 'image/jpeg']),     --  2 MiB
  ('workers',  'workers',  true,  2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])        --  2 MiB
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public-read RLS for each bucket. Writes are admin-only (no INSERT/UPDATE/
-- DELETE policies) — ops uploads happen via the Supabase service role or the
-- dashboard, not from the browser.
DROP POLICY IF EXISTS videos_select ON storage.objects;
CREATE POLICY videos_select ON storage.objects
  FOR SELECT USING (bucket_id = 'videos');

DROP POLICY IF EXISTS partners_select ON storage.objects;
CREATE POLICY partners_select ON storage.objects
  FOR SELECT USING (bucket_id = 'partners');

DROP POLICY IF EXISTS workers_select ON storage.objects;
CREATE POLICY workers_select ON storage.objects
  FOR SELECT USING (bucket_id = 'workers');
