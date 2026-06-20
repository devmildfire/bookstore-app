# Open Concerns

Tracked issues that are not part of an active plan but haven't been resolved.

**Last reviewed:** 2026-06-20.

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
(`metadataBase`, `sitemap.ts`/`robots.ts`). PPR in Next 16.2.9 = `cacheComponents:true`
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

## CA — Code audit (2026-06-21): convention compliance + code smells

A full-codebase audit against the convention docs (`docs/conventions/*.md`) plus a scan
for antipatterns, code smells, redundant complexity, and coding mistakes. Findings are
grouped by severity and each item is independently assessable + fixable. **Nothing below
is a launch blocker** — the app runs, the money path works, RLS is enforced. These are
maintainability/readability/consistency items.

**Method:** grep + glob + graph (code-review-graph SQLite at `.code-review-graph/graph.db`,
1980 nodes / 12079 edges / 738 files) + targeted file reads. Every finding cites the
convention it violates and the file(s) involved.

### What passed clean (no issues)

- **No `any` usage** in any `.ts/.tsx` file — `TYPESCRIPT.md` `any` policy holds. ✅
- **No `enum` usage** — all use `const` object + `typeof` union per `TYPESCRIPT.md`. ✅
- **No `console.log`/`debug`/`info`** — `CODE_STYLE.md` rule holds (21 `console.error`/`warn`, allowed for error logging). ✅
- **No `dangerouslySetInnerHTML`** — `CODE_STYLE.md` rule holds. ✅
- **No class components** — `CODE_STYLE.md` rule holds. ✅
- **No `@ts-ignore`/`@ts-expect-error`** — no suppressed type errors. ✅
- **No `TODO`/`FIXME`/`HACK`/`XXX`** — no outstanding inline markers. ✅
- **No `@import` in SCSS** — all use `@use`/`@forward` per `SCSS.md`. ✅
- **No direct Supabase calls in components** — `DATA.md` boundary holds (all go through `src/api/*`). ✅
- **No `'use client'` in layout files** — layouts are Server Components per `COMPONENTS.md`. ✅
- **All Server Actions use `return { error }` pattern** — `ERROR_HANDLING.md` rule holds (no throws to client). ✅
- **No `<Image>` without `alt`** — `SEO.md` accessibility rule holds. ✅
- **No `@supabase/realtime-js` usage** — correctly stubbed via `next.config.ts` alias. ✅
- **No dead code** — graph analysis finds no unreferenced exported functions (the 17 "no edge" hits are all entry points: `error.tsx`/`loading.tsx`/`robots.ts` exports, JSX-imported components, or the intentional devtools stub). ✅
- **The `{...props}` spreads are typed/whitelisted** — `icons/index.tsx` uses `SVGProps<SVGSVGElement>`, `Button.tsx` destructs custom props before spreading rest. Per `CODE_STYLE.md` "whitelist props explicitly" — acceptable. ✅
- **The 11 `.catch(() => {})` on storage cleanup** are explicitly allowed by `data-architecture-fix-plan.md` §5.2 ("Leave the deliberate best-effort `.catch(() => {})` storage-cleanup calls as-is"). ✅
- **Dependencies are exact-pinned** — `CODE_STYLE.md` rule holds (no `^`/`~`/`latest` in `package.json`). ✅

---

### CA1 🟠 69 route segments with NO `loading.tsx` AND NO `error.tsx` (HIGH)

**Convention violated:** `ERROR_HANDLING.md` — "Every route segment that performs async
data fetching should have a co-located `error.tsx`" + "Every route that fetches data
should have a `loading.tsx`".

**Finding:** 69 of 72 `page.tsx` files have **neither** a co-located `loading.tsx` **nor**
an `error.tsx`. Only 3 routes have error boundaries: `src/app/(site)/books/[slug]/error.tsx`
and `src/app/admin/(panel)/error.tsx` exist. No route-segment-level `loading.tsx` exists
except the catalog's `(catalog)/loading.tsx` and `books/[slug]/loading.tsx`.

