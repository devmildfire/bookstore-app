# Open Concerns

Tracked issues that are not part of an active plan but haven't been resolved.

**Last reviewed:** 2026-06-09.

---

## D1 ✅ RESOLVED (2026-06-09) — repo now reproduces the DB from a consolidated baseline

**Fixed by squashing to a single baseline.** The 57 drifted migrations could no longer
replay (renamed types, duplicate seed keys, function-signature changes). They are now
archived in `supabase/migrations_archive/` (kept for reference) and replaced by one
baseline generated from the live DB:

- `supabase/migrations/20260101000000_baseline_schema.sql` — full public schema
  (tables, enums, functions, RLS) + `pg_trgm` + the 15 storage buckets + 17
  `storage.objects` policies. (`pg_dump --schema-only`, `CREATE SCHEMA public` stripped.)
- `supabase/seed.sql` — **data only** now (`pg_dump --data-only`, catalog/content
  tables only; user/runtime tables `Cart`/`Orders`/`OrderItems`/`Profiles`/… excluded
  since they FK to `auth.users`, which is empty on a fresh reset).

**Verified** on a throwaway DB (auth/storage stubbed): baseline + seed replay cleanly
and every table count matches live (Titles 64, Workers 183, EbookWorkers 325,
TitleSimilarTitles 184, …) + 15 buckets + 17 policies. A real `supabase db reset` was
**not** run (it would wipe the restored storage). Post-reset steps remain manual:
`scripts/seed-admin.mjs` (auth user) + the `scripts/upload-*`/`sync-*` scripts (storage
objects) + the placeholder/demo restores. The live DB's `schema_migrations` was
realigned to the single baseline version.

<details><summary>Original problem (for history)</summary>

`supabase/seed.sql` + `supabase/migrations/` **could not reconstruct the database from
scratch.** Several core tables had **no `CREATE TABLE` anywhere in the repo** — they
were only ever hand-applied to the live instance:

- `Ebooks`, `Audiobooks`, `PrintedBooks`, `Orders`, `OrderItems`, `Cart` are **not
  created** by any migration; `seed.sql` only creates 6 tables (Authors, Titles,
  Titles_Authors, Awards, Titles_Awards, CardBooks).
- Migrations like `cart_user_isolation` *ALTER* `Cart` assuming it already exists.
- `seed.sql` is a partial/older snapshot (e.g. it lacks columns added later such as
  `Titles.status`, `cover_blur`, `book_photos_blurs`, `demo_path`).
- A `supabase db reset` therefore **fails** (migrations run before seed, and the
  earliest migration references tables seed never creates). The DB has only ever
  been maintained via incremental `supabase migration up` on a long-lived instance.

This bit hard on **2026-06-06** when an agent wiped the local DB/storage and there was
no clean way to rebuild — recovery had to reconstruct `OrderItems`/`Cart` DDL from
`src/types/supabase.ts` + RPC column lists (see migration
`20260608150000_rebuild_cart_orderitems.sql`).

**Action (make the repo the source of truth):**
1. Generate a complete schema dump of the live DB
   (`pg_dump --schema-only`) and fold the missing `CREATE TABLE`s (Ebooks,
   Audiobooks, PrintedBooks, Orders, OrderItems, Cart, …) into either an initial
   migration or a regenerated `seed.sql` so `seed.sql + migrations` reproduces the
   live schema exactly.
2. Decide the bootstrap order and make `supabase db reset` actually work (or
   document the real bootstrap: load schema, then `migration up`).
3. Keep `seed.sql` regenerated whenever the base schema changes; treat
   `src/types/supabase.ts` and the live DB as needing to agree.
4. The wipe was patched with a series of corrective migrations (all applied +
   committed); fold their effect into the consolidated schema:
   - `20260606120000_edition_demo_path` (demo columns/bucket)
   - `20260608130000_author_contact_vk` (vk enum value)
   - `20260608140000_edition_tables_public_read` (RLS read on Ebooks/Audiobooks/PrintedBooks)
   - `20260608150000_rebuild_cart_orderitems` (Cart + OrderItems → code schema)
   - `20260608160000_orders_delivery_columns` (delivery_method/delivery_email/updated_at)
   - `20260608170000_orders_rls_policies` (Orders owner RLS, lost in the wipe)

   The commerce path (cart → `create_pending_order` → Orders + OrderItems →
   `mark_order_paid`) is now verified working end-to-end, and **no table remains
   RLS-enabled-with-zero-policies**. The `Orders` table still carries 8 stale legacy
   columns (`full_name`, `email`, `address`, …) not in the intended schema; they're
   nullable/defaulted so harmless, but should be dropped during consolidation.

