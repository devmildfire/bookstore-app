-- Profile cabinet schema:
--   • Profiles table (one row per auth.users) with default nickname 'Никнейм'
--   • avatars Storage bucket (public, 2 MB cap, JPEG/PNG/WEBP) + RLS per user
--   • get_or_create_profile() RPC for lazy row creation
--
-- See docs/plans/anonymous-first-profile.md.

-- ─── 1. Profiles table ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Profiles" (
  user_id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname       TEXT NOT NULL DEFAULT 'Никнейм',
  avatar_path    TEXT NULL,        -- object key in `avatars` bucket
  full_name      TEXT NULL,
  phone          TEXT NULL,
  birthday       DATE NULL,
  about          TEXT NULL,
  recovery_email TEXT NULL,        -- opt-in; distinct from auth.users.email
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE "Profiles" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select ON "Profiles";
CREATE POLICY profiles_select ON "Profiles"
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS profiles_insert ON "Profiles";
CREATE POLICY profiles_insert ON "Profiles"
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS profiles_update ON "Profiles";
CREATE POLICY profiles_update ON "Profiles"
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
-- No DELETE policy: rows go away only via auth.users CASCADE.

-- Auto-update updated_at on UPDATE
CREATE OR REPLACE FUNCTION profiles_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_touch_updated_at ON "Profiles";
CREATE TRIGGER profiles_touch_updated_at
  BEFORE UPDATE ON "Profiles"
  FOR EACH ROW
  EXECUTE FUNCTION profiles_touch_updated_at();

-- ─── 2. avatars Storage bucket ──────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,                                              -- 2 MiB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS. Files live under `{user_id}/...` so the first folder segment
-- is the owner. Only that owner can write (insert/update/delete); reads are
-- public so <Image> can render avatars in headers, reviews, etc.
DROP POLICY IF EXISTS avatars_select ON storage.objects;
CREATE POLICY avatars_select ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS avatars_insert ON storage.objects;
CREATE POLICY avatars_insert ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS avatars_update ON storage.objects;
CREATE POLICY avatars_update ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS avatars_delete ON storage.objects;
CREATE POLICY avatars_delete ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ─── 3. get_or_create_profile() RPC ────────────────────────────────────────
-- Lazy row creation. /profile route hits this on every load — idempotent,
-- returns the existing row or inserts a new one with the default nickname.
CREATE OR REPLACE FUNCTION get_or_create_profile()
RETURNS "Profiles"
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row "Profiles";
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT * INTO v_row FROM "Profiles" WHERE user_id = v_uid;
  IF NOT FOUND THEN
    INSERT INTO "Profiles" (user_id)
    VALUES (v_uid)
    RETURNING * INTO v_row;
  END IF;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION get_or_create_profile() TO anon, authenticated;