**Impact:** A Supabase timeout or RPC error on any of these 69 routes renders a blank
page or an unformatted server error — no skeleton, no retry UI. The `error.tsx` gap is
the more serious half: without an error boundary, a fetch failure in a Server Component
crashes the **entire route tree** up to the nearest boundary (which, for most routes, is
the root `app/error.tsx` — which also doesn't exist).

**Files affected:** every `page.tsx` under `src/app/(site)/` (except `books/[slug]/`) +
every `page.tsx` under `src/app/admin/(panel)/` (except the shared `error.tsx`). Full
list in the audit output. Key high-traffic routes missing both: `/` (home), `/about`,
`/cart`, `/checkout`, `/profile/*`, `/authors/[id]`, `/dino-magazine/*`, all admin
sections (`/admin/books`, `/admin/orders`, `/admin/articles`, …).

**Proposed fix:** Add `error.tsx` (Client Component, `'use client'`, with a Russian
"Не удалось загрузить страницу" + retry button) to each route group that doesn't have
one — at minimum: `src/app/(site)/error.tsx` (storefront-wide), `src/app/admin/(panel)/error.tsx`
(already exists). Then add `loading.tsx` skeletons to the high-traffic routes (home,
catalog, book detail, profile, admin list pages). The route-group-level `error.tsx`
covers all child routes, so 2-3 files fix the storefront + admin gaps; per-route
`loading.tsx` is the larger effort.

---

### CA2 🟠 25 `as unknown as` type casts without narrowing (HIGH)

**Convention violated:** `TYPESCRIPT.md` — "Use `unknown` at unsafe boundaries, then
narrow" + "Never use `any` in new code". The `as unknown as T` pattern is a double-cast
that bypasses the type system without any narrowing — it's the `any` escape hatch in
disguise.

**Finding:** 25 `as unknown as` casts across 13 files. They fall into 3 categories:

1. **RPC return-type casts (8 occurrences)** — `supabase.rpc()` returns `unknown` for
   RPCs whose return type isn't in the generated types; the code casts directly to the
   row type without a runtime check:
   - `src/api/articles/getArticleBySlug.ts:33` — `data as unknown as ArticleRow`
   - `src/api/articles/getArticlesPage.ts:59` — `data as unknown as ArticleRow[]`
   - `src/api/articles/getMoreArticlesForAuthor.ts:47,69` — same pattern
   - `src/api/periodicals/getPeriodical.ts:85` — `data as unknown as StoryRow[]`
   - `src/api/likes/getLikesServer.ts:84` — `data as unknown as BoxSetRow[]`
   - `src/api/boxSets/getBoxSetBooksMap.ts:48` — `data as unknown as Row[]`
   - `src/api/admin/subscribers/index.ts:29,37` — `admin.from as unknown as …` + `data as unknown as SubscriberRow[]`

2. **JSON field casts (5 occurrences)** — casting `Record<string, unknown>` or plain
   objects to the generated `Json` type:
   - `src/lib/admin/books/actions.ts:210,243` — `blurs as unknown as Json`
   - `src/lib/admin/articles/actions.ts:54` — `[] as unknown as Json`
   - `src/lib/admin/audit.ts:49` — `metadata as unknown as Json`

3. **"Loose writer" table-access casts (12 occurrences)** — admin actions that write to
   tables/fields not fully covered by generated types, using a hand-rolled `LooseWriter`
   type to work around the type system:
   - `src/lib/admin/books/actions.ts:258,636,678,725`
   - `src/lib/admin/authors/actions.ts:26,190`
   - `src/lib/admin/boxSets/actions.ts:28,165`
   - `src/lib/admin/subscriptions/actions.ts:20`
   - `src/lib/admin/giftCards/actions.ts:19`
   - `src/lib/admin/articles/actions.ts:23`
   - `src/lib/admin/featured/actions.ts:40`

**Impact:** A schema change (column rename, type change, RPC signature change) will not
be caught by `tsc` at these call sites — the cast silences the compiler. The data-architecture
audit (F4) already flagged the RPC cast pattern and the fix-plan resolved it for the
catalog RPCs, but these 25 casts remain in non-catalog paths.

**Proposed fix:** For category 1 (RPC returns): add the RPC return types to the generated
`Database['public']['Functions']` (or a hand-curated supertype) and drop the cast. For
category 2 (JSON): use `JSON.stringify`/`JSON.parse` with a validation function or a
`zod` schema. For category 3 (loose writers): regenerate types to cover the admin
tables/fields, or add a typed wrapper. This is a medium effort (~13 files) but
high-value — it closes the last type-safety gap from the data-architecture audit.

---

### CA3 🟡 19 `select('*')` calls — DATA.md says use explicit projections (MEDIUM)

**Convention violated:** `DATA.md` — "Tighten the handful of list-feeding `select('*')`
into explicit projections" + `data-architecture-fix-plan.md` §5.2 (F10) which was marked
✅ for storefront lists but left admin single-row fetches as-is.

**Finding:** 19 `select('*')` calls remain. Breakdown:
- **Admin single-row fetches (10)** — `getAdminBook`, `getAdminOrder` (×3), `getAdminBoxSet`,
  `getAdminAuthor`, admin subscriptions, admin gift cards, admin promo codes, admin
  articles, admin subscribers, admin audit. These were intentionally left as-is in
  fix-plan §5.2 ("Left single-row admin edit fetches (`…eq('id').maybeSingle()`)… as-is").
- **Storefront/API paths (9)** — `getCart`, `cartServer`, `getBoxSets`, `getLikesServer`,
  `getOrders` (×2), `updateProfile`, `getAdminBook`. Some of these should have been
  tightened in F10 but were missed.

**Impact:** `select('*')` returns all columns, including ones the normalizer doesn't
read — larger payloads + a schema change (new column) silently inflates the wire payload.
Not a correctness bug, but a drift risk.

**Proposed fix:** Tighten the 9 storefront/API `select('*')` to explicit column lists
matching what each normalizer reads (same approach as fix-plan §5.2 used for
`getParters`/`getTeam`/`getSubscriptions`/`getGiftCardProducts`). The 10 admin
single-row fetches are lower priority (admin payload size is not a perf concern).

---

### CA4 🟡 25 barrel imports from `@/api/<domain>` instead of specific files (MEDIUM)

**Convention violated:** `docs/perf/README.md` §4 "Bundle hygiene" — "Bust barrel
imports. `@/api/<domain>` barrels re-export everything (mutations → zod, etc.), so a
barrel import drags it all into the eager chunk and defeats tree-shaking. Import query
keys / functions from their specific file, not the barrel."

**Finding:** 25 imports from `@/api/<domain>` (barrel) instead of `@/api/<domain>/specificFile`.
Examples:
- `import { getOrders, ordersQueryKey } from '@/api/orders'` (×3: MyBooksList,
  MyCoursesList, OrderHistoryList)
- `import { uploadAvatar } from '@/api/profile'` (AvatarUpload)
- `import { getBook, getSimilarBooks, getEditionPhotos, getBookEditions, getAllBookSlugs } from '@/api/books'` (book detail page)
- `import { getFeaturedBooks } from '@/api/books'` (home page)
- `import { getAuthor } from '@/api/authors'` (author page)
- Plus 18 more.

**Impact:** Each barrel import pulls the entire `index.ts` re-export graph into the
caller's chunk, including modules the caller doesn't use (e.g., importing `getBook` from
`@/api/books` also pulls `searchBooks`, `getBooks`, `getCatalogFacets`…). On the client
bundle, this is a perf regression (more bytes shipped). On the server, it's a cold-start
cost. The perf playbook says this was measured as ~5% deps, but it's still a hygiene rule.

**Proposed fix:** Mechanically replace `from '@/api/<domain>'` with
`from '@/api/<domain>/<specificFile>'` for each named import. 25 files, trivial `sed`-class
change. Verify with `npm run build` + bundle analyzer.

---

### CA5 🟡 69 hardcoded hex colors in component SCSS files (MEDIUM)

**Convention violated:** `SCSS.md` — "All design tokens live in `src/styles/params.scss`.
Use them; do not hardcode values." + "When introducing a new token, add it to
`params.scss` — never scatter literals."

**Finding:** 69 hardcoded hex color literals (`#fff`, `#000`, `#ffffff`, `#8e8e8e`,
`#b1b1b1`, `#ff6b6b`, `#1c1c1c`, `#2a1414`, `#120a0a`, `#a10202`) across ~30 component
`.module.scss` files. The worst offenders:
- `Button.module.scss` (4), `ArticleCard.module.scss` (4), `AdminSideNav.module.scss` (4)
- `ProfileSideNav.module.scss` (3), `ProfileMainPanel.module.scss` (3),
  `EmailConfirmBanner.module.scss` (3), `StorySubmitModal.module.scss` (3),
  `ArticleBody.module.scss` (3), `PartnerLogo.module.scss` (3)

Most common violations: `#fff`/`#ffffff` (should be `$color-text-title` or a semantic
token), `#000` (should be `$color-bg-deep`), `#8e8e8e` (should be a `$color-text-muted`
token). Some are in comments (referencing Figma values) — those are informational, not
violations. The `params.scss` literals themselves are correct (that IS the token file).

**Impact:** A theme change (e.g., shifting the dark palette) requires touching every
component file instead of just `params.scss`. Also makes it harder to audit contrast
ratios for WCAG compliance — the tokens in `params.scss` are the audit surface.

**Proposed fix:** Add missing semantic tokens to `params.scss` (e.g., `$color-text-on-card`,
`$color-text-muted`, `$color-overlay-dark`) and replace the 69 literals across ~30 files.
Mechanical but touches many files; batch into one commit.

---

### CA6 🟡 2 `overflow: auto` in `CatalogControls.module.scss` — should use `<Scroller>` (MEDIUM)

**Convention violated:** `SCSS.md` — "never write raw `overflow: auto` on a container.
Wrap it with `<Scroller>` instead." + `AGENTS.md` — "Custom scrollbars via `<Scroller>`.
Wrap overflow containers with `<Scroller>` from `@/components/common/Scroller` instead of
raw `overflow: auto`."

**Finding:** `src/components/book/CatalogControls/CatalogControls.module.scss:73,228`
both use `overflow: auto` — these should be wrapped with the `<Scroller>` component
instead, so they get the custom `os-theme-chtivo` scrollbar.

**Proposed fix:** Wrap the two overflow containers in `CatalogControls.tsx` with
`<Scroller>` and remove the `overflow: auto` from the SCSS. 2 lines of TSX + 2 lines of
SCSS.

---

### CA7 🟡 `src/lib/admin/books/actions.ts` is 753 lines — exceeds the ~200-line guideline (MEDIUM)

**Convention violated:** `CODE_STYLE.md` — "If a component exceeds ~200 lines of JSX +
logic, split it into smaller focused sub-components" (applies to any module, not just
components) + `COMPONENTS.md` component-size rule.

