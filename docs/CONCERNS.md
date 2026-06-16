# Open Concerns

Tracked issues that are not part of an active plan but haven't been resolved.

**Last reviewed:** 2026-06-13.

---

## D1 ✅ RESOLVED (2026-06-09) — repo now reproduces the DB from a consolidated baseline

**Fixed by squashing to a single baseline.** The 57 drifted migrations could no longer
replay (renamed types, duplicate seed keys, function-signature changes). They are now
archived in `supabase/migrations_archive/` (kept for reference) and replaced by one
baseline generated from the live DB:

- `supabase/migrations/20260101000000_baseline_schema.sql` — full public schema
  (tables, enums, functions, RLS) + `pg_trgm` + the 16 storage buckets + 17
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

**Follow-up (2026-06-09, post-consolidation verify):** the consolidation dropped one
function — `admin_set_order_fulfillment` (defined in archived
`20260603160000_order_tracking_and_audit.sql`, called by
`src/lib/admin/orders/actions.ts`). The migration's *columns* (`tracking_number`,
`tracking_carrier`, `admin_note`) and `AdminAuditLog` table survived, but the function
did not, so the admin "set order fulfillment" action was hitting a missing RPC. Caught
by regenerating `src/types/supabase.ts` from the live DB (it had gone stale — also
missing `Ebooks/Audiobooks/CardBooks/PrintedBooks.{sold,demo_path}` and the `Orders`
legacy columns) and running `tsc`. The function is **restored** to the live DB and
folded into the baseline; types regenerated; `tsc`/lint/`npm run build` all green.
No other functions were lost (full diff of the old vs. live function list = just this one).

