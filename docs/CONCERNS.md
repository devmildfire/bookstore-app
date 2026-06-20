# Open Concerns

Tracked issues that are not part of an active plan but haven't been resolved.

**Last reviewed:** 2026-06-16.

> **Production went live 2026-06-15** (`bookstore-app.mildfire.dev` + `api.mildfire.dev` via
> Cloudflare Tunnel). Deployment status — including which launch-gate items are still
> unverified in prod — is tracked in [docs/deployment/TRACKER.md](deployment/TRACKER.md), the
> authoritative source. Where this file and the TRACKER disagree, the TRACKER wins; the
> prod-cutover notes in G2/P1/P2 below are reconciled against it.

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

## FE1 🟡 Frontend rendering strategy — audit done, phased plan pending

A four-part audit (client/server boundary, PPR feasibility, data-fetching, perf) found the
storefront fundamentally sound (server pages, correct prefetch/hydrate, fonts + LCP images
right) but with clear wins: the **`(site)` layout reads cookies in render → forces the whole
storefront dynamic** (keystone blocker), **no `generateStaticParams`** (book pages never
prebuilt), a **duplicate `get_catalog_book_by_slug` RPC** per book render, **no `cache()`/
`revalidate`** in the read path, **card-fusion** components that should split into server body
+ client leaf (BookCard first), missing **Suspense/`loading.tsx`**, and SEO gaps
(`metadataBase`, `sitemap.ts`/`robots.ts`). PPR in Next 16.2.6 = `cacheComponents:true`
(`experimental.ppr` throws) — a project-wide migration, sequenced last. Full findings + phased
plan + tracker: [docs/plans/frontend-architecture-rendering.md](plans/frontend-architecture-rendering.md).

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

## S2 🟡 Git history contained a leaked DB credential — scrubbed locally + pushed to `update-scrubbed`; 7 branches still need force-push on GitHub

`README.md` carried a hardcoded Supabase Postgres connection string with the **live DB
password and VPS IP** (`postgresql://postgres:x8Hfa…@<vps-ip>:5432/...`) from
2024-11-13 (commit `58d9a8ac`, "Workers Dashboard") through 2026-06-20. The password is
the production Postgres credential — it lives only in the VPS `.env` on a separate
machine, prod Postgres has no public port (docker-network-only), and the repo anon key
is public-by-design. S1 still holds (`.env` was never committed); the leak was the
README only. Note: the credential was **not rotated** — see the rotation note below.

**Done 2026-06-20:**
- Removed the credential from `README.md` on disk (the stale block → a pointer to
  `AGENTS.md`) — commit `8d60940c` on `update`.
- Rewrote all of git history with `git filter-branch --index-filter` (replaced the
  password + IP in every `README.md`/`AGENTS.md` blob across all 2095 commits, all
  refs). Verified clean: no blob reachable from any rewritten branch contains `x8Hfa`
  (pickaxe + full blob scan both empty). `main` and `develop` never contained it
  (their SHAs are unchanged).
- Full mirror backup taken first → `/tmp/opencode/bookstore-app-backup-20260620-235314.git`
  (all refs, 23292 objects); plus filter-branch's `refs/original/*` safety refs locally.
- Pushed the scrubbed history to a **new branch `update-scrubbed`** (`0168c8bb`) — a
  plain push (no force, no deploy trigger). `origin/update-scrubbed` verified clean.

**Still pending — force-push to overwrite the leaky history on GitHub.** 7 branches on
GitHub still carry the password in their history (local rewrite not pushed to them yet):

| Branch | GitHub SHA (leaky) | Scrubbed SHA | Force-push impact |
|--------|-------------------|--------------|-------------------|
| `update` | `a47443a6…` | `0168c8bb…` | CI lint/build only |
| `production` | `32c297cb…` | `2bebaff6…` | **triggers `deploy-production.yml`** (GHCR rebuild + VPS `app` restart) |
| `feat/asymmetric-jwt-keys` | `d8449247…` | `da31d207…` | none (feature branch) |
| `feat/ppr-phase0-layout` | `f938b06a…` | `61713985…` | none |
| `feat/ppr-phase2-book-ssg` | `82131dac…` | `223352cd…` | none |
| `feature/Workers` | `58d9a8ac…` | `eeee978a…` | none |
| `feature/giveAdmin` | `2de1e80f…` | `c7010368…` | none |

The 6 non-`production` branches are safe to force-push anytime. `production` is the
only one with a side effect; the redeploy image content is **identical to the current
deploy** (only `README.md`/`AGENTS.md` changed — no app/deploy files), so the restart
is safe-but-real (~seconds). Options for `production`: (a) force-push directly and
accept the rebuild; (b) temporarily disable `deploy-production.yml` on GitHub, force-push
`production` (no redeploy), re-enable the workflow.

**Password rotation:** not done. The credential lives only in the VPS `.env` (separate
machine), prod Postgres is private-network-only, and the repo anon key is public-by-design.
Rotation is **optional once the force-push completes**; do rotate if the pre-scrub
GitHub history was cloned/forked externally before the overwrite.

**Undo path:** `refs/original/*` (local) + the mirror backup at
`/tmp/opencode/bookstore-app-backup-20260620-235314.git`. To restore a branch to its
pre-rewrite SHA: `git branch -f <branch> refs/original/refs/…/<branch>` then push.

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