**Finding:** `src/lib/admin/books/actions.ts` is 753 lines — 3.7× the guideline. It
contains all book/edition/worker/trailer/book-photo/demo CRUD actions in one file:
`createBook`, `updateBook`, `deleteBook`, `updateProduct`, `uploadBookCover`,
`uploadBookPhotos`, `deleteBookPhoto`, `syncBookPhotoBlurs`, `uploadTrailer`,
`deleteTrailer`, `uploadDemo`, `deleteDemo`, `uploadWorkers`, `deleteWorker`, etc.

**Impact:** Hard to navigate, hard to review changes, high risk of merge conflicts.
Also concentrates all the `as unknown as LooseWriter` casts (CA2 category 3) in one file.

**Proposed fix:** Split into `src/lib/admin/books/` as a directory:
`actions.ts` (book CRUD), `editions.ts` (edition/product actions), `media.ts` (cover/
photo/trailer/demo upload + delete), `workers.ts` (worker CRUD). Each file ~150-200
lines. The `'use server'` directive goes at the top of each. Re-export from an
`index.ts` barrel if callers import by directory.

---

### CA8 🟡 `CatalogControls.tsx` is 470 lines — exceeds the ~200-line guideline (MEDIUM)

**Convention violated:** `CODE_STYLE.md` + `COMPONENTS.md` — ~200-line limit.

