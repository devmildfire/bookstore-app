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

The App Router migration is structurally complete — there is no `pages/` directory, all routes live under `src/app/`, conventions are largely followed, and the component library looks solid. `src/proxy.ts` (Next.js 16's correctly-named proxy file, following the v16.0.0 rename from `middleware.ts`) handles session refresh, cart cookie creation, and server-side route protection and is running correctly. However, several systems that appear to be implemented are actually broken at runtime, and the codebase contains at least one serious credential leak. The core issues cluster around three areas:

**Auth session cannot round-trip.** `loginAction` creates a Supabase session but stores it in a custom cookie (`sb-auth-token`) that `@supabase/ssr`'s `createServerClient` never reads. The server always sees the user as unauthenticated after login. Auth server actions also bypass Zod validation and use the deprecated implicit flow.

**Data fetching is not scalable.** `getBooks`, `getBook`, and `getRelatedBooks` each load the entire `CardBooks` table (up to 1000 rows) and do all filtering/pagination in JavaScript. The `search_books` RPC that does proper DB-side filtering exists but is only used by the search bar, not the catalog.

**Order creation is broken.** `createOrder` inserts against columns that don't exist in the DB schema (`total`, `delivery_method`, `delivery_email` instead of `summ`), hidden by `as any` casts. The checkout flow fails at runtime after the payment simulation step.

**Production credentials are in `.env`**, which is gitignored but has a confirmed history of being leaked. The keys need rotating.

---

## 2. Critical Bugs

### ~~C1~~ ✅ FIXED — Login session cookie is incompatible with `@supabase/ssr`

**Fixed in:** `src/lib/auth/actions.ts`

Replaced the manual `@supabase/supabase-js` client + `sb-auth-token` cookie with `createClient()` from `@/lib/supabase/server`. The `@supabase/ssr` adapter now writes and reads session cookies correctly on every auth call. `flowType: 'implicit'` removed — PKCE is the default (fixes S6 too). `logoutAction` now calls `supabase.auth.signOut()` instead of manually deleting the old cookie.

---

### ~~C2~~ ✅ FIXED — `getBooks` fetches the entire catalog and filters in JavaScript

**Fixed in:** `src/api/books/getBooks.ts`

Replaced `.limit(1000)` + JS `filterBooks`/`sortBooks` with DB-side filtering. Price filters use `.gte`/`.lte`, sort uses `.order()` (with `referencedTable: 'Titles'` for title sort), pagination uses `.range()` with `count: 'exact'` for total. Author filter resolves to `title_id` list via a preliminary `Authors` query. Search uses `.filter('Titles.name', 'ilike', ...)` (title-only; header bar covers title+author via `search_books` RPC). Authors list for the filter dropdown comes from a parallel `Authors` query instead of being derived from the loaded rows.

---

### ~~C3~~ ✅ FIXED — `getBook` fetches ALL books to find one by slug

**Fixed in:** `src/api/books/getBook.ts`

Query now uses `.filter('Titles.slug', 'eq', slug).limit(1)` — fetches exactly one row from the DB instead of the full catalog.

---

### ~~C4~~ ✅ FIXED — `getRelatedBooks` fetches ALL books for every book detail page

**Fixed in:** `src/api/books/getBook.ts`

Now uses `.limit(limit)` with DB-side date ordering. The JS category-preference logic was removed — it was a no-op since all books share the same category (A1), and with proper DB pagination it would have been broken anyway.

---

### ~~C5~~ ✅ FIXED — `createOrder` inserts columns that don't exist in the `Orders` schema

**Fixed in:** `src/api/orders/createOrder.ts`

Column mapping corrected: `total` → `summ`, `delivery_email` → `email`, `delivery_method` removed (no such column). `OrderItems` insert corrected: `book_id` removed, `category` → `type`, `summ` (line total) and `discount` added. Both inserts now use generated `DbOrderInsert` / `DbOrderItemInsert` types — no `as any` casts. Also removes two of the four V1 `as any` instances.

Note: order creation still runs client-side with the anon key (S2 — deferred).

---

### C6 ⚠️ Cart queries have no explicit user filter — correctness depends entirely on unverified RLS

**File:** `src/api/cart/getCart.ts:11`

```ts
const { data, error } = await supabase.from('Cart').select('*')
```

No WHERE clause. User isolation depends entirely on Supabase RLS policies keyed to the current auth context. The proxy sets the cart cookie and the anon session is established, so RLS does receive an auth context — but the Cart RLS policies are not present in the migration files in this repo and therefore cannot be audited or verified here. If a policy is misconfigured or missing, any authenticated user could read or mutate another user's cart.

The `Cart` table schema (from generated types) has no `user_id` column — the user link is implicit through RLS, which is not visible in the repo migrations and has not been verified.

---

### ~~C7~~ ✅ FIXED — `checkout/success/page.tsx` calls `useSearchParams()` without `Suspense`

**Fixed in:** `src/app/checkout/success/`

Extracted `useSearchParams` logic into `CheckoutSuccessContent.tsx` (Client Component). `page.tsx` is now a Server Component that wraps it in `<Suspense>`.

---

## 3. Architecture Issues

### A1 🟠 Category is hardcoded as `'Book2.0'` for every book

**File:** `src/entities/book/normalize.ts:5`

```ts
const DEFAULT_CATEGORY = 'Book2.0'
```

The `CardBooks` table has no `category` column. `normalizeBook` assigns `DEFAULT_CATEGORY` to every book regardless of type.

**Consequence:** The category filter on the catalog page is completely non-functional — all books are Book2.0, so filtering by any other category returns zero results, and selecting "all" is the only working option. The `categories` array derived in `getBooks.ts` will always be `['Book2.0']`.

---

### A2 🟠 Dead import in root layout

**File:** `src/app/layout.tsx:4`

```ts
import { createDataClient } from '@/lib/supabase/server'
```

`createDataClient` is imported but never used. Only `createClient` (line 3) is used.

---

### A3 🟡 Homepage double-fetches the full catalog

**File:** `src/app/page.tsx:18-28`

`getBooks()` is called with default filters (all books, page 1) to populate the `NewProducts` section. This fires the same full-catalog scan as C3. The `NewProducts` section should use a targeted "newest N books" query rather than the full `getBooks` function.

---

### A4 🟡 `checkout/page.tsx` marks Phase 8 complete but key requirements are unimplemented

The modernization plan shows Phase 8 (Checkout & Delivery) as ✅ Complete in the progress table, but every checklist item is unchecked:
- Payment is simulated with `setTimeout(1500)` — no YooKassa integration
- No download link generation (Supabase Storage signed URL)
- No email delivery (Resend)
- Order creation is broken (C6)

The plan's status tracking and the actual implementation are contradictory.

---

### A5 🟡 `BooksError` is missing the required `error` prop

**File:** `src/app/books/error.tsx`

The error boundary convention (`docs/conventions/ERROR_HANDLING.md`) requires:

```ts
type Props = {
  error: Error & { digest?: string }
  reset: () => void
}
```

The current implementation only accepts `reset`. The `error` object (including the `digest` for server-side error correlation) is silently dropped.

---

### A6 🟡 Cart migration on login is a stub

**File:** `src/lib/auth/actions.ts:72-74`

`migrateCartAction` has an empty body. Anonymous cart items are lost on login. The modernization plan Phase 7 checkbox "Cart migration on login" is unchecked.

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

### V10 🟡 `docs/conventions/DATA.md` names the Supabase helpers inconsistently

`DATA.md` examples use `createBrowserClient` and `createServerClient` as function names, but the actual files export `createClient` (both `src/lib/supabase/client.ts` and `server.ts`). The naming mismatch will confuse developers following the docs.

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

### Doc1 🔴 `AGENTS.md` / `CLAUDE.md` is significantly outdated

The main project documentation file describes the old Pages Router architecture. Key inaccuracies:

| Claim in AGENTS.md | Actual state |
|-------------------|-------------|
| "Next.js 14 (Pages Router)" | Next.js 16.2.4, App Router |
| "Tailwind CSS + shadcn/ui + styled-components (legacy, being phased out)" | None of these are in the codebase; SCSS Modules only |
| "MobX (`makeAutoObservable`) for client state" | Not in dependencies |
| "Redux Toolkit present as a dependency but not actively used" | Not in dependencies |
| "`api/` Supabase client + typed API modules (NOT Next.js API routes — those live in `pages/api/`)" | API modules are now in `src/api/`; `pages/api/` doesn't exist |
| `i18n.locales: ['ru']` | App Router doesn't use the `i18n` config key |
| Directory listing references `pages/`, `src/store/`, `src/mocks/`, `src/layouts/` | None of these exist |
| "External API modules are imported as `api/...` (no alias)" | Now in `src/api/`, imported as `@/api/...` |
| Supabase types regeneration command outputs to `"./api/books/types.ts"` | Should output to `"./src/types/supabase.ts"` |
| `node --env-file .env ./src/utils/createEnumsFile.cjs` | This file does not exist |
| State management pattern describes MobX singleton stores | No MobX in codebase |

---

### Doc2 🟠 Supabase types regeneration command is wrong

**File:** `AGENTS.md` (commands section)

```bash
supabase gen types typescript --db-url "..." > "./api/books/types.ts"
```

The output path is from the Pages Router era. The generated types now live at `src/types/supabase.ts`. The second command (`createEnumsFile.cjs`) references a file that doesn't exist in `src/utils/`.

---

### Doc3 🟡 `src/types/supabase.ts` has a stale header comment

**File:** `src/types/supabase.ts:1-3`

```ts
// Recovered from git history — regenerate with the command in AGENTS.md when DB is accessible.
// Last generated: 2025 (pre-rewrite)
```

The types have since been updated (the `featured_books` table is in the file). This comment is misleading. It should either be removed or updated to reflect the current state.

---

### Doc4 🟡 `docs/conventions/DATA.md` references helper function names that don't exist

The file shows `createBrowserClient()` and `createServerClient()` as the function names to use. The actual exported names are both `createClient()` (one from `@/lib/supabase/client`, one from `@/lib/supabase/server`). The convention doc also implies a `src/lib/supabase/client.ts` and `server.ts` structure that matches reality, but the function names are wrong throughout.

---

### Doc5 🟡 `docs/conventions/COMPONENTS.md` describes route groups that aren't implemented

The layout section shows `app/(shop)/`, `app/(protected)/`, `app/(admin)/` route groups. The actual app has a flat `app/` structure with no route groups. This is a forward-looking pattern that isn't in place yet — the convention doc should note it as the intended target.

---

### Doc6 🟡 `docs/plans/modernization-plan.md` Phase 8 status is contradictory

The progress table marks Phase 8 (Checkout & Delivery) as ✅ Complete. Every checklist item under Phase 8 is unchecked (`[ ]`). The checkout page exists but contains a payment simulation stub, not real implementation.

---

### Doc7 🟡 `docs/conventions/SCSS.md` references `globals.scss` imported in `app/layout.tsx`

The SCSS doc says globals are imported "once in `app/layout.tsx`". This is correct. ✓

The doc also mentions a `section-title` mixin described as "Cheque display heading at 57px with full responsive scaling". The `Cheque` font files exist (`public/fonts/Chequeblack.ttf`, `Chequeregular.ttf`) and a `@font-face` declaration does exist — but it lives inside `src/components/common/Slider/Slider.module.scss` rather than `globals.scss`. This means the font is only guaranteed to load when the Slider component renders. Any page using `@include section-title` without a Slider will silently fall back to `sans-serif`. The `@font-face` declaration should be moved to `globals.scss`.

---

## 8. Deferred Known Gaps

These are known incomplete features that are intentionally deferred. Documented here for planning purposes.

### G1 — Database schema covers only `CardBooks` product type

The DB schema has tables for all product types: `CardBooks`, `Ebooks`, `Audiobooks`, `PrintedBooks`, `BoxSets`, `Subscriptions`, `Courses`, `Magazines`, `E_Magazine_Issues`. The API layer queries only `CardBooks`. Category normalization hardcodes `'Book2.0'` (A1).

When multi-product support is added, the entity/API layer will need:
- A unified product abstraction or per-type entity modules
- A category discriminator in normalize functions
- Updated `BookServerRow` type to accommodate multiple table schemas

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
