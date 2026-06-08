# Open Concerns

Tracked issues that are not part of an active plan but haven't been resolved.

**Last reviewed:** 2026-06-08.

---

## D1 🔴 Repo cannot rebuild the database — no authoritative schema source of truth

`supabase/seed.sql` + `supabase/migrations/` **cannot reconstruct the database from
scratch.** Several core tables have **no `CREATE TABLE` anywhere in the repo** — they
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
| `booktrailers` bucket | empty — 1 `Booktrailers` row but no video/poster objects |
| `partners` bucket | empty (7 `Partners` rows reference logos) |
| `workers` bucket | empty (worker photos) |
| `subscriptions` / gift-card / `avatars` buckets | empty |
| `digital-files` bucket | ✅ **done** — created the 3 category placeholders `getDownloadUrl` falls back to (`placeholders/{ebook.pdf,book2.pdf,audiobook.mp3}`), signed-URL verified. NB: `scripts/seed-placeholder-pdf.mjs` is **stale** — it writes `ebooks/50.pdf`, not the `placeholders/` keys the code uses; update it to be the reproducible source |
| Edition demo files | ✅ **done** — 34 editions: demo zips downloaded, extracted (own sample, not cross-promo), stored as `demos/<slug>/demo.{epub,mp3}`, `demo_path` set. Pending: 5 **shared/mislabeled** source zips (`kotlovan`, `svehderzhava`, `DoctorSaxDemo`, `BogImyaDemo`, `Frieda-and-Gitta`) skipped to avoid wrong attachments + 1 source 404 (`unhappened`) — attach manually if wanted |

A couple of source files 404 on the live site: `murlo/04.jpg`, `nikolay-staroobryadtsev.jpg`.

---

## S1 🔴 Production credentials in `.env` git history

`.env` is gitignored, but credentials may have been committed before it was added.
Check `git log --all -- .env` to confirm.

**Keys that may need rotation:**

| Variable | Sensitivity |
|----------|------------|
| `SUPABASE_SERVICE_ROLE_KEY` | **Maximum** — bypasses all RLS |
| `BREVO_APIKEY` | High — email delivery service |
| `TELEGRAM_BOT_APIKEY` | High — Telegram bot token |
| `ROBOPASS_ONE` / `ROBOPASS_TWO` | High — Robokassa payment passwords |

**Action:** Rotate all credentials in their respective dashboards if any were ever
committed to git.

---

## G2 — Email delivery not implemented

`resend` and `@react-email/components` are installed but no templates or sending
logic exist. Order confirmation, password reset, and admin notification emails
are all stubbed.

**Dependencies:** Brevo API key (see S1).

---

## Unused Radix packages

The following Radix packages are installed but have no component consuming them.
They were pre-installed for future use — keep or remove as needed:

- `@radix-ui/react-accordion`
- `@radix-ui/react-switch`
- `@radix-ui/react-tabs`
- `@radix-ui/react-tooltip`
- `@radix-ui/react-label`

---

*Migrated from `docs/AUDIT.md` (historical audit snapshot, deleted 2026-06-06).*