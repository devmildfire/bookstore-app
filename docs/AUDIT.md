# Codebase Audit — chtivo-next

> ⚠️ **Historical snapshot (2026-05-05). Do not treat as current state.**
> Several items below have since shipped and are no longer accurate:
> - **G4 (admin section)** — built: a full `/admin` panel exists (auth/roles,
>   orders, book graph, authors, box sets, gift cards, subscriptions, promo
>   codes, articles, submissions, audit, dashboard). See
>   [plans/admin-panel.md](./plans/admin-panel.md) + tracker.
> - **G5 (order history)** — built: the `/profile` cabinet has order history
>   (Мои книги / Заказы). The `/account` route referenced throughout this doc
>   was **deleted and renamed `/profile`** (no back-compat redirect).
> - **G3 (payment gateway)** — Robokassa is now integrated with a swappable mock
>   gateway. See [plans/robokassa-payments.md](./plans/robokassa-payments.md).
> - **G2 (email)** — still stubbed. **S1 (rotate credentials)** — still open.
>
> Treat this file as the record of the 2026-05-05 fix pass, not a live audit.

**Audited:** 2026-05-05  
**Branch:** `update` (commit `8d26e64`)  
**Stack:** Next.js 16.2.4, App Router, TypeScript strict, Supabase, TanStack Query, SCSS Modules, Radix UI

---

## Severity Legend

