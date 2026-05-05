# Codebase Audit — chtivo-next

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

**Issues fixed since initial audit:** C1–C5, C7 (all critical bugs), A1–A5 (architecture), S6, G1 (multi-product-type catalog), Doc1–Doc7 (documentation), and C6/A6 (Cart user isolation migration added).

**Remaining open issues** cluster around four areas:

**Security (S1–S5):** Production credentials in `.env` need rotating (S1 — cannot fix in code). `createOrder` runs client-side with anon key — no server-side price validation (S2). Auth actions lack Zod input validation (S3). `dangerouslyAllowLocalIP: true` is active in production (S4). Account page redirects anonymous users client-side causing a flash (S5).

**Convention violations (V1–V9):** Remaining `as any` casts (V1), forms bypass React Hook Form + Zod (V2), header auth state display (V3), accessibility regressions in focus handling and ARIA (V4, V8), and several smaller UI/type issues (V5–V7, V9).

**Dead code (D1–D9):** Empty `utils/` directory, stale `.gitkeep` files, vestigial docs, test assets, unused entity layer, tracked build artifact.

**Deferred gaps (G2–G10):** Email delivery, payment gateway, admin section, order history, missing routes/pages, CI/CD targeting wrong branch, conflicting DB enums.

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
- `migrate_cart(from_user_id, to_user_id)` SECURITY DEFINER function: merges anonymous cart items into the authenticated user's cart on login, with per-call auth check (`to_user_id = auth.uid()`)

`loginAction` now captures the anonymous user's ID before `signInWithPassword`, then calls `migrateCartAction` best-effort after sign-in. `registerAction` now calls `supabase.auth.updateUser({ email, password })` for anonymous sessions — upgrades in-place, keeping the same UID so the cart survives without any migration.

**Note:** Supabase types must be regenerated after this migration is applied to pick up the new `user_id` column and `migrate_cart` RPC in TypeScript.

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

**Fixed in:** `src/lib/auth/actions.ts`, `supabase/migrations/20260505100000_cart_user_isolation.sql` (C6 fix)

`migrateCartAction(fromUserId)` is now implemented: calls the `migrate_cart` SECURITY DEFINER RPC which merges cart items from the anonymous user into the authenticated user, merging quantities on conflict.

`loginAction` captures the anonymous UID before `signInWithPassword` and calls `migrateCartAction` best-effort after sign-in. `registerAction` uses `supabase.auth.updateUser()` for anonymous sessions (in-place upgrade, same UID, no migration needed) and falls back to `signUp()` for non-anonymous sessions.

---

### A7 🟡 `featured_books` RLS policy uses deprecated `auth.role()` syntax

**File:** `supabase/migrations/20260504100000_featured_books.sql:21`

```sql
USING (auth.role() = 'authenticated')
```

`auth.role()` is deprecated in Supabase. Modern syntax: `auth.uid() IS NOT NULL`. The deprecated form may stop working in future Supabase versions.

---

### A8 🟡 `search_books` RPC uses `ILIKE '%term%'` — no full-text index

**File:** `supabase/migrations/20260504000000_search_books_rpc.sql:59-68`

`ILIKE '%' || search_term || '%'` requires a sequential scan on `Titles` and `Authors`. As the catalog grows this will become slow. A `tsvector`/`tsquery` GIN index would scale properly.

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

### S2 🟠 `createOrder` is called from a Client Component via browser Supabase

**File:** `src/app/checkout/page.tsx:46`, `src/api/orders/createOrder.ts`

Order creation runs in the browser using the anon key Supabase client. There is no server-side validation of cart contents, pricing, or ownership. Any authenticated user can craft a Supabase insert to create arbitrary order records. Order creation must move to a Server Action with validation.

---

### S3 🟠 Auth Server Actions have no input validation

**File:** `src/lib/auth/actions.ts:12-25`, `47-64`

`loginAction` and `registerAction` read form fields with `formData.get('email') as string` and pass them directly to Supabase. There is no Zod validation. The HTML `minLength=6` on the register password input is client-only and trivially bypassed.

---

### S4 🟠 `dangerouslyAllowLocalIP: true` is in the production image config path

**File:** `next.config.ts:8`

```ts
dangerouslyAllowLocalIP: true,
```

This option is not gated by `isProduction` (unlike `basePath`/`assetPrefix`). It is active in the production Docker image, potentially allowing SSRF via `next/image` to internal network addresses.

---

### S5 🟡 Account page redirects anonymous users client-side — flash-of-content for anonymous sessions

**File:** `src/app/account/page.tsx:15-19`

The proxy correctly blocks truly unauthenticated requests to `/account` at the server level. However, users who hold an anonymous Supabase session (`is_anonymous === true`) pass the proxy check and reach the page. The page then detects them via `useEffect` and redirects client-side. This means the server-rendered HTML is briefly visible before the redirect fires — a flash-of-unauthorized-content that also leaks the page structure to anonymous users.

