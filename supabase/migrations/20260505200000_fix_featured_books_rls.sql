-- Replace deprecated auth.role() with auth.uid() IS NOT NULL in featured_books RLS.
-- auth.role() is deprecated in Supabase and may stop working in future versions.

DROP POLICY IF EXISTS "Authenticated users can modify featured books" ON "featured_books";

CREATE POLICY "Authenticated users can modify featured books"
  ON "featured_books" FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