**Finding:** `src/components/book/CatalogControls/CatalogControls.tsx` is 470 lines.
It renders the catalog sidebar (filters + sorting + category + price range) and manages
all the URL-search-params sync + local state. Contains inline `useMemo` for filtered
authors, category labels, and multiple `useState` hooks.

**Proposed fix:** Extract sub-components: `FilterSection` (collapsible section wrapper),
`AuthorFilter` (author multi-select),`CategoryFilter`, `PriceRangeFilter`,
`SortControls`. Each ~50-80 lines. `CatalogControls` becomes the orchestrator (~100
lines) that manages URL state + composes the sub-components. Co-locate sub-components in
the same folder per `COMPONENTS.md`.

---

### CA9 🟡 1 `<img>` in `ImageUploader.tsx` — should use `next/image` (MEDIUM)

**Convention violated:** `CODE_STYLE.md` — "Use `next/image` instead of `<img>` for all
images" + `PERFORMANCE.md` — "Always use `next/image` instead of `<img>`."

**Finding:** `src/components/admin/ImageUploader/ImageUploader.tsx:60` uses
`<img src={url} alt={label ?? 'Изображение'} className={styles.svg} />` — a raw `<img>`
for the preview of an uploaded image. The `className={styles.svg}` suggests it's
rendering an SVG preview, which may be the reason `next/image` was skipped (SVGs via
`next/image` require `unoptimized`).