The correct fix is to read the session in the Server Component and call `redirect()` server-side before any HTML is rendered.

---

### ~~S6~~ ✅ FIXED — `loginAction` used deprecated `flowType: 'implicit'`

Resolved as part of the C1 fix — `flowType: 'implicit'` removed along with the manual client. `@supabase/ssr` defaults to PKCE.

---

## 5. Convention Violations

### V1 🟡 Remaining `as any` casts violate the no-any rule

| File | Cast | Fix |
|------|------|-----|
| `src/api/books/searchBooks.ts` | `(supabase.rpc as any)('search_books', ...)` | Regenerate Supabase types to include the RPC |
| `src/api/cart/addToCart.ts` | `category: item.category as any` | Align Cart insert type with `ProductCategory` enum |

The two `createOrder.ts` casts were removed as part of C5. The `searchBooks.ts` cast will be eliminated when Supabase types are regenerated after the `search_books` migration is applied.

---

### V2 🟠 Auth and checkout forms bypass React Hook Form + Zod

The convention (`docs/conventions/COMPONENTS.md`, Forms section) requires React Hook Form + Zod for all forms.

| File | Issue |
|------|-------|
| `src/app/auth/login/page.tsx` | Plain HTML `<form>` with no RHF/Zod |
| `src/app/auth/register/page.tsx` | Plain HTML `<form>` with no RHF/Zod |
| `src/app/checkout/page.tsx` | Delivery email is a bare `<input>` with `useState`, no validation |

---

### V3 🟡 Header profile button always shows logout regardless of auth state

**File:** `src/components/layout/Header/Header.tsx:70-76`

```tsx
{!isLoading && (
  <form action={logoutAction}>
    <button type='submit' className={styles.iconBtn} aria-label='Выйти'>
      <Profile className={styles.profile}/>
    </button>
  </form>
)}
```

Anonymous (unauthenticated) users see a logout button. It should be a Login link for anonymous users and an account/logout dropdown for authenticated ones.

---

### V4 🟡 Focus outlines were removed from header navigation without `:focus-visible` replacement

**Commit:** `b4d5ec8 remove all focus outlines from header nav`

This directly violates WCAG 2.1 AA and the convention: *"Do not suppress the default focus outline — style it in SCSS instead of removing it."* Keyboard navigation through the header is inaccessible.

---

### V5 🟡 `classnames` (`cn`) not used for conditional classes in checkout

**File:** `src/app/checkout/page.tsx:68`

```tsx
className={`${styles.step} ${step === 'review' ? styles.active : styles.done}`}
```

Convention requires `cn()` for all conditional class composition.

---

### V6 🟡 `NewProducts` wraps a `<button>` inside a `<Link>`

**File:** `src/components/book/NewProducts/NewProducts.tsx:24-27`

```tsx
<Link href="/books">
  <button type="button" className={styles.button}>
    Перейти в книжную лавку
  </button>
</Link>
```

Nesting an interactive element inside another interactive element is invalid HTML and creates accessibility issues. Use `<Link href="/books" className={styles.button}>` directly.

---

### V7 🟡 Book cover `alt` text doesn't match the accessibility convention

Convention (`docs/conventions/SEO.md`): *"Meaningful content: descriptive alt text in Russian: `alt='Обложка книги: {title}'`"*

| File | Current | Expected |
|------|---------|----------|
| `src/components/book/BookCard/BookCard.tsx:34` | `alt={book.name}` | `alt={'Обложка книги: ' + book.name}` |
| `src/components/common/Slider/Slider.tsx:49` | `alt={item.title}` | `alt={'Обложка книги: ' + item.title}` |
| `src/app/books/[slug]/page.tsx:67` | `alt={'Обложка книги: ' + book.name}` | ✓ Correct |

---

### V8 🟡 `aria-expanded` is hardcoded `false` on dropdown triggers

**File:** `src/components/layout/Header/Header.tsx:129`

```tsx
<button className={styles.navTrigger} aria-expanded='false' aria-haspopup='menu'>
```

`aria-expanded` is static and never reflects the actual open state. Radix `DropdownMenu.Trigger` manages this automatically — the custom attribute should be removed.

---

### V9 🟡 `AddToCartButton` uses `category: string` instead of `ProductCategory`

**File:** `src/app/books/[slug]/AddToCartButton.tsx:8`

The `category` prop is typed as `string`, losing the enum constraint. Should be `ProductCategory` from `@/types/database`.

---

### ~~V10~~ ✅ FIXED — `docs/conventions/DATA.md` names the Supabase helpers inconsistently

**Fixed in:** `docs/conventions/DATA.md` (Doc4 fix) — all helper names corrected to `createClient()`.

---

## 6. Dead Code & Vestigial Files

### D1 🟠 `src/utils/` directory is empty