Note on the `Orders` flat-address columns (`full_name, phone, email, city, address,
postal_code, comment`): these are **intentional and retained** — NOT to be dropped.
An earlier D1 note mislabeled them "stale legacy … should be dropped"; that was wrong.
They are still wired (`create_pending_order` writes `email`; `email` is referenced
across the orders code) and the schema is meant to carry them. They stay in both the
live DB and the baseline.

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
   RLS-enabled-with-zero-policies**. (Earlier revisions of this note called the
   `Orders` flat-address columns `full_name`/`email`/`address`/… "stale, drop them";
   that is **wrong** — they are intentional and kept. See the 2026-06-09 follow-up above.)

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
| `Articles` table + `articles` bucket | ✅ **МРД restored as artifacts (2026-06-11)** — generated 72 stories for «Могучий Русский Динозавр» №1–6 from the supplied PDF/EPUB sources, with one lead illustration per story under `articles/mrdN/`, issue covers under `covers/mrd-N.jpg`, and real e-book files under `digital-files/ebook/mrd-N.*`. Reproducible via `scripts/extract-mrd-issues.mjs` → `supabase/seed-articles-mrdN.sql`, `supabase/seed-mrdN.sql`, `supabase/seed-mrd-workers.sql`, plus `storage-assets/` and `scripts/upload-storage-assets-to-supabase.mjs`. Applied (fresh backup first) + folded into `seed.sql`; storage objects uploaded. All six issues verified live on `/books/moguchij-russkij-dinozavr` — 12 stories + 12 author links each, an e-book edition for every issue, and the print edition for №5. |
| `TitleSimilarTitles` | ✅ **done** — mined "Познайте также" from book-page footers: 184 links across 62 books (`get_similar_books` verified) |
| `BookContexts` | ✅ **done (2026-06-10)** — re-scraped the "Дополнительные материалы" section from every `chtivo.spb.ru/book-*.html` page via `scripts/scrape-contexts.mjs` → `supabase/seed-contexts.sql`: 27 context items across 13 books (white-flower, amystis, doctor-sax, …). Applied + folded into `seed.sql`; surfaced by `get_catalog_book_by_slug`. |
| `PromoCodes` | ✅ **done** — re-seeded 5 fixtures via `supabase/seed-promo-codes.sql` (SUMMER25/FREECART/WHITE30/AUDIO50/OLDCODE); apply/expired/not-found paths verified |
| `partners` bucket | ✅ **logos done (2026-06-09)** — all 7 transparent logos (Ночлежка, Смена, Порядок слов, Фаренгейт 451, Ахули, Дискурс, Подписные издания) extracted from Figma (node 1306:8039), background stripped so the frosted carousel tile shows through, uploaded to `partners/` (`<slug>.png`). Reproducible via `public/partners/` + `scripts/upload-partners-to-supabase.mjs` + `supabase/seed-partners.sql`; regenerated into `seed.sql`. Both Partners and Team are now editable in the admin panel (`/admin/partners`, `/admin/team`). |
| `booktrailers` bucket | ✅ **done (real trailer, 2026-06-09)** — the user supplied the real white-flower trailer; placeholders replaced by `booktrailers/white-flower/{video.mp4 (27.4 MB, h264/aac 1080p), video.webm (14.4 MB, VP9/Opus — reencoded ~47% smaller at the same quality), poster.jpg (Chtivo intro splash)}`. `Booktrailers.has_poster=true`; component serves WebM-first, MP4 fallback. Storage is not in git → if a wipe ever happens, re-upload from the source MP4 + re-run the VP9 encode (`ffmpeg -c:v libvpx-vp9 -crf 32 -b:v 0 -c:a libopus -b:a 96k`). |
| `workers` bucket | ✅ **team photos done (2026-06-09)** — the real About-page "Мы" roster (11 members with photos) was extracted from Figma (node `4069:6807`) and uploaded to the `workers` bucket (`<slug>.jpg`). The 6 placeholder team rows were replaced via `supabase/seed-team.sql` (reproducible: `public/workers/` + `scripts/upload-workers-to-supabase.mjs`); regenerated into `seed.sql`. The 5 Figma cards with no photo were excluded. Photos are stored in color and rendered grayscale→color-on-hover by `TeamMemberCard`. Book-contributor worker photos (non-team) remain sparse. |
| `subscriptions` + `gift-cards` buckets | ✅ **done** — buckets recreated (public), 3 + 3 images uploaded (filenames already matched the DB columns), subscription blurs backfilled |
| `avatars` bucket | empty — user-uploaded profile avatars, no source to restore (expected empty in dev) |
| `videos` bucket (`about/chtivo.mp4`) | ✅ **done (2026-06-09)** — the about-page hero video (`getVideoUrl('about/chtivo.mp4')` in `about/page.tsx`) was missing post-wipe and the local copy had been deleted. Recovered the 65 MB master from git history (`git show 35a7282:public/videos/chtivo.mp4`), raised the `videos` bucket limit 50 MB → 80 MB (`83886080`, folded into the baseline), re-uploaded via `scripts/upload-about-video.mjs`. Source stays durable in git history; storage is not in git → on a wipe, re-recover from `35a7282` + re-run the upload script. The other 4 local `public/videos/*.mp4` are bundled assets, not storage-served. |
| `digital-files` bucket | ✅ **done** — created the 3 category placeholders `getDownloadUrl` falls back to (`placeholders/{ebook.pdf,book2.pdf,audiobook.mp3}`), signed-URL verified. `scripts/seed-placeholder-pdf.mjs` rewritten to be the reproducible source — self-contained (embedded base64 PDF/MP3), seeds the 3 `placeholders/` keys; re-runnable. |
| Edition demo files | ✅ **done** — 34 editions: demo zips downloaded, extracted (own sample, not cross-promo), stored as `demos/<slug>/demo.{epub,mp3}`, `demo_path` set. Pending: 5 **shared/mislabeled** source zips (`kotlovan`, `svehderzhava`, `DoctorSaxDemo`, `BogImyaDemo`, `Frieda-and-Gitta`) skipped to avoid wrong attachments + 1 source 404 (`unhappened`) — attach manually if wanted |

One source file still 404s on the live site: `murlo/04.jpg`. (The author photo
previously listed as a 404 — Николай Старообрядцев, white-flower — was **resolved**
2026-06-09: the scrape looked for `nikolay-staroobryadtsev.jpg` but the real source is
`assets/img/author_staroobryadcev.jpg`. Downloaded, uploaded to `authors/`,
`Authors.photo` repointed, blur backfilled.)

---

## S1 ✅ RESOLVED (2026-06-09) — `.env` was never committed

Checked all of git history: `git log --all -- ':(literal).env'` is **empty**; the
only env file ever committed is `.env.example` (empty placeholders, no values), and
a scan of history for key literals (service-role JWT / `sk-` / bot tokens) found
**nothing**. `.env` is gitignored and exists only locally. **No credentials were
exposed via git → no rotation required.** (Standard hygiene still applies if `.env`
is ever shared out-of-band.)

