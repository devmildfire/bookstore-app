-- Editions consolidation, Phase F (audit F5): drop the four legacy edition tables and
-- their four worker join tables, now fully replaced by Editions + EditionWorkers.
-- Data was backfilled + parity-verified (Phase A), references repointed (Phase B), all
-- functions + code migrated (Phases D/E), and the full commerce path re-verified (Phase G).
-- The only inbound FKs to the edition tables were the worker tables (dropped here too).

DROP TABLE IF EXISTS public."EbookWorkers";
DROP TABLE IF EXISTS public."AudiobookWorkers";
DROP TABLE IF EXISTS public."PrintedBookWorkers";
DROP TABLE IF EXISTS public."CardBookWorkers";

DROP TABLE IF EXISTS public."Ebooks";
DROP TABLE IF EXISTS public."Audiobooks";
DROP TABLE IF EXISTS public."PrintedBooks";
DROP TABLE IF EXISTS public."CardBooks";
