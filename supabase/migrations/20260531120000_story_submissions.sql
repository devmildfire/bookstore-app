-- Story submissions: a private Storage bucket that holds manuscript files
-- uploaded through the "Отправить рассказ" form on /suggest-story-to-rd.
--
-- Files are kept for later editorial review (not served publicly). Each file
-- lives under `{user_id}/...` so the first folder segment identifies the
-- owner — the same convention as the `avatars` bucket.
--
-- We deliberately do NOT constrain allowed_mime_types: browsers frequently
-- report an empty or non-standard MIME for .fb2 / .epub files, which would
-- bounce otherwise-valid uploads. Format is enforced client-side by file
-- extension; the 4 MiB size cap is enforced here as well.

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'story-submissions',
  'story-submissions',
  false,
  4194304                                              -- 4 MiB
)
ON CONFLICT (id) DO UPDATE
  SET public          = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit;

-- Storage RLS. The owner (anon or real user) may upload into their own folder.
-- Reads are NOT public — submissions are reviewed via the service role / admin
-- tooling, so we expose SELECT only to the owner.
DROP POLICY IF EXISTS story_submissions_insert ON storage.objects;
CREATE POLICY story_submissions_insert ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'story-submissions'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS story_submissions_select ON storage.objects;
CREATE POLICY story_submissions_select ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'story-submissions'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