---

## ✅ RESOLVED (2026-06-09) — `npm run build` broke under Next 16.2.6 (Turbopack default)

The Next bump to 16.2.6 (commit `95918bf`) made Turbopack the default builder. The
SVGR loader in `next.config.ts` is a `webpack`-only config, so `next build` errored
(`webpack config and no turbopack config`). The `dev` script had already been updated
to `next dev --webpack` but `build` was missed. Fixed by pinning `build` to
`next build --webpack` (matches `dev`, preserves the exact SVGR behavior). A proper
Turbopack migration of the SVGR loader is the longer-term alternative.

---

## ✅ RESOLVED (2026-06-09) — Awards: real catalog, storage, admin section

- 13 real award badges uploaded to a new public `awards` bucket; catalog reseeded
  (Книга года 2019–2026, Лицей 2022/2024, лонг-листы). `Awards.image` holds a bare
  filename → `getAwardUrl()`; the book page renders the SVG via `<Image unoptimized>`.
- Admin `/admin/awards` (list + new + edit, audit-logged, image upload) ships the
  catalog management.
- The 7 fabricated placeholder awards (and their ~40 random book links) were deleted
  by the user via the admin UI; white-flower is linked to the real «Книга года 2019».
  No legacy `/awards/...` paths or orphaned `Titles_Awards` remain.
- **Reproducibility (2026-06-09 follow-up):** the `awards` bucket is now folded into
  the baseline (`20260101000000_baseline_schema.sql`) and the 13 `Awards` rows +
  `Titles_Awards` link are in the regenerated `seed.sql`, so a from-scratch
  `baseline + seed.sql` reproduces the catalog and the bucket. **Only the SVG storage
  *objects* remain runtime state** (as with all storage) — re-upload them on a rebuild.
  12 of 13 SVGs are committed under `public/awards/` (missing `award_liceum_2024.svg`);
  source set is `repos/awardGen/`.

---

## ✅ NEW (2026-06-10) — Periodicals (multi-issue book series)

«Могучий Русский Динозавр» (and any future series) is now modelled as a **periodical**:
each issue is its own `Title` (own cover, editions, authors, stories) grouped under a
`Periodicals` row, shown together on one shared page.