See also [docs/DATABASE_BACKUP.md](DATABASE_BACKUP.md) (backup-before-destructive rule).

</details>

---

## D2 🟠 Post-wipe content & storage not fully restored

The 2026-06-06 wipe emptied all storage buckets and some catalog content. Restored
so far (from the Firefox cache + re-scrape of `chtivo.spb.ru`, see the book-mining
work): **covers, box-set SVGs, book-photo galleries, author photos** (buckets), and
**book descriptions/editions/workers/authors/contacts** (mined into the DB).

**Still empty / not restored:**

| Item | State |
|------|-------|
| `Articles` table + `articles` bucket | **0 rows** — `/dino-magazine` is empty (`scripts/upload-articles-to-supabase.mjs`) |
| `TitleSimilarTitles` | ✅ **done** — mined "Познайте также" from book-page footers: 184 links across 62 books (`get_similar_books` verified) |
| `BookContexts` | **0 rows** — book "context" cards empty |
| `PromoCodes` | ✅ **done** — re-seeded 5 fixtures via `supabase/seed-promo-codes.sql` (SUMMER25/FREECART/WHITE30/AUDIO50/OLDCODE); apply/expired/not-found paths verified |
| `partners` bucket | ✅ **not a gap** — `Partners.logo_path` is NULL by design (about_page_seed: "logo_path NULL → placeholder square"); `PartnerLogo.tsx` renders a name tile fallback. Empty bucket is correct. |
| `booktrailers` bucket | ✅ **done (placeholder)** — chtivo embeds via Rutube (not downloadable); restored a «заглушка» placeholder for white-flower (`booktrailers/white-flower/{video.mp4,video.webm,poster.jpg}`), matching the pre-wipe dev state. Real trailer would need Rutube download or switching the app to embed Rutube. |
| `workers` bucket | empty (worker photos) — author photos done; team-member photos sparse on chtivo |
| `subscriptions` + `gift-cards` buckets | ✅ **done** — buckets recreated (public), 3 + 3 images uploaded (filenames already matched the DB columns), subscription blurs backfilled |
| `avatars` bucket | empty — user-uploaded profile avatars, no source to restore (expected empty in dev) |
| `digital-files` bucket | ✅ **done** — created the 3 category placeholders `getDownloadUrl` falls back to (`placeholders/{ebook.pdf,book2.pdf,audiobook.mp3}`), signed-URL verified. `scripts/seed-placeholder-pdf.mjs` rewritten to be the reproducible source — self-contained (embedded base64 PDF/MP3), seeds the 3 `placeholders/` keys; re-runnable. |
| Edition demo files | ✅ **done** — 34 editions: demo zips downloaded, extracted (own sample, not cross-promo), stored as `demos/<slug>/demo.{epub,mp3}`, `demo_path` set. Pending: 5 **shared/mislabeled** source zips (`kotlovan`, `svehderzhava`, `DoctorSaxDemo`, `BogImyaDemo`, `Frieda-and-Gitta`) skipped to avoid wrong attachments + 1 source 404 (`unhappened`) — attach manually if wanted |

A couple of source files 404 on the live site: `murlo/04.jpg`, `nikolay-staroobryadtsev.jpg`.

---

## S1 ✅ RESOLVED (2026-06-09) — `.env` was never committed

Checked all of git history: `git log --all -- ':(literal).env'` is **empty**; the
only env file ever committed is `.env.example` (empty placeholders, no values), and
a scan of history for key literals (service-role JWT / `sk-` / bot tokens) found
**nothing**. `.env` is gitignored and exists only locally. **No credentials were
exposed via git → no rotation required.** (Standard hygiene still applies if `.env`
is ever shared out-of-band.)

---

## G2 — Email delivery not implemented

`resend` and `@react-email/components` are installed but no templates or sending
logic exist. Order confirmation, password reset, and admin notification emails
are all stubbed.

**Dependencies:** Brevo API key (see S1).

---

## ✅ RESOLVED (2026-06-09) — Unused Radix packages removed

Removed the 8 Radix packages with zero `src/` imports (`accordion`, `icons`, `label`,
`scroll-area` — superseded by OverlayScrollbars — `slot`, `switch`, `tabs`, `tooltip`).
Remaining Radix deps are all in use: `checkbox`, `dialog`, `dropdown-menu`, `popover`,
`select`, `toast`. `tsc` clean, 0 vulnerabilities, deps stay exact-pinned.

---

*Migrated from `docs/AUDIT.md` (historical audit snapshot, deleted 2026-06-06).*