**Production config — verified present on the VPS (2026-06-16):**
- ✅ `NEXT_PUBLIC_BASE_URL=https://bookstore-app.mildfire.dev` (no longer localhost).
- ✅ `SEND_EMAIL_HOOK_SECRET` set; `RESEND_API_KEY` set; `RESEND_FROM_EMAIL=Chtivo <no-reply@mildfire.dev>`;
  `ADMIN_NOTIFICATIONS_EMAIL=admin@mildfire.dev`. The auth hook `uri` derives from
  `NEXT_PUBLIC_BASE_URL` (now prod).

**Still to confirm functionally in prod:** an actual outbound email has not been sent from the
live stack (auth confirmation, order confirmation, newsletter) — config is in place but the
end-to-end send + the prod Resend Audience/domain verification haven't been exercised live.

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

- **Prod Google OAuth client** — ✅ **config present (verified 2026-06-16):** prod `.env` has
  `GOOGLE_ENABLED=true` + `GOOGLE_CLIENT_ID`/`GOOGLE_SECRET` set. Still to confirm functionally:
  the actual OAuth round-trip (consent → callback → session) against the live redirect URIs.
- ~~**Reverse-proxy `/auth/v1/*` routing + HTTPS end-to-end**~~ ✅ **done (2026-06-15)** — Kong +
  nginx behind the Cloudflare Tunnel forward `/auth/v1/*` to GoTrue; HTTPS is end-to-end
  (`/auth/v1/health` 200, browser anonymous sign-in verified). The remaining auth items below
  (prod Google client, anon GC) are still outstanding.
- **Anon-row garbage collection** — ✅ **done (2026-06-16).** `public.gc_stale_anonymous_users(p_days)`
  + a daily `pg_cron` job `gc-stale-anonymous-users` (`30 3 * * *`) reap anonymous `auth.users`
  with **no sign of life for 35 days** (freshest of created_at / last_sign_in_at / updated_at /
  any session's updated_at|refreshed_at — sessions bump on every proxy token-refresh, i.e. every
  visit). A visitor who returns even monthly keeps a fresh session and is retained; 35 days (not
  30) guarantees a calendar-month gap is never clipped. Migration:
  `supabase/migrations/20260616120000_gc_stale_anonymous_users.sql`; applied to prod as
  `supabase_admin` (fresh backup taken first), grants locked (anon/authenticated cannot execute),
  dry-run + one live run both returned 0 (all current anon rows are fresh).
  Caveat: retention is also bounded by GoTrue's session/refresh-token settings — the 35-day GC
  assumes the anon refresh token still works (GoTrue default: refresh tokens have no hard TTL, so
  a returning visitor refreshes fine). If a session inactivity timeout is ever configured below
  35 days, lower `p_days` to match.
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

- **`PAYMENT_PROVIDER=mock` in prod is intentional, not a gap (confirmed 2026-06-16).** This
  deployment is a **portfolio** — it exists to demonstrate a battle-tested, working,
  fully-explainable codebase, not to take money. The in-app mock gateway is the *chosen*
  production config and is fully interactive end-to-end. The Robokassa path stays wired and
  ready (`src/lib/payments/robokassa/`) — flip `PAYMENT_PROVIDER` + supply real PSP creds *if*
  real payments are ever wanted. **This is not a launch blocker.**
- **Real fiscalization receipt** — `RobokassaReceipt` is a type-only stub (`receipt.ts` returns
  `undefined`); a real 54-ФЗ payload is needed for live fiscalization.
- **Real cron infrastructure** — the recurring-charge route
  (`src/app/api/payments/robokassa/cron/route.ts`) exists and is `x-cron-secret`-guarded, but
  no scheduler is wired to call it on a cadence.
- **Not built (deferred):** saved-card UI, multi-currency, two-stage (hold/capture) flows.
- Real SMTP for order/payment emails is tracked separately under **G2** above.

---

## PERF1 🟡 Hero LCP-image preload may not match the rendered `srcSet` candidate (wasted preload)

Observed 2026-06-20 in a Firefox console on the live home (phone resolution): the LCP cover
preload was flagged *"preloaded with link preload was not used within a few seconds"* —
specifically `/_next/image?url=…murlo.jpg&w=320`. If the rendered `<img>` actually picks a
different `srcSet` candidate than the preloaded width on a given viewport/DPR, then **the LCP
preload is wasted and the real LCP image isn't the preloaded one** — so the preload buys no LCP
benefit (and costs a redundant fetch competing on Slow-4G).

- The hero cover uses `next/image` `priority` + `fetchPriority="high"` with
  `sizes="(max-width: 532px) 230px, (max-width: 767px) 240px, (max-width: 1200px) 260px, 355px"`
  and a custom `imageSizes` that includes `320` (`next.config.ts`). The preload emitted `w=320`,
  but the **rendered** width depends on the live viewport × DPR — verify they agree on the PSI
  mobile profile (412 px @ DPR 1.75) and at the resolution where the warning appeared.
- **To investigate:** load the home at the target viewport, read the cover `<img>.currentSrc`
  width, and compare to the `<link rel=preload>` href width. If they differ, align `sizes` /
  `imageSizes` so the preload matches the chosen candidate. (See `SliderSlide.tsx` + the
  "improve image delivery" work in `docs/perf/`.)
- **Also noise, lower priority:** many CSS + woff2 `preload`-not-used warnings. Largely a
  side-effect of `experimental.cssChunking: false` (many small per-module CSS files, some for
  deferred/below-fold modules) plus Next's route prefetch. Mostly benign; revisit only if it
  proves to cost real bandwidth in the LCP window.

---

*Migrated from `docs/AUDIT.md` (historical audit snapshot, deleted 2026-06-06).*
