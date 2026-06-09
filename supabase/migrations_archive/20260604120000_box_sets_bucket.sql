-- Box-set images move from public/boxsets/ into a Supabase Storage bucket so
-- they can be uploaded/managed via the admin panel. SVGs are allowed; the
-- storefront fetches their markup and inlines it. Public read.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'box-sets', 'box-sets', true, 5242880,
  ARRAY['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;
