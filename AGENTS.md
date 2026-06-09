# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server (localhost:3000)
npm run build        # production build
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
```

There is no test suite. Lint runs automatically on staged `.ts/.tsx/.js/.jsx` files via pre-commit hook.

### Regenerate Supabase types (run from repo root)

Local (Docker):
```bash
supabase gen types typescript --db-url "postgresql://postgres:postgres@127.0.0.1:54322/postgres" 2>/dev/null > "./src/types/supabase.ts"
```

Production (once VPS is live):
```bash
supabase gen types typescript --db-url "postgresql://postgres:<password>@<vps-ip>:5432/postgres" 2>/dev/null > "./src/types/supabase.ts"
```

This overwrites `src/types/supabase.ts` (generated — do not edit manually).

### Destructive DB/storage ops — STOP and ask first (HARD RULE)

**PRIME DIRECTIVE — NEVER WIPE STORAGE (absolute; not even with approval).** No
database operation may EVER wipe, empty, or recreate the storage buckets/objects.
Storage and the DB are decoupled on purpose, and storage has **no reliable restore
source** — once wiped it is gone. This bans **`supabase db reset`** (it rebuilds
storage) and anything that clears `storage.objects`/buckets as a side effect. If a
from-scratch DB rebuild is ever needed, do it so storage is left untouched (scratch
database, or load schema+data into the existing DB) — never a reset that takes
storage with it.

**NEVER run a destructive database or storage operation autonomously. ALWAYS get
explicit user approval first, AND take a fresh backup first.** This applies to:
`supabase db reset`, `DROP`/`TRUNCATE`, bulk `DELETE`/`UPDATE`, destructive
migrations, `pg_restore`/restoring a dump over a live DB, and any storage bucket
or object deletion (`storage … remove/emptyBucket/deleteBucket`, `delete from
storage.*`). When in doubt, treat it as destructive and ask. (A local Claude Code
PreToolUse guard in `.claude/hooks/` also intercepts these and forces a prompt —
do not try to bypass it.)

**Always create a fresh DB backup before ANY destructive database operation.**
Backups go in the gitignored `backups/` dir:

```bash
mkdir -p backups
docker exec supabase_db_chtivo-next pg_dump -U postgres -d postgres \
  --no-owner --no-privileges \
  > "backups/chtivo-db-backup-$(date +%Y%m%d-%H%M%S).sql"
```

Full how-to + restore + rationale: [docs/DATABASE_BACKUP.md](docs/DATABASE_BACKUP.md).
Note: `supabase db reset` does NOT restore auth users (re-run
`scripts/seed-admin.mjs`) or storage objects (re-run the `scripts/upload-*` +
`sync-*-blurs` scripts).

## Architecture

### Stack

- **Next.js 16.2.4** (App Router, Russian content — no i18n framework, locale is handled by content only)
- **Supabase** for database + auth (anonymous login on first visit, promoting to real user on account creation)
- **TanStack Query v5** for server-state caching and client-side data fetching
- **SCSS Modules** for all styling; **Radix UI** primitives for accessible components
- **OverlayScrollbars** v2 (`overlayscrollbars` + `overlayscrollbars-react`) for custom scrollbars via the shared `<Scroller>` wrapper
- No MobX, no Tailwind, no styled-components, no Redux in the codebase

### Directory layout

```
src/
  app/          Next.js App Router. Root layout = html/body/Providers ONLY (no chrome).
    (site)/     Storefront route group — owns the Header/Footer chrome via its layout.
      auth/       login/ and register/ routes
      profile/    User cabinet (books/, courses/, subscriptions/, orders/, gift-cards/, favorites/)
      books/      Catalog
        (catalog)/  Catalog listing (page.tsx, loading.tsx, error.tsx). Nested route group
                    so its loading.tsx is NOT a Suspense ancestor of /books/[slug]
                    — the catalog grid skeleton would otherwise flash on book-detail loads.
        [slug]/     Book detail (own loading.tsx mirrors the real page layout)
      cart/       Cart page
      checkout/   Checkout and success/
      payments/   In-app mock payment gateway (mock/)
      dino-magazine/, gift-cards/, subscription/, authors/, abzac/, about/, …  (storefront pages)
    admin/      Admin panel — header-free chrome. login/ + guarded (panel)/ route group
      (panel)/    orders/ books/ authors/ box-sets/ gift-cards/ subscriptions/ promo-codes/
                  articles/ featured/ submissions/ audit/ + dashboard
  api/          Supabase API modules — one directory per domain (books/, cart/, orders/, …, admin/)
  assets/       SVGs, images (SVGs imported via @svgr/webpack)
  components/   UI components, grouped by domain; common/ for shared primitives (Modal, Scroller, Skeleton, etc.); admin/ for admin UI
  consts/       Named constant exports, one file per domain
  contexts/     React contexts — context.ts + provider.ts + index.ts per context
  entities/     Domain types split into client.ts / server.ts / normalize.ts / validation.ts
  hooks/        Custom hooks, one per file, default export
  lib/          Helpers: auth/actions.ts, supabase/client.ts + server.ts, storage.ts, etc.
  styles/       globals.scss and shared style tokens
  types/        Shared TypeScript types; supabase.ts is generated — do not edit manually
  utils/        Utility functions, default exports (currently empty placeholder)
