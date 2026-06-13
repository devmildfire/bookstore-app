-- Lock down catalog tables (data-architecture audit F1).
--
-- Titles, Authors, CardBooks, Titles_Authors had RLS DISABLED while the anon and
-- authenticated roles held INSERT/UPDATE/DELETE/TRUNCATE. Because the anon key ships
-- to the browser, the catalog was publicly modifiable/destructible via PostgREST.
--
-- Fix: enable RLS with a public SELECT policy (mirroring the sibling edition tables
-- Ebooks/Audiobooks/PrintedBooks), and revoke write privileges from anon/authenticated.
-- Enabling RLS with only a SELECT policy already denies writes to non-bypass roles;
-- the REVOKE is defense-in-depth. Admin writes are unaffected — they run via the
-- service role (createAdminClient), which bypasses RLS and grants.

ALTER TABLE public."Titles" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read titles" ON public."Titles"
  FOR SELECT TO public USING (true);
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public."Titles" FROM anon, authenticated;

ALTER TABLE public."Authors" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read authors" ON public."Authors"
  FOR SELECT TO public USING (true);
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public."Authors" FROM anon, authenticated;

ALTER TABLE public."CardBooks" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read card books" ON public."CardBooks"
  FOR SELECT TO public USING (true);
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public."CardBooks" FROM anon, authenticated;

ALTER TABLE public."Titles_Authors" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read titles_authors" ON public."Titles_Authors"
  FOR SELECT TO public USING (true);
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public."Titles_Authors" FROM anon, authenticated;