Only contains `.gitkeep`. The convention docs reference utilities in this directory. The directory should either have files or the `.gitkeep` should be noted as a placeholder.

---

### D2 🟠 `.gitkeep` files remain in directories that now have real content

| Directory | Has files? |
|-----------|-----------|
| `src/api/` | ✓ Yes — remove `.gitkeep` |
| `src/entities/` | ✓ Yes — remove `.gitkeep` |
| `src/hooks/` | ✓ Yes — remove `.gitkeep` |
| `src/lib/` | ✓ Yes — remove `.gitkeep` |
| `src/types/` | ✓ Yes — remove `.gitkeep` |
| `src/utils/` | ✗ No files | keep |
| `src/components/common/` | ✓ Yes — remove `.gitkeep` |

---

### D3 🟡 `docs/old-components-exports/` — vestigial migration documentation

The migration from Pages Router is done. This directory contains planning notes referencing the old codebase (`pages/index.tsx`, `pages/books.tsx`, styled-components code) that no longer exist. Can be deleted.

---

### D4 🟡 `public/images/` contains apparent development/test assets

Files with names like `test_flower.png`, `hand_goat.png`, `bookTitleAristotle.jpg`, `bookTitleDeleted.jpg`, `bookTitleDeleted_BookPage.jpg`, `trailerScreenShot.png` appear to be leftover from development. Verify none are referenced by current code before deleting.

---

### D5 🟡 `public/video/` and `public/videos/` — duplicate directory naming

Two separate directories (`video/` and `videos/`) contain video files. This looks like an accidental duplication. Verify which directory is actually referenced and consolidate.

---

### D6 🟡 `src/entities/order/normalize.ts` is not used anywhere

No API function calls `normalizeOrder` or `normalizeOrderItem`. There is no order-fetching API function (account page shows "no orders" as static text). The entire order entity layer has no callers.

---

### D7 🟡 `tsconfig.tsbuildinfo` is tracked in git despite being gitignored

The `.gitignore` lists `tsconfig.tsbuildinfo`, but the file appears in the working tree. Run `git rm --cached tsconfig.tsbuildinfo` to untrack it.

---

### D8 🟢 `docs/plans/modernization-plan.md` — stale AI planning document

This document was generated to guide the rewrite. Now that the rewrite is largely done, it's outdated (Phase 8 claimed complete but unimplemented, etc.). It references paths like `/home/mildfire/repos/AADS/v3frontend` which are local machine paths. Should be cleaned up or archived.

---

### D9 🟢 `.aider.chat.history.md` and `.aider.input.history` are tracked in git

These are Aider (AI coding assistant) history files. They are gitignored (via `.aider*` in `.gitignore`) but appear to be present. Confirm they are not committed: run `git ls-files .aider*`.

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

### G6 — Many menu links lead to non-existent routes

The following links in `src/consts/menuItems.ts` point to pages that don't exist:

`/about`, `/gift-cards`, `/subscription`, `/dino-magazine`, `/suggest-manuscript`, `/suggest-story-to-rd`, `/investors`, `/contacts`

All will 404. Add `not-found.tsx` at root at minimum, and stub pages or disable the menu items until pages are built.

---

### G7 — No `app/not-found.tsx`

No global 404 page. Next.js will use its default, which is English-language and unstyled.

---

### G8 — No `app/checkout/failure/page.tsx`

The plan specifies a failure/retry page but it doesn't exist. Payment simulation only handles the success case.

---

### G9 — CI/CD triggers on `develop` branch, active branch is `update`

**File:** `.github/workflows/docker-publish.yml:5`

```yaml
on:
  push:
    branches: ['develop']
```

The active development branch (`update`) will never trigger CI. The workflow also runs `docker stop chtivo-next` without a `|| true` guard, which will fail on first deploy (container doesn't exist yet). The `docker run` command has no env var injection — the application's env vars would not be available in production containers.

---

### G10 — Two conflicting category enum types in the database schema

The schema has two enums with overlapping but inconsistent values:
- `category`: `PrintBook | AudioBook | EBook | Book2.0 | GiftCard | BoxSet | Subscription | Course`
- `productcategory`: `PrintedBook | AudioBook | Ebook | CardBook`

`productcategory` is used only in `Workers_Products`. The naming differs (`PrintBook` vs `PrintedBook`, `EBook` vs `Ebook`, `Book2.0`/`CardBook` naming inconsistency). This should be resolved to a single canonical enum.

---

## 9. Dependency Audit

### Unused in `src/` (only referenced in dead code or not at all)

| Package | Status |
|---------|--------|
| `uuid` | Only used in `src/proxy.ts` — actively used for cart cookie generation |
| `cookies-next` | Not imported anywhere in `src/` |
| `date-fns` | Not imported anywhere in `src/` |
| `resend` | Installed for Phase 8 email; no implementation yet (G2) |
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