**Proposed fix:** Replace with `<Image src={url} alt={label ?? 'Изображение'} unoptimized fill className={styles.svg} />` (or `width`/`height` if the dimensions are known). The
`unoptimized` prop handles the SVG case. 1 line change.

---

### CA10 🟡 6 page-level `'use client'` on form pages (LOW)

**Convention violated:** `CODE_STYLE.md` — "Keep `'use client'` boundaries as deep in
the tree as possible — push them to leaf components, not layouts" + `COMPONENTS.md` —
"Add `'use client'` only at the lowest boundary that requires it."

**Finding:** 6 `page.tsx` files are full Client Components:
- `src/app/(site)/auth/register/page.tsx`
- `src/app/(site)/auth/forgot-password/page.tsx`
- `src/app/(site)/auth/reset-password/page.tsx`
- `src/app/(site)/cart/page.tsx`
- `src/app/(site)/checkout/page.tsx`
- `src/app/admin/login/page.tsx`

These are form-heavy interactive pages, so `'use client'` is functionally correct. But
the convention says to push the boundary to a leaf component (e.g., `LoginForm.tsx` is
already a client leaf — `auth/login/` does it right). The form pages could be Server
Components that render a client leaf form, passing in any server-fetched data as props.

**Impact:** Minor — these pages ship more JS than necessary (the page-level framework
code is client-side). For auth pages this is negligible (small pages). For `cart` and
`checkout` it's slightly more impactful (the page shell + form validation logic is
client-side). Not a perf emergency given the defer-behind-interaction strategy.

**Proposed fix:** For `cart` and `checkout`: extract the interactive form into a
`CartView.tsx`/`CheckoutForm.tsx` client leaf, make the `page.tsx` a Server Component
that fetches any needed data (cart, profile, box-set flags) and passes it as props. For
the auth pages: same pattern but lower priority (pages are tiny). 6 files, medium effort.

---

### CA11 🟡 1 swallowed non-storage error — `notifyStorySubmissionAction.catch(() => {})` (LOW)

**Convention violated:** `ERROR_HANDLING.md` — "Never swallow errors silently — always
propagate, log, or surface them" + `CODE_STYLE.md` — "Do not swallow errors silently."