- **Schema** (`supabase/migrations/20260610120000_periodicals.sql`, on top of the baseline):
  `Periodicals` table + `Titles.periodical_id/volume_number/volume_year` +
  `Articles.title_id` (stories belong to an issue; the issue's authors derive from them).
- **Page**: `/books/<periodical-slug>` renders every issue as a `#vol-N` section (cover,
  Том №N · year, print + Book2.0 buy-boxes, Содержание → `/dino-magazine/*`, Авторы).
  Catalog cards for issues link to the anchor (`getBooks` → `Book.periodicalHref`);
  an issue slug (`mrd-6`, `mrd-5`) redirects to the periodical anchor.
- **Data**: МРД6 retrofitted (`seed-periodicals.sql`); МРД5 imported from the supplied
  EPUB (`scripts/extract-mrd-articles.mjs` → `seed-articles-mrd5.sql`, `seed-mrd5.sql`,
  cover `covers/mrd-5.jpg`, editions mirror МРД6: print + Book2.0, 600 ₽). Both folded
  into `seed.sql`. Covers/article images are storage (re-upload on a rebuild via the
  `upload-*` scripts), as with all storage.
- **Admin**: `/admin/periodicals` (create/edit/delete a series, list issues) + a
  «Периодика» fieldset on the book editor (series + volume + year).
- Open polish (non-blocking): МРД6 has no description; one legacy author row lingers on
  МРД6 (13 vs 12 story authors); МРД5/6 digital edition is a Book2.0, no separate EBook.

---

## G2 🟡 Email delivery — implemented + live-tested, pending prod cutover

Built out via the Resend email system (see [docs/plans/email-system.md](plans/email-system.md)):
auth confirmation + password reset (Supabase Send-Email hook → React Email → Resend),
order confirmation, admin story-submission notification, and a double-opt-in mailing list
with Resend Audience sync. **All of P0–P6 were live-tested end-to-end on 2026-06-13** against
the verified `mildfire.dev` domain (delivered to real inboxes, not test mode) and the Resend
Audience. The two follow-up migrations are applied, types regenerated, Supabase restarted.
`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_AUDIENCE_ID`, `SEND_EMAIL_HOOK_SECRET`,
`ADMIN_NOTIFICATIONS_EMAIL` are all set. **T1** (verified domain) and **T2** (Audience) are
done in dev.

Live testing fixed a launch-blocking bug: the Send-Email hook sent to the empty `user.email`
on the `email_change` (anon→account) path, 500-ing every registration — now sends to
`new_email` (commit 274694e8).

**Still outstanding (production only):**
- Set `NEXT_PUBLIC_BASE_URL` to the prod origin (email/confirm/unsubscribe links default to
  `http://localhost:3000`).
- Point the auth hook `uri` at the live origin and set `SEND_EMAIL_HOOK_SECRET` in prod.
- Re-verify the sending domain / re-create the Audience under the prod Resend account if
  different from the current one.

---

## ✅ RESOLVED (2026-06-09) — Unused Radix packages removed

Removed the 8 Radix packages with zero `src/` imports (`accordion`, `icons`, `label`,
`scroll-area` — superseded by OverlayScrollbars — `slot`, `switch`, `tabs`, `tooltip`).
Remaining Radix deps are all in use: `checkbox`, `dialog`, `dropdown-menu`, `popover`,
`select`, `toast`. `tsc` clean, 0 vulnerabilities, deps stay exact-pinned.

---

## P1 🟠 Pre-launch auth ops (carried over from the now-deleted auth-flow plan)

The anon→OAuth/email migration flow is **implemented and shipped** (`migrate_anonymous_user`
RPC, `GET /api/auth/google`, `tokens-only` cookie encoding). These deployment/ops items
remain **outstanding** and are environment config, not repo state — they only matter once
the VPS goes live:

- **Prod Google OAuth client** — create the prod OAuth client + redirect URIs, set the
  prod env vars; the Supabase Auth Google provider must point at them.
- **Reverse-proxy `/auth/v1/*` routing + HTTPS end-to-end** — the proxy must forward Supabase
  Auth routes to the Supabase container; OAuth requires HTTPS throughout.
- **Anon-row garbage collection** — no `pg_cron` job exists to reap stale anonymous
  `auth.users` rows. (Note: `expire_stale_pending_orders` reaps *orders*, not anon users —
  unrelated.) Without it, abandoned anon sessions accumulate.
- **Future (not started):** provider generalization (Google is wired + live in prod; Yandex/VK/Telegram
  still show a "Скоро" hint). **Yandex login has a detailed, resumable implementation plan +
  tracker: [docs/plans/yandex-oauth.md](plans/yandex-oauth.md)** (custom app-level OAuth — Yandex
  isn't a GoTrue-native provider; VK reuses the pattern, Telegram is a separate widget flow).
  Also future: an add-a-provider UX, a `Profiles.first_seen_at` audit column, and field-level
  profile merge on migration.

---

## P2 🟠 Payments — go-live + intentionally-stubbed pieces (carried over from the now-deleted robokassa plan)

The two-phase checkout + Robokassa integration is **implemented and shipped** behind
`PAYMENT_PROVIDER` (defaults to `mock`; the in-app mock gateway is fully interactive). The
following are intentionally out of scope / stubbed and remain **outstanding** for production:

- **Flip `PAYMENT_PROVIDER` → `robokassa`** and supply real PSP credentials (merchant login +
  passwords) via env; the signature/recurring logic is ready (`src/lib/payments/robokassa/`).
- **Real fiscalization receipt** — `RobokassaReceipt` is a type-only stub (`receipt.ts` returns
  `undefined`); a real 54-ФЗ payload is needed for live fiscalization.
- **Real cron infrastructure** — the recurring-charge route
  (`src/app/api/payments/robokassa/cron/route.ts`) exists and is `x-cron-secret`-guarded, but
  no scheduler is wired to call it on a cadence.
- **Not built (deferred):** saved-card UI, multi-currency, two-stage (hold/capture) flows.
- Real SMTP for order/payment emails is tracked separately under **G2** above.

---

*Migrated from `docs/AUDIT.md` (historical audit snapshot, deleted 2026-06-06).*
