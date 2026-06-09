-- Public storage bucket for per-book photo series.
-- Each book's photos live in a folder named after its slug:
--   book-photos/{slug}/1.jpg, book-photos/{slug}/2.jpg, ...

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'book-photos',
  'book-photos',
  true,
  20971520, -- 20 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read book photos" ON storage.objects;
CREATE POLICY "Public read book photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'book-photos');