**Finding:** `src/components/authors/StorySubmit/StorySubmitModal.tsx:117`:
```ts
void notifyStorySubmissionAction({ authorName, coverLetter, path: result.path }).catch(() => {})
```
This swallows the admin email notification error completely — no `console.error`, no
toast. The action itself (`src/lib/stories/actions.ts`) logs a `console.warn` if
`ADMIN_NOTIFICATIONS_EMAIL` is unset, but if the Resend send itself fails (API error,
network), the error is lost here.

**Note:** The 11 `.catch(() => {})` on **storage cleanup** calls in admin actions are
explicitly allowed by `data-architecture-fix-plan.md` §5.2 — those are best-effort
storage deletes where a failure is non-actionable. This one is different: it's an email
notification where a failure could mean the editorial team never sees a submission.

**Proposed fix:** Replace `.catch(() => {})` with `.catch((err) => console.error('[story submission] notification failed', err))` — log it server-side so it's visible in
logs, even if the user doesn't see a toast (the upload succeeded, so the author's action
is complete). 1 line change.

---

### CA12 🟡 `src/api/orders/getOrders.ts` is 243 lines with duplicated query logic (LOW)

**Finding:** `src/api/orders/getOrders.ts` (243 lines) builds two nearly-identical
Supabase queries — one for the client-side `getOrders` (via browser client) and one for
`getOrdersServer` (via server client). The query builder, column selection, and
normalization are duplicated. Same pattern in `getOrderHistory.ts`.

**Impact:** A change to the order query (new column, new filter, new join) must be made
in two places. Maintenance burden + drift risk.

**Proposed fix:** Extract a shared `buildOrdersQuery(client, userId, opts)` helper that
both the client and server variants call, passing in the appropriate Supabase client.
~50 lines saved per file.

---

### Summary table

| # | Finding | Severity | Convention | Files | Effort |
|---|---------|----------|------------|-------|--------|
| CA1 | 69 routes with no loading.tsx + no error.tsx | 🟠 HIGH | ERROR_HANDLING.md | 69 routes (fix with 2-3 route-group error.tsx + per-route loading.tsx) | Medium |
| CA2 | 25 `as unknown as` casts without narrowing | 🟠 HIGH | TYPESCRIPT.md | 13 files | Medium |
| CA3 | 19 `select('*')` calls | 🟡 MED | DATA.md | 10 files (9 storefront + 10 admin) | Low |
| CA4 | 25 barrel imports | 🟡 MED | perf/README.md | 25 files | Low (mechanical) |
| CA5 | 69 hardcoded hex colors in component SCSS | 🟡 MED | SCSS.md | ~30 files | Medium (batch) |
| CA6 | 2 `overflow: auto` instead of `<Scroller>` | 🟡 MED | SCSS.md | 1 file | Trivial |
| CA7 | `admin/books/actions.ts` 753 lines | 🟡 MED | CODE_STYLE.md | 1 file (split into 4) | Medium |
| CA8 | `CatalogControls.tsx` 470 lines | 🟡 MED | CODE_STYLE.md | 1 file (split into 5-6) | Medium |
| CA9 | 1 `<img>` instead of `next/image` | 🟡 MED | CODE_STYLE.md | 1 file | Trivial |
| CA10 | 6 page-level `'use client'` form pages | 🟡 LOW | CODE_STYLE.md | 6 files | Medium |
| CA11 | 1 swallowed non-storage error | 🟡 LOW | ERROR_HANDLING.md | 1 file | Trivial |
| CA12 | Duplicated order query logic | 🟡 LOW | DRY | 2 files | Low |

**Recommended fix order:** CA6 + CA9 + CA11 (trivial, ship first) → CA4 (mechanical,
low risk) → CA1 (highest impact, route-group error.tsx first) → CA3 + CA12 (data layer
hygiene) → CA2 (type safety, largest effort) → CA5 + CA7 + CA8 (refactors, batch) →
CA10 (page-level client boundaries, lowest priority).

---

*Migrated from `docs/AUDIT.md` (historical audit snapshot, deleted 2026-06-06).*