| Symbol | Meaning |
|--------|---------|
| 🔴 Critical | Broken at runtime or active security risk |
| 🟠 High | Significant functional or correctness issue |
| 🟡 Medium | Convention violation, quality debt |
| 🟢 Low | Minor cleanup or cosmetic |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Critical Bugs](#2-critical-bugs)
3. [Architecture Issues](#3-architecture-issues)
4. [Security Issues](#4-security-issues)
5. [Convention Violations](#5-convention-violations)
6. [Dead Code & Vestigial Files](#6-dead-code--vestigial-files)
7. [Documentation Gaps & Mistakes](#7-documentation-gaps--mistakes)
8. [Deferred Known Gaps](#8-deferred-known-gaps)
9. [Dependency Audit](#9-dependency-audit)

---

## 1. Executive Summary

The App Router migration is structurally complete — there is no `pages/` directory, all routes live under `src/app/`, conventions are largely followed, and the component library looks solid. `src/proxy.ts` (Next.js 16's correctly-named proxy file, following the v16.0.0 rename from `middleware.ts`) handles session refresh, cart cookie creation, and server-side route protection and is running correctly.

**Issues fixed since initial audit:** C1–C5, C7 (all critical bugs), A1–A8 (architecture), S2–S6 (security), V1–V9 (convention violations), D1–D9 (dead code), G1/G6–G10 (gaps), Doc1–Doc7 (documentation). All migrations applied to local DB; types regenerated. Unused dependencies (`cookies-next`, `date-fns`) removed. `.env` credentials wiped.

**Remaining open issues:**

**Security:** S1 — credentials in `.env` history may need rotating (Brevo, Telegram, YooKassa). `.env` is gitignored; check `git log --all -- .env` to confirm if ever committed.

**Deferred features (infra/VPS not ready):** G2 (email delivery via Brevo), G3 (YooKassa payment gateway).

**Planned features:** G4 (admin section), G5 (order history in account page).

---

## 2. Critical Bugs

### ~~C1~~ ✅ FIXED — Login session cookie is incompatible with `@supabase/ssr`

**Fixed in:** `src/lib/auth/actions.ts`

Replaced the manual `@supabase/supabase-js` client + `sb-auth-token` cookie with `createClient()` from `@/lib/supabase/server`. The `@supabase/ssr` adapter now writes and reads session cookies correctly on every auth call. `flowType: 'implicit'` removed — PKCE is the default (fixes S6 too). `logoutAction` now calls `supabase.auth.signOut()` instead of manually deleting the old cookie.

---

### ~~C2~~ ✅ FIXED — `getBooks` fetches the entire catalog and filters in JavaScript

**Fixed in:** `src/api/books/getBooks.ts`, `supabase/migrations/20260505000000_catalog_products.sql`

Replaced `.limit(1000)` + JS filtering with a call to the `get_catalog_books` RPC — all filtering (search, category, author, price range), sorting, and pagination happen in PostgreSQL. Returns `total_count` via window function so the catalog page gets accurate pagination without a second query.

---

### ~~C3~~ ✅ FIXED — `getBook` fetches ALL books to find one by slug

**Fixed in:** `src/api/books/getBook.ts`

Now calls `get_catalog_book_by_slug` RPC — DB-side filter by slug, EBook-first ordering, returns only matching rows.

---

### ~~C4~~ ✅ FIXED — `getRelatedBooks` fetches ALL books for every book detail page

**Fixed in:** `src/api/books/getBook.ts`

Now calls `get_catalog_books` RPC with `result_limit` — DB-side limit, no full-table scan.

---

### ~~C5~~ ✅ FIXED — `createOrder` inserts columns that don't exist in the `Orders` schema

**Fixed in:** `src/api/orders/createOrder.ts`

Column mapping corrected: `total` → `summ`, `delivery_email` → `email`, `delivery_method` removed (no such column). `OrderItems` insert corrected: `book_id` removed, `category` → `type`, `summ` (line total) and `discount` added. Both inserts now use generated `DbOrderInsert` / `DbOrderItemInsert` types — no `as any` casts. Also removes two of the four V1 `as any` instances.

Note: order creation still runs client-side with the anon key (S2 — deferred).

---

### ~~C6~~ ✅ FIXED — Cart queries have no explicit user filter — correctness depends entirely on unverified RLS

**Fixed in:** `supabase/migrations/20260505100000_cart_user_isolation.sql`, `src/lib/auth/actions.ts`

Migration adds:
- `user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE` to `Cart`
- Composite primary key `(user_id, id)` — multiple users can each hold the same product
- Four explicit RLS policies (SELECT / INSERT / UPDATE / DELETE) all keyed to `user_id = auth.uid()`
- `migrate_cart(from_user_id, to_user_id)` SECURITY DEFINER function (cart-only). **Superseded** by `migrate_anonymous_user` — see migration `20260521130000_migrate_anonymous_user.sql` and [docs/plans/auth-flow.md](./plans/auth-flow.md). The cart-only RPC is kept in the DB for now but is no longer called from app code.

`loginAction` captures the anonymous user's ID before `signInWithPassword`, then calls `migrateAnonymousUserAction` best-effort after sign-in (moves Cart + Orders + Profile + CartPromo, deletes the anon row). `registerAction` calls `supabase.auth.updateUser({ email, password })` for anonymous sessions — upgrades in-place, keeping the same UID so the cart survives without any migration.

**Note:** Supabase types must be regenerated after each migration is applied to pick up the new `user_id` column and RPCs in TypeScript.

---

### ~~C7~~ ✅ FIXED — `checkout/success/page.tsx` calls `useSearchParams()` without `Suspense`

**Fixed in:** `src/app/checkout/success/`

Extracted `useSearchParams` logic into `CheckoutSuccessContent.tsx` (Client Component). `page.tsx` is now a Server Component that wraps it in `<Suspense>`.

---

## 3. Architecture Issues

### ~~A1~~ ✅ FIXED — Category was hardcoded as `'Book2.0'` for every book

**File:** `src/entities/book/normalize.ts:5`

```ts
const DEFAULT_CATEGORY = 'Book2.0'
```

The `CardBooks` table has no `category` column. `normalizeBook` assigns `DEFAULT_CATEGORY` to every book regardless of type.

**Consequence:** The category filter on the catalog page is completely non-functional — all books are Book2.0, so filtering by any other category returns zero results, and selecting "all" is the only working option. The `categories` array derived in `getBooks.ts` will always be `['Book2.0']`.

---

### ~~A2~~ ✅ FIXED — Dead import in root layout

**Fixed in:** `src/app/layout.tsx` — dead `createDataClient` import removed.

---

### ~~A3~~ ✅ FIXED — Homepage double-fetches the full catalog

**Fixed in:** `src/app/page.tsx`, `src/api/books/getLatestBooks.ts` — homepage now calls `getLatestBooks(12)` which skips the parallel authors query and applies DB-side limit.

---

### ~~A4~~ ✅ FIXED — `checkout/page.tsx` marks Phase 8 complete but key requirements are unimplemented

**Fixed in:** `docs/plans/modernization-plan.md` (Doc6 fix)

Phase 8 status changed from ✅ Complete → 🔄 In progress with an accurate note: "UI shell exists; payment is simulated, order creation broken (schema mismatch), no email/download". The remaining work (YooKassa, Resend, signed URL download) is intentionally deferred in G-series gaps.

---

### ~~A5~~ ✅ FIXED — `BooksError` is missing the required `error` prop

**Fixed in:** `src/app/books/error.tsx`, `src/app/books/[slug]/error.tsx`

Both error boundaries now accept `error: Error & { digest?: string }` alongside `reset`, matching the convention. The `digest` is available for future server-side error correlation.

---

### ~~A6~~ ✅ FIXED — Cart migration on login is a stub

**Fixed in:** `src/lib/auth/actions.ts`, `supabase/migrations/20260505100000_cart_user_isolation.sql` (C6 fix), `supabase/migrations/20260521130000_migrate_anonymous_user.sql` (broadened scope)

Initial fix introduced `migrate_cart(from, to)` (cart-only) called via `migrateCartAction`. **Superseded** by `migrate_anonymous_user(from, to)` which also moves Orders, CartPromo, Profiles, and deletes the anon `auth.users` row — used by both email login *and* Google OAuth. See [docs/plans/auth-flow.md](./plans/auth-flow.md) for the full design.

`loginAction` captures the anonymous UID before `signInWithPassword` and calls `migrateAnonymousUserAction` best-effort after sign-in. `registerAction` uses `supabase.auth.updateUser()` for anonymous sessions (in-place upgrade, same UID, no migration needed) and falls back to `signUp()` for non-anonymous sessions. `signInWithGoogleAction` stashes the anon UID in a short-lived cookie before redirect; `/auth/callback` runs `migrate_anonymous_user` after `exchangeCodeForSession`.

---

### ~~A7~~ ✅ FIXED — `featured_books` RLS policy uses deprecated `auth.role()` syntax

**Fixed in:** `supabase/migrations/20260504100000_featured_books.sql`, `supabase/migrations/20260505200000_fix_featured_books_rls.sql`

Policy updated to `auth.uid() IS NOT NULL`. A follow-up migration drops and recreates the policy on the live DB since the original migration was already applied.

---

### ~~A8~~ ✅ FIXED — `search_books` RPC uses `ILIKE '%term%'` — no full-text index

**Migration:** `supabase/migrations/20260505300000_search_books_gin_index.sql`

Added `pg_trgm` extension and GIN trigram indexes on `Titles.name` and `Authors.name`. Trigram indexes directly accelerate `ILIKE '%term%'` queries without changing the RPC function — the query planner picks them up automatically. Pending `supabase db push` to apply to live DB.

---

## 4. Security Issues

### S1 🔴 Production credentials in `.env` file — rotate immediately

**File:** `.env`

The `.env` file (gitignored, but with a confirmed historical git leak per project memory) contains:

| Variable | Sensitivity |
|----------|------------|
| `SUPABASE_SERVICE_ROLE_KEY` | **Maximum** — bypasses all RLS |
| `BREVO_APIKEY` | High — email delivery service |
| `TELEGRAM_BOT_APIKEY` | High — Telegram bot token |
| `ROBOPASS_ONE` / `ROBOPASS_TWO` | High — marked "REAL ONES NOT FOR TEST" |

Old Robokassa keys are also present in commented-out lines, which appear in `git log` history.

**Action required:** Rotate all of the above credentials in their respective dashboards. Confirm the `.env` file was never committed to git after it was added to `.gitignore` (check `git log --all -- .env`).

---

### ~~S2~~ ✅ FIXED — `createOrder` is called from a Client Component via browser Supabase

**Fixed in:** `src/lib/orders/actions.ts`, `src/app/checkout/page.tsx`

`createOrderAction` is a Server Action that reads the cart directly from the DB server-side (`supabase.from('Cart').select('*')`) — client-provided items and prices are never trusted. Verifies the user is authenticated before proceeding. Checkout page now calls `createOrderAction(deliveryEmail)` instead of the old browser-side `createOrder`.

The original `src/api/orders/createOrder.ts` is now dead code (D-series).

---

### ~~S3~~ ✅ FIXED — Auth Server Actions have no input validation

**Fixed in:** `src/lib/auth/actions.ts`

`loginAction` and `registerAction` now parse form data through Zod schemas before passing to Supabase. `loginSchema` validates email format and non-empty password. `registerSchema` additionally enforces minimum 6-character password server-side.

---

### ~~S4~~ ✅ FIXED — `dangerouslyAllowLocalIP: true` is in the production image config path

**Fixed in:** `next.config.ts`

Option is now gated: `...(!isProduction && { dangerouslyAllowLocalIP: true })` — disabled in production builds, active only in development.

---

### ~~S5~~ ✅ FIXED — Account page redirects anonymous users client-side — flash-of-content for anonymous sessions

**Fixed in:** `src/app/account/page.tsx`

Converted from Client Component to Server Component. Now calls `createClient()` server-side, checks `user.is_anonymous`, and calls `redirect('/auth/login')` before any HTML is rendered. Removed `useEffect` redirect, `useRouter`, and `useSupabaseUser` hook usage. The `logoutAction` form action works natively in Server Components.

---

### ~~S6~~ ✅ FIXED — `loginAction` used deprecated `flowType: 'implicit'`

Resolved as part of the C1 fix — `flowType: 'implicit'` removed along with the manual client. `@supabase/ssr` defaults to PKCE.

---

## 5. Convention Violations

### ~~V1~~ ✅ FIXED — Remaining `as any` casts violate the no-any rule

`src/api/cart/addToCart.ts`: `category: item.category as any` removed — `CartItem.category` is now typed as `ProductCategory` enum. `src/entities/cart/validation.ts` updated to use `z.enum([...])`. The `searchBooks.ts` RPC cast (`as unknown as RpcFn`) is the intentional pattern for Supabase RPCs not yet in generated types — not an `as any`.

---

### ~~V2~~ ✅ FIXED — Auth and checkout forms bypass React Hook Form + Zod

All three forms now use `useForm({ resolver: zodResolver(schema) })`. Login and register use `loginSchema`/`registerSchema` with email + password validation. Checkout uses `deliverySchema` with `superRefine` for conditional email requirement. Field error messages are displayed via `.fieldError` styles.

---

### ~~V3~~ ✅ FIXED — Header profile button always shows logout regardless of auth state

Anonymous users now get `<Link href='/auth/login'>` with the Profile icon; authenticated users get the logout form. Uses `isAnonymous` from `useSupabaseUser`.

---

### ~~V4~~ ✅ FIXED — Focus outlines were removed from header navigation without `:focus-visible` replacement

All bare `outline: none` removed from `.navLink`, `.navTrigger`, `.iconBtn`, `.dropdownSectionLink`, `.dropdownSubLink`. Added `&:focus-visible { outline: 2px solid $color-accent-on-dark; outline-offset: 2px; }` to all interactive elements. The Dialog container `outline: none` is kept (intentional Radix pattern).

---

### ~~V5~~ ✅ FIXED — `classnames` (`cn`) not used for conditional classes in checkout

Added `import cn from 'classnames'`; step indicator now uses `cn(styles.step, step === 'review' ? styles.active : styles.done)`.

---

### ~~V6~~ ✅ FIXED — `NewProducts` wraps a `<button>` inside a `<Link>`

Button removed; `<Link href='/books' className={styles.button}>` renders directly with `display: flex; align-items: center; justify-content: center; text-decoration: none` added to the SCSS class.

---

### ~~V7~~ ✅ FIXED — Book cover `alt` text doesn't match the accessibility convention

`BookCard` and `Slider` both updated to `alt={\`Обложка книги: ${...}\`}`. All three cover image sites now consistent.

---

### ~~V8~~ ✅ FIXED — `aria-expanded` is hardcoded `false` on dropdown triggers

Removed `aria-expanded='false'` from `DropdownMenu.Trigger`. Radix manages the attribute automatically.

---

### ~~V9~~ ✅ FIXED — `AddToCartButton` uses `category: string` instead of `ProductCategory`

Added `import type { ProductCategory } from '@/types/database'`; prop changed to `category: ProductCategory`.

---

### ~~V10~~ ✅ FIXED — `docs/conventions/DATA.md` names the Supabase helpers inconsistently

**Fixed in:** `docs/conventions/DATA.md` (Doc4 fix) — all helper names corrected to `createClient()`.

---

## 6. Dead Code & Vestigial Files

### ~~D1~~ ✅ FIXED — `src/utils/` directory is empty

`.gitkeep` retained intentionally as a placeholder for future utilities. All other directories that had real content but still had `.gitkeep` files were cleaned up in D2.

---

### ~~D2~~ ✅ FIXED — `.gitkeep` files remain in directories that now have real content

Removed `.gitkeep` from `src/api/`, `src/entities/`, `src/hooks/`, `src/lib/`, `src/types/`, `src/components/common/`. Kept `src/utils/.gitkeep` as the directory is still empty.

---

### ~~D3~~ ✅ FIXED — `docs/old-components-exports/` — vestigial migration documentation

Entire directory deleted (14 files, 3811 lines removed).

---

### ~~D4~~ ✅ FIXED — `public/images/` contained development/test assets

Deleted: `test_flower.png`, `hand_goat.png`, `trailerScreenShot.png`, `bookTitleDeleted.jpg`, `bookTitleDeleted_BookPage.jpg`, `book-covers/deleted.jpg`. Subdirectories (`articles/`, `authors/`, `banners/`, `members/`, `partners/`, `subscriptions/`) retained as planned future content.

---

### ~~D5~~ ✅ FIXED — `public/video/` and `public/videos/` — duplicate directory naming

`composition.mp4`, `preview.mp4`, `shadows.mp4` moved from `public/video/` into `public/videos/`. Single `videos/` directory retained.

---

### ~~D6~~ ✅ FIXED — `src/entities/order/normalize.ts` is not used anywhere

Deleted `src/entities/order/client.ts`, `normalize.ts`, and `server.ts`. `createOrderAction` uses `DbOrderInsert`/`DbOrderItemInsert` from the generated types instead.

---

### ~~D7~~ ✅ FIXED — `tsconfig.tsbuildinfo` is tracked in git despite being gitignored

Already untracked at fix time — no action needed.

---

### ~~D8~~ ✅ FIXED — `docs/plans/modernization-plan.md` — stale AI planning document

File deleted (394 lines removed). The `docs/plans/` directory is now empty.

---

### ~~D9~~ ✅ FIXED — `.aider.chat.history.md` and `.aider.input.history` are tracked in git

Confirmed not tracked (`git ls-files .aider*` returned empty). No action needed.

---

## 7. Documentation Gaps & Mistakes

### ~~Doc1~~ ✅ FIXED — `AGENTS.md` / `CLAUDE.md` is significantly outdated

**Fixed in:** `CLAUDE.md` / `AGENTS.md`

Fully rewritten: Next.js 16.2.4 App Router, SCSS Modules only, TanStack Query v5, no MobX/Redux/Tailwind, correct directory layout, correct `@/api/...` import alias, correct Supabase types regen command, correct auth flow (`providers.tsx` + `src/proxy.ts`).

---

### ~~Doc2~~ ✅ FIXED — Supabase types regeneration command is wrong

**Fixed in:** `CLAUDE.md`

Command now outputs to `./src/types/supabase.ts`. The non-existent `createEnumsFile.cjs` command removed.

---

### ~~Doc3~~ ✅ FIXED — `src/types/supabase.ts` has a stale header comment

**Fixed in:** `src/types/supabase.ts`

Stale header replaced with `// Regenerate: see "Regenerate Supabase types" in CLAUDE.md`.

---

### ~~Doc4~~ ✅ FIXED — `docs/conventions/DATA.md` references helper function names that don't exist

**Fixed in:** `docs/conventions/DATA.md`

All `createBrowserClient()` / `createServerClient()` occurrences replaced with the correct `createClient()` (both client and server exports). Also resolves V10.

---

### ~~Doc5~~ ✅ FIXED — `docs/conventions/COMPONENTS.md` describes route groups that aren't implemented

**Fixed in:** `docs/conventions/COMPONENTS.md`

Route groups `(shop)`, `(protected)`, `(admin)` labeled as "intended future structure, not yet implemented". Current flat `app/` structure documented.

---

### ~~Doc6~~ ✅ FIXED — `docs/plans/modernization-plan.md` Phase 8 status is contradictory

**Fixed in:** `docs/plans/modernization-plan.md`

Phase 8 changed from ✅ Complete → 🔄 In progress with note: "UI shell exists; payment is simulated, order creation broken (schema mismatch), no email/download". Also resolves A4.

---

### ~~Doc7~~ ✅ FIXED — `docs/conventions/SCSS.md` `section-title` mixin has undocumented font dependency

**Fixed in:** `docs/conventions/SCSS.md`

`section-title` mixin annotated: Cheque `@font-face` lives in `Slider.module.scss`, not `globals.scss` — any page using the mixin without a Slider will fall back to `sans-serif` until the declaration is moved to `globals.scss`.

---

## 8. Deferred Known Gaps

These are known incomplete features that are intentionally deferred. Documented here for planning purposes.

### ~~G1~~ ✅ FIXED — Multi-product-type catalog support

**Fixed in:** `supabase/migrations/20260505000000_catalog_products.sql` + API + entity layer

Three new SQL functions: `get_catalog_books` (full catalog with all filters/sorts/pagination, unions CardBooks + Ebooks + Audiobooks + PrintedBooks, supports `title_ids` for featured books), `get_catalog_book_by_slug` (single book detail, EBook-first), and updated `search_books` (now searches all types, deduplicates per title).

`BookServerRow` rewritten as the flat RPC row shape. `normalizeBook` updated to use `raw.product_type` — `DEFAULT_CATEGORY = 'Book2.0'` hardcode removed, A1 resolved. All book API functions (`getBooks`, `getBook`, `getRelatedBooks`, `getFeaturedBooks`, `searchBooks`) now call these RPCs.

---

### G2 — No email delivery implementation

`resend` and `@react-email/components` are installed but no templates or sending logic exist. Phase 8 email delivery is unimplemented.

---

### G3 — No payment gateway integration

YooKassa credentials are in `.env.example` and CI secrets but no SDK is installed and no payment logic exists. Checkout shows a demo simulation.

---

### G4 — No admin section (Phase 10)

No admin routes, no admin auth guard, no book management UI.

---

### G5 — No order history in account

`src/app/account/page.tsx` shows "У вас пока нет заказов" as a static string. There is no order-fetching API, no normalize-order pipeline with callers, and no order history page.

---

### ~~G6~~ ✅ FIXED — Many menu links lead to non-existent routes

Added stub pages using a shared `ComingSoon` component for all 8 routes: `/about`, `/gift-cards`, `/subscription`, `/dino-magazine`, `/suggest-manuscript`, `/suggest-story-to-rd`, `/investors`, `/contacts`.

---

### ~~G7~~ ✅ FIXED — No `app/not-found.tsx`

Added styled 404 page with Cheque font "404" heading, subtitle, and link back to homepage.

---

### ~~G8~~ ✅ FIXED — No `app/checkout/failure/page.tsx`

Added failure page with error icon, message, and buttons to retry checkout or return to cart.

---

### ~~G9~~ ✅ FIXED — CI/CD workflow replaced with lint + build check

The deployment workflow (Docker build + SSH deploy) was premature — VPS infra not ready, and `update` is a feature branch that should never deploy. Replaced with a lightweight lint + build CI job that triggers on push to `update`, `main`, `staging` and on PRs targeting `main`/`staging`. Deployment steps removed entirely until infra is provisioned.

---

### ~~G10~~ ✅ FIXED — Two conflicting category enum types in the database schema

**Migration:** `supabase/migrations/20260505400000_unify_category_enum.sql`

`Workers_Products.type` altered to use the canonical `category` enum with explicit value mapping (`PrintedBook→PrintBook`, `Ebook→EBook`, `CardBook→Book2.0`). `productcategory` enum dropped. Pending `supabase db push` + types regen.

---

## 9. Dependency Audit

### Unused in `src/` (only referenced in dead code or not at all)

| Package | Status |
|---------|--------|
| `uuid` | Only used in `src/proxy.ts` — actively used for cart cookie generation |
| ~~`cookies-next`~~ | ✅ Removed — was not imported anywhere |
| ~~`date-fns`~~ | ✅ Removed — was not imported anywhere |
| `resend` | Installed for G2 email delivery; intentionally kept until implemented |
| `@react-email/components` | Same as above |

### Radix packages with no current usage

The following Radix packages are installed but have no component currently consuming them. They were pre-installed per the Phase 1 plan for future use — keeping them is intentional but worth auditing when building new features:

`@radix-ui/react-accordion`, `@radix-ui/react-switch`, `@radix-ui/react-tabs`, `@radix-ui/react-tooltip`, `@radix-ui/react-label`

### Packages to verify

| Package | Note |
|---------|------|
| `@tanstack/react-query-devtools` | Used in `providers.tsx` (dev-only, correct) |
| `sharp` | Required by `next/image` in standalone output — keep |
| `@svgr/webpack` | Used in `next.config.ts` webpack config — keep |
| `swiper` | Used in `Slider.tsx` — keep |

---

*End of audit. Use this document to create the fix plan.*
