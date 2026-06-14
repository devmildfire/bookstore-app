-- Editions consolidation, Phase A (audit F5): one Editions + one EditionWorkers table,
-- replacing the four parallel edition tables and their four worker join tables.
-- ADDITIVE ONLY — the old tables are left in place (dropped later in Phase F after
-- verification). See docs/plans/editions-consolidation-execution.md.

CREATE TABLE public."Editions" (
  id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title_id      integer NOT NULL REFERENCES public."Titles"(id) ON DELETE CASCADE,
  kind          text NOT NULL CHECK (kind IN ('EBook', 'AudioBook', 'PrintBook', 'Book2.0')),
  price         numeric(10,2),
  discount      numeric(10,2),
  is_published  boolean NOT NULL DEFAULT false,
  sold_out      boolean NOT NULL DEFAULT false,
  publish_date  text,
  release_date  text,
  file_path     text,
  demo_path     text,
  details       jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (title_id, kind)   -- a title has at most one edition per kind
);

CREATE INDEX idx_editions_title_id ON public."Editions" (title_id);
CREATE INDEX idx_editions_kind ON public."Editions" (kind);

CREATE TABLE public."EditionWorkers" (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  edition_id  integer NOT NULL REFERENCES public."Editions"(id) ON DELETE CASCADE,
  worker_id   integer NOT NULL REFERENCES public."Workers"(id) ON DELETE CASCADE,
  sort_order  integer NOT NULL DEFAULT 0
);

CREATE INDEX idx_edition_workers_edition_id ON public."EditionWorkers" (edition_id);

-- RLS: public read, no anon/authenticated writes (F1 lesson). Writes go via service role.
ALTER TABLE public."Editions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read editions" ON public."Editions" FOR SELECT USING (true);
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public."Editions" FROM anon, authenticated;

ALTER TABLE public."EditionWorkers" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read edition workers" ON public."EditionWorkers" FOR SELECT USING (true);
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public."EditionWorkers" FROM anon, authenticated;

-- ── Backfill ───────────────────────────────────────────────────────────────────
-- details jsonb mirrors exactly what the catalog RPCs emitted as edition_details
-- (so normalizeBook is unchanged). jsonb_strip_nulls keeps details tidy.

INSERT INTO public."Editions"
  (title_id, kind, price, discount, is_published, sold_out, publish_date, release_date, file_path, demo_path, details)
SELECT title_id, 'EBook', price, discount, COALESCE(is_published, false), false,
       publish_date, release_date, file_path, demo_path,
       jsonb_strip_nulls(jsonb_build_object('formats', formats, 'character_count', character_count))
FROM public."Ebooks";

INSERT INTO public."Editions"
  (title_id, kind, price, discount, is_published, sold_out, publish_date, release_date, file_path, demo_path, details)
SELECT title_id, 'AudioBook', price, discount, COALESCE(is_published, false), false,
       publish_date, release_date, file_path, demo_path,
       jsonb_strip_nulls(jsonb_build_object('duration_seconds', duration_seconds, 'file_size_bytes', file_size_bytes))
FROM public."Audiobooks";

INSERT INTO public."Editions"
  (title_id, kind, price, discount, is_published, sold_out, publish_date, release_date, file_path, demo_path, details)
SELECT title_id, 'PrintBook', price, discount, COALESCE(is_published, false), COALESCE(sold_out, false),
       publish_date, release_date, NULL, demo_path,
       jsonb_strip_nulls(jsonb_build_object(
         'format', format, 'page_count', page_count, 'paper', paper,
         'cover_material', cover_material, 'binding', binding, 'illustrations', illustrations))
FROM public."PrintedBooks";

INSERT INTO public."Editions"
  (title_id, kind, price, discount, is_published, sold_out, publish_date, release_date, file_path, demo_path, details)
SELECT title_id, 'Book2.0', price, discount, COALESCE(is_published, false), COALESCE(sold_out, false),
       publish_date, release_date, file_path, demo_path,
       jsonb_strip_nulls(jsonb_build_object(
         'format', format, 'printing_technique', printing_technique, 'paper', paper, 'packaging', packaging))
FROM public."CardBooks";

-- Worker rows, mapped via (title_id, kind) → new edition id through the still-present
-- old tables.
INSERT INTO public."EditionWorkers" (edition_id, worker_id, sort_order)
SELECT e.id, ew.worker_id, ew.sort_order
FROM public."EbookWorkers" ew
JOIN public."Ebooks" o ON o.id = ew.ebook_id
JOIN public."Editions" e ON e.title_id = o.title_id AND e.kind = 'EBook';

INSERT INTO public."EditionWorkers" (edition_id, worker_id, sort_order)
SELECT e.id, aw.worker_id, aw.sort_order
FROM public."AudiobookWorkers" aw
JOIN public."Audiobooks" o ON o.id = aw.audiobook_id
JOIN public."Editions" e ON e.title_id = o.title_id AND e.kind = 'AudioBook';

INSERT INTO public."EditionWorkers" (edition_id, worker_id, sort_order)
SELECT e.id, pw.worker_id, pw.sort_order
FROM public."PrintedBookWorkers" pw
JOIN public."PrintedBooks" o ON o.id = pw.printed_book_id
JOIN public."Editions" e ON e.title_id = o.title_id AND e.kind = 'PrintBook';

INSERT INTO public."EditionWorkers" (edition_id, worker_id, sort_order)
SELECT e.id, cw.worker_id, cw.sort_order
FROM public."CardBookWorkers" cw
JOIN public."CardBooks" o ON o.id = cw.card_book_id
JOIN public."Editions" e ON e.title_id = o.title_id AND e.kind = 'Book2.0';
