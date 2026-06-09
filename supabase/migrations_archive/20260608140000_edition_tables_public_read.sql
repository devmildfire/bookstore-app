-- Catalog edition tables must be publicly readable. The storefront book page
-- reads them through get_catalog_book_by_slug (SECURITY INVOKER) as the anon
-- role. RLS was enabled on Ebooks/Audiobooks/PrintedBooks WITHOUT a SELECT
-- policy, so anon saw zero rows from them and the book page rendered only the
-- CardBooks (Book2.0) edition — even when other editions were published.
DROP POLICY IF EXISTS "Public read ebooks" ON "Ebooks";
CREATE POLICY "Public read ebooks" ON "Ebooks" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read audiobooks" ON "Audiobooks";
CREATE POLICY "Public read audiobooks" ON "Audiobooks" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read printed books" ON "PrintedBooks";
CREATE POLICY "Public read printed books" ON "PrintedBooks" FOR SELECT USING (true);