```

### Import alias

`@/*` maps to `src/*`. API modules live in `src/api/` and are imported as `@/api/...`.

### State management pattern

There is no global client-side state library. Server state is managed by TanStack Query (cache keys, mutations, invalidation). Local UI state uses `useState`/`useReducer` in components or React context for cross-component sharing (see `src/contexts/`). There is no MobX, Redux, or Zustand.

### Entity / data layer pattern

Each domain entity in `src/entities/<name>/` has:
- `server.ts` — Supabase query definitions and server-side types (use `QueryData<typeof query>` for inferred types)
- `client.ts` — normalized TypeScript interfaces used in the frontend
- `normalize.ts` — transforms server shape → client shape via `normalizeObject`
- `validation.ts` — Zod schemas

API calls go through `src/api/<domain>/` modules that import the Supabase client from `@/lib/supabase/client` (browser) or `@/lib/supabase/server` (RSC / Server Actions) and call Supabase directly (no REST wrapper layer).

### Layout system

Layouts use the App Router convention: each route segment can have a `layout.tsx` that wraps its children. The root layout (`src/app/layout.tsx`) sets the HTML shell, loads fonts, and renders `<Header>` and the `Providers` wrapper. There is no `getLayout` pattern — that was a Pages Router convention.

### Auth flow

On app load, `src/app/providers.tsx` checks for an existing Supabase session client-side. If none exists it calls `supabase.auth.signInAnonymously()`. `src/proxy.ts` (the Next.js 16 proxy file) refreshes sessions on every request and sets the `bookstore_cart_id` cookie for anonymous users. Real accounts are created via `/auth/register`; login via `/auth/login`; Google OAuth via `signInWithGoogleAction` (`src/lib/profile/actions.ts`).

When an anonymous user signs in (OAuth or email/password), their Cart + Orders + Profile are migrated onto the resolved authenticated user and the anon row is deleted, in a single atomic SQL transaction (`migrate_anonymous_user` RPC). We deliberately do **not** use `linkIdentity` — see [docs/plans/auth-flow.md](docs/plans/auth-flow.md) for the design, the multi-device case it handles, and the production deployment checklist.

### Profile cabinet (`/profile`)

The user's cabinet lives at `/profile` (the old `/account` route was deleted, no back-compat redirect — project was still in dev when renamed). Reachable in one click from the header profile icon for anon **and** real users alike; the header icon never logs anyone out.

Layout is multi-route: `/profile`, `/profile/books`, `/profile/courses`, `/profile/subscriptions`, `/profile/orders`, `/profile/gift-cards`, `/profile/favorites` all share `/profile/layout.tsx`. Favorites is a placeholder ("Пока ничего нет") — actual favorites feature is out of scope. The shell is a 450 px wide `$color-sidebar` (`#1A0F0F`) stripe on the left + free-flowing main panel on the right.

Key invariants:
- `Profiles` table is FK'd to `auth.users(id) ON DELETE CASCADE` with RLS scoped to owner. One row per user; default `nickname = 'Никнейм'` (literal Cyrillic — matches Figma placeholder). Fields: nickname, avatar_path, full_name, phone, birthday, **city**, about, recovery_email.
- `Profiles.recovery_email` is **distinct from** `auth.users.email`. It's opt-in, never verified, never written to `auth.users`. Future auth flows can look it up to suggest account recovery.
- Avatars live in the `avatars` public bucket (2 MB cap, JPEG/PNG/WEBP). Path is `avatars/{user_id}.{ext}` — `Profiles.avatar_path` stores the bare object key.
- The sidebar header strip carries avatar (77 × 78) + nickname over a red→black gradient overlay on `$color-sidebar`. The "active" nav-item color is `$color-accent-on-dark`.
- Sidebar nav: **Мои книги** → `/profile/books`, **Мои курсы** → `/profile/courses`, **Мои подписки** → `/profile/subscriptions`, **Заказы** → `/profile/orders`, **Карты даров** → `/profile/gift-cards`, **Избранное** → `/profile/favorites`, **Стать автором** → `/suggest-manuscript` (existing stub, real authors page is future work). Items + icons live in `ProfileSideNav` `NAV_ITEMS`.
- The sidebar bottom CTA is the auth slot: anonymous users see **Войти** (opens `LoginModal` with four line-art OAuth icons — Google is wired, Yandex/VK/Telegram show a "Скоро" hint); authenticated users see **Выйти** which submits `logoutAction`. There is no separate `SecurityCard` — login + logout both live here.
- **`isAnon` must be resolved server-side and passed down as a prop.** With `encode: 'tokens-only'` the live session tokens are in HttpOnly cookies the browser cannot read; `localStorage` only holds a cached `User` object that goes stale after a server-side OAuth exchange. `ProfileLayout` reads `user.is_anonymous` from `createClient()` (server) and passes `isAnon` to `ProfileSideNav`. Do not use `useSupabaseUser()` for sign-in CTAs. See `docs/plans/auth-flow.md § Session cookie encoding`.
- Profile editing happens in `EditProfileModal` triggered by the outlined "Редактировать профиль" button in the main panel. Avatar upload is inside the modal, not the read-only main panel.
- See also: `Profiles` migrations `20260521120000_profile_cabinet.sql` and `20260521140000_profile_city.sql`; `get_or_create_profile` RPC; `src/components/profile/{ProfileSideNav,ProfileMainPanel,LoginModal,EditProfileModal,ProfileEditor,AvatarUpload}/`.

### Checkout flow (`/checkout`)

Single-page checkout. The cart's content determines the form:
- **Has physical items** (`PrintBook`, `Book2.0`, or a `BoxSet` containing either) → shipping address form.
- **Digital only** → single optional email field.

Confirmation modal → `startCheckoutAction` → two-phase payment via Robokassa (with a swappable in-app **mock** gateway). The processing modal stays up while the browser is handed off to the gateway by full-page POST.

Key invariants:
- **Two-phase order, not atomic.** `create_pending_order(...)` writes `Orders` (status `'pending'`, `paid_at=null`) + `OrderItems` and **does not** wipe the cart. The buyer is POSTed to the gateway; on a valid payment callback, `mark_order_paid(p_inv_id, p_out_sum)` — **idempotent** — verifies the amount, sets `status='paid'`/`paid_at=now()`, wipes that user's `Cart`+`CartPromo`, and (for recurring/subscription lines) creates the `UserSubscriptions` anchor. An order fully covered by gift cards settles immediately (`startCheckoutAction` returns `paid`).
- **Provider** is chosen by `PAYMENT_PROVIDER` (`mock` default, `robokassa` in prod) in `src/lib/payments/config.ts`; `mock` flips the gateway URLs to in-app endpoints (`/payments/mock`). Signature/receipt/recurring logic in `src/lib/payments/robokassa/`.
- `Orders` rows are **immutable price snapshots**: `original_total`, `book_discount_total`, `promo_code`, `promo_discount`, and shipping fields are written once at order time. Recomputing later from current prices is forbidden.
- BoxSet physicality is computed by `box_set_is_physical(box_set_id)` from `BoxSetBooks` rows. Entry with `product_id` like `PrintBook-N` or `Book2.0-N` ⇒ physical; entry with `NULL product_id` ⇒ check whether the title has a row in `PrintedBooks` or `CardBooks`.
- Digital files live in the private `digital-files` bucket. Per-edition columns: `Ebooks.file_path`, `Audiobooks.file_path`, `CardBooks.file_path`. Served via signed URLs with 1 h TTL.
- Anonymous users complete checkout fine — `Orders.user_id` accepts the anon UID. The anon→OAuth/email migration (see auth flow above) moves those orders to the real user on sign-in.
- Out of scope and stubbed: real SMTP, BoxSet/GiftCard/Subscription/Course file downloads. (The legacy single-shot `place_order` RPC + `src/api/orders/placeOrder.ts` are superseded by the two-phase flow.)
- See also: migrations `20260520160000_checkout_schema.sql` + `20260603120000_robokassa_payments.sql`; `src/app/(site)/checkout/`; `src/api/orders/createPendingOrder.ts`; `src/lib/payments/`; [docs/plans/robokassa-payments.md](docs/plans/robokassa-payments.md).

### Promo codes

Two kinds: **cart-level** (whole-cart percent off) and **item-level** (one Title or one specific edition). Applied through the shared `PromoCodeForm` at the bottom of `/cart`.

Key invariants:
- **One code per cart at a time.** Applying a new code replaces the previous one (cart-level or item-level — doesn't matter, only one survives).
- **DB-persisted in `CartPromo`.** Survives reload / new sessions until removed, expired, or checkout wipes it.
- **Case-insensitive.** Codes are stored upper-cased; comparison after `trim().toUpperCase()`.
- **Item-level codes whose target isn't in the cart** are rejected with a Russian inline error. The code is NOT saved to `CartPromo`.
- **Max-wins pricing.** Per-row final price uses the larger of (built-in book discount, applicable promo discount). A weak promo applies silently — if the cart later changes, it may start helping.
- **Cart-promo base** = `cart_promo_pct × sum(original_price × qty)` — the pre-book-discount sum. The `Скидка (CODE)` totals line only renders when the promo actually saves money beyond the existing book discounts.
- Discount % range: 1–100 (100 = giveaway).
- See also: migrations `20260520140000_promo_codes.sql` + `20260520140200_apply_promo_code_rpc.sql`; `apply_promo_code` RPC; `docs/testing/promo-codes.md` for seeded test fixtures.

### Admin panel (`/admin`)

Staff back-office, **header-free chrome** (its own shell, not the storefront Header/Footer). Shipped — see [docs/plans/admin-panel.md](docs/plans/admin-panel.md).

- **Routing:** `src/app/admin/login/` (unguarded) + `src/app/admin/(panel)/` (guarded route group). Sections under `(panel)/`: `orders/ books/ authors/ box-sets/ gift-cards/ subscriptions/ promo-codes/ articles/ dino-magazine/ featured/ submissions/ audit/` + the dashboard.
- **Auth/guard:** admin role lives in `auth.users.app_metadata.role` (`= 'admin'`), set only via service-role (not user-editable). `src/lib/admin/auth.ts` (`isAdmin`, `requireAdmin`, `ADMIN_ROLE`); the `(panel)/layout.tsx` calls `requireAdmin()` (defense-in-depth alongside the `proxy.ts` gate). Seed/promote an admin with `node --env-file=.env scripts/seed-admin.mjs <email> <password>`.
- **Chrome:** `AdminShell` (sticky topbar + breadcrumb + bell→`/audit`, off-canvas drawer ≤`search-bar`) + `AdminSideNav` (grouped nav with count chips from `getAdminNavCounts`).
- **Shared UI — one component, used everywhere (do NOT reinvent per-section):** `AdminList`, `AdminFilterBar`, `AdminPageHeader`, `AdminPager`, `AdminSelect` (custom dropdown — used for every admin select except the storefront header), `AdminInput`/`AdminTextarea` (number inputs reject non-numerics), `AdminDatePicker` (custom; `withTime`/`yearOnly` variants — no native date pickers), `StatusBadge`, `ImageUploader`, `ComingSoon`, `icons/`. Re-skinned to the design handoff (dark tokens in `src/styles/params.scss`, `admin-page-title`/`admin-field` mixins). Plus per-domain folders under `src/components/admin/<domain>/`.
- **Data:** reads via `src/api/admin/<domain>/`; writes via Server Actions in `src/lib/admin/<domain>/actions.ts`. Audit log = `AdminAuditLog`.

## Storage & Images

### Cover images

Book covers are stored in a **Supabase Storage bucket called `covers`** (public, 20 MB file limit).

**How it works:**
- The `Titles.cover` column stores **bare filenames only** (e.g., `murlo.jpg`, `povelitel-bloh.png`).
- The `getCoverUrl()` function in `src/lib/storage.ts` converts filenames to full URLs at runtime using `NEXT_PUBLIC_SUPABASE_URL`.
- All code paths (`getBooks`, `getBook`, `searchBooks`) go through `normalizeBook()` → `getCoverUrl()`.
- `next/image` handles optimization and resizing — no separate thumbnails needed.

**Adding new covers:**
1. Upload the image to the `covers` bucket (via Supabase Dashboard, CLI, or `scripts/upload-covers-to-supabase.mjs`)
2. Set `Titles.cover = 'filename.jpg'` in the database (bare filename, no path prefix)

**Self-hosted Supabase (same VPS):**
- `NEXT_PUBLIC_SUPABASE_URL` must be the **public-facing** URL (e.g., `https://api.example.com`), not an internal Docker hostname, because it's used in browser-side image URLs.
- Add the hostname to `remotePatterns` in `next.config.ts` so `next/image` can optimize the images.
- The Supabase Storage API serves images at `{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/covers/{filename}`.
- If using a reverse proxy (nginx/caddy), ensure it proxies `/storage/v1/object/public/` requests to the Supabase Storage container.

**Scripts:**
- `scripts/scrape-books.mjs` — Scrapes book data from the old chtivo.spb.ru site
- `scripts/generate-seed-sql.mjs` — Generates `supabase/seed-books.sql` from scraped JSON (stores bare filenames for covers)
- `scripts/download-covers.mjs` — Downloads cover images locally (to `public/covers/`)
- `scripts/upload-covers-to-supabase.mjs` — Creates the `covers` bucket and uploads images
- `scripts/retry-covers.mjs` — Retries failed uploads
- `scripts/update-cover-urls-supabase.mjs` — Generates SQL to update cover URLs in the database
- `scripts/_blur.mjs` — Shared helper (`makeBlurDataUrl(buffer)`) — resize to 10×15, JPEG q40, base64 data URL
- `scripts/sync-cover-blurs.mjs` — Backfill `Titles.cover_blur` for every row whose cover file exists in the `covers` bucket
- `scripts/sync-author-photo-blurs.mjs` — Backfill `Authors.photo_blur` against the `authors` bucket
- `scripts/sync-book-photo-blurs.mjs` — Backfill `Titles.book_photos_blurs` (JSONB map of filename → data URL) from the `book-photos/{slug}/` folders
- `scripts/sync-subscription-blurs.mjs` — Backfill `Subscriptions.image_blur` from the `subscriptions` bucket

All blur scripts are idempotent — re-running on a fully-seeded DB is a no-op.

## Conventions and Code Culture

**Read these before writing any code.** They define the standards all agents must follow.

| Document | Covers |
|----------|--------|
| [docs/conventions/CODE_STYLE.md](docs/conventions/CODE_STYLE.md) | Formatting, naming, React/Next.js rules, Server vs Client |
| [docs/conventions/SCSS.md](docs/conventions/SCSS.md) | SCSS Modules, tokens, breakpoints, responsive strategy |
| [docs/conventions/TYPESCRIPT.md](docs/conventions/TYPESCRIPT.md) | Strict TypeScript, type design, `any` policy |
| [docs/conventions/COMPONENTS.md](docs/conventions/COMPONENTS.md) | Component structure, Radix UI, forms, layouts |
| [docs/conventions/DATA.md](docs/conventions/DATA.md) | TanStack Query, Supabase, Server Actions, entity layer |
| [docs/conventions/PERFORMANCE.md](docs/conventions/PERFORMANCE.md) | Core Web Vitals, dynamic imports, images, fonts, Suspense |
| [docs/conventions/SEO.md](docs/conventions/SEO.md) | Metadata API, accessibility (WCAG 2.1 AA), security |
| [docs/conventions/ERROR_HANDLING.md](docs/conventions/ERROR_HANDLING.md) | Error boundaries, Server Actions, loading/not-found patterns |

Open issues and deferred concerns live in [docs/CONCERNS.md](docs/CONCERNS.md).

Test data and fixtures live in `docs/testing/`:

| Document | Covers |
|----------|--------|
| [docs/testing/promo-codes.md](docs/testing/promo-codes.md) | Seeded promo codes (cart + item-level, expired) for manual cart-flow testing |

Key rules at a glance:
- **No Tailwind. No styled-components.** SCSS Modules only.
- **Custom scrollbars via `<Scroller>`.** Wrap overflow containers with `<Scroller>` from `@/components/common/Scroller` instead of raw `overflow: auto`. Uses the `os-theme-chtivo` theme (thin grey thumb, hidden on touch). See [docs/plans/custom-scrollbar.md](docs/plans/custom-scrollbar.md).
- **No class components.** Functional components with hooks only.
- **No `any`.** Use `unknown` at unsafe boundaries, then narrow.
- **Server Components by default.** Add `'use client'` only when required.
- **All Supabase calls go through `src/api/<domain>/`.** Never call Supabase directly from components.
- **Commit messages**: short imperative slug, no AI attribution.

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
