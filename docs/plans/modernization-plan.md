# Modernization Plan: bookstore-app

> **For models resuming this work**: Start here. Check the [Progress Tracker](#progress-tracker) to find the current phase, then work through that phase's checklist top-to-bottom. Mark each checkbox as you complete it. Do not begin the next phase until the current one is fully checked off.

---

## Overview

**What**: Full clean rewrite of a Next.js 13 (Pages Router) web bookstore into a modern Next.js 16+ (App Router) application.

**Why**: The original codebase uses deprecated architecture (Pages Router, styled-components, MobX), has known security vulnerabilities in the framework version, and was abandoned. The rewrite targets a clean, maintainable stack for use as a portfolio showcase.

**Goal**: A working Russian-locale online bookstore with book catalog, persistent cart, simulated checkout, optional auth, and eBook delivery — deployed on a personal VPS and showcased at `devmildfire.net/bookstore-app`.

**GitHub**: `https://github.com/devmildfire/bookstore-app`

---

## Tech Stack

### Approved Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.2.4+ (App Router, Server Components) |
| Language | TypeScript (strict mode) |
| Styling | SCSS Modules — conventions from `v3frontend` (see below) |
| Headless UI Primitives | Radix UI (`@radix-ui/react-*`) |
| Server State | TanStack Query v5 (`@tanstack/react-query`) |
| Client State | React Context + URL search params; Zustand only if genuinely needed |
| Forms | React Hook Form + Zod + `@hookform/resolvers` |
| Database / Auth | Supabase — `@supabase/supabase-js` + `@supabase/ssr` |
| Email Delivery | Resend + React Email (verify free tier: 3,000 emails/month, 100/day) |
| Payments | YooKassa (UKassa) — test mode only, no real transactions |
| Locale | Russian only (`ru`) — English + `next-i18n` planned as separate future work |

### Explicitly Banned

> These must never be introduced to this project. If any PR or AI model suggests them, reject the suggestion.

| Technology | Reason |
|-----------|--------|
| **Tailwind CSS** | Expressly forbidden by project owner. Use SCSS modules only. |
| **styled-components** | Incompatible with Next.js App Router SSR/RSC model. |
| **MobX** | Replaced by TanStack Query + React Context. |
| **Redux / Redux Toolkit** | Overkill; not needed for this scope. |
| **shadcn/ui** | Requires Tailwind. Use Radix UI primitives directly instead. |
| **Pages Router** | Rewrite exclusively targets App Router. |

---

## Architecture Decisions

### Rendering Strategy

- **Book catalog, book detail pages** — React Server Components; TanStack Query for client-side transitions
- **Cart, checkout, auth UI** — Client Components
- **Filters** — state lives in URL search params (bookmarkable, shareable)
- **Admin section** — Client Components, protected route (lowest priority)

### SCSS Module Conventions

Follow the pattern established in `/home/mildfire/repos/AADS/v3frontend`:

- `src/styles/params.scss` — all SCSS variables: colors, fonts, shadows, spacing
- `src/styles/breakpoints.scss` — `@mixin breakpoint($point)` with three breakpoints:
  - `desktop`: `min-width: 1201px`
  - `tablet`: `max-width: 1200px`
  - `phone`: `max-width: 767px`
- `src/styles/common.scss` — barrel file: `@forward 'params'; @forward 'breakpoints';`
- `src/styles/globals.scss` — CSS reset, base typography, CSS custom properties for theming
- Per-component `.module.scss` files live alongside the component file

### Cart and Auth Flow

```
First visit
  → set HttpOnly cookie: bookstore_cart_id (UUID v4, SameSite=Lax, Secure in prod)
  → create anonymous Supabase session (signInAnonymously)
  → create `carts` row in DB linked to cartId cookie

Add to cart
  → append to `cart_items` (no login required)

Checkout
  → payment simulation (YooKassa test mode)
  → delivery choice:
      A) Download  — generate signed Supabase Storage URL, redirect to download
      B) Email     — collect email (no account required), send via Resend with eBook attachment
  → create `orders` + `order_items` rows on payment success
  → optional upsell: "Create an account to track your orders"

Register / Login
  → anonymous cart migrates to user account
  → Supabase RLS roles: anon | authenticated | admin
```

### Deployment Target (Phase 11)

- VPS — Docker containers for staging and prod (same machine, different ports)
- NGINX — reverse proxy + SSL termination (Let's Encrypt)
- Prod:    `https://devmildfire.net/bookstore-app`
- Staging: `https://stg.devmildfire.net/bookstore-app`
- `next.config.ts`: `basePath: '/bookstore-app'`, `assetPrefix: '/bookstore-app'`, `output: 'standalone'`
- CI via GitHub Actions (lint/typecheck on PR, auto-deploy to staging on `main` merge, prod on tagged release)

---

## Progress Tracker

Update status as you work. A phase is complete only when every checkbox in its section is checked.

| # | Phase | Status | Notes |
|---|-------|--------|-------|
| 1 | Project Setup & Foundation | 🔲 Not started | |
| 2 | SCSS Design System | 🔲 Not started | |
| 3 | Database & Auth Layer | 🔲 Not started | |
| 4 | Core UI Components | 🔲 Not started | |
| 5 | Book Catalog & Filters | 🔲 Not started | |
| 6 | Book Detail Page | 🔲 Not started | |
| 7 | Cart System | 🔲 Not started | |
| 8 | Checkout & Delivery | 🔲 Not started | |
| 9 | User Auth & Account | 🔲 Not started | |
| 10 | Admin Section | 🔲 Not started | Lowest priority — do last |
| 11 | CI/CD & Deployment | 🔲 Not started | Future work |
| 12 | Testing Suite & Health Checks | 🔲 Not started | Future work |

**Status legend**: 🔲 Not started · 🔄 In progress · ✅ Complete · ⚠️ Blocked

---

## Phase 1 — Project Setup & Foundation

**Goal**: Clean Next.js 16.2.4+ project with all tooling in place, no legacy or banned dependencies.

- [ ] Initialize project: `npx create-next-app@latest . --typescript --app --no-tailwind --no-eslint`
- [ ] Confirm `next` version ≥ 16.2.4 in `package.json`
- [ ] Configure `tsconfig.json`: `strict: true`, path alias `@/*` → `src/*`
- [ ] Install and configure ESLint with Next.js recommended config
- [ ] Set up husky + lint-staged: pre-commit runs lint on `.ts .tsx .js .jsx`
- [ ] Install core dependencies:
  - `sass`
  - `@supabase/supabase-js` `@supabase/ssr`
  - `@tanstack/react-query` `@tanstack/react-query-devtools`
  - `react-hook-form` `zod` `@hookform/resolvers`
  - `resend` `@react-email/components`
  - Radix UI packages as needed per phase (install per-component)
- [ ] Remove any auto-generated Tailwind/PostCSS files (`tailwind.config.*`, `postcss.config.*`)
- [ ] Create `next.config.ts` with `basePath`, `assetPrefix`, `i18n` (`locales: ['ru']`), `output: 'standalone'`
- [ ] Create `.env.local.example` documenting all required environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RESEND_API_KEY`
  - `YUKASSA_SHOP_ID`
  - `YUKASSA_SECRET_KEY`
  - `NEXT_PUBLIC_BASE_URL`
- [ ] Create `src/` directory skeleton (see CLAUDE.md architecture section)
- [ ] Confirm `npm run build` passes on the empty project

---

## Phase 2 — SCSS Design System

**Goal**: Extract the current app's visual identity into SCSS tokens; establish the module system all subsequent components will use.

- [ ] Inspect the current live app (or legacy codebase) and document the color palette, typography, spacing, and shadows
- [ ] Create `src/styles/params.scss`:
  - Color variables (`$color-*`, semantic aliases)
  - Typography: font families, sizes, weights, line-heights
  - Spacing scale
  - Border radius values
  - Box shadow presets
  - Z-index scale
  - CSS custom property declarations for theming (`--variable: value`)
- [ ] Create `src/styles/breakpoints.scss` with `@mixin breakpoint($point)` (desktop / tablet / phone)
- [ ] Create `src/styles/common.scss`: `@forward 'params'; @forward 'breakpoints';`
- [ ] Create `src/styles/globals.scss`: CSS reset, base `body`/`html` styles, root CSS custom properties
- [ ] Configure `next.config.ts` `sassOptions.additionalData` to auto-import `common.scss` in all modules (or document explicit `@use` pattern — pick one and stick to it)
- [ ] Verify a sample `.module.scss` file can use `$variables` and `@include breakpoint()` without extra imports

---

## Phase 3 — Database & Auth Layer

**Goal**: Supabase client wiring, type generation, anonymous session bootstrap, cookie cart, RLS confirmation.

- [ ] Create `src/lib/supabase/client.ts` — browser client via `createBrowserClient` from `@supabase/ssr`
- [ ] Create `src/lib/supabase/server.ts` — server client via `createServerClient` (Next.js cookies)
- [ ] Create `src/middleware.ts` — refresh Supabase session on every request; protect `/account/*` and `/admin/*` routes
- [ ] Regenerate Supabase types: `supabase gen types typescript --db-url "..." > src/types/supabase.ts` (command in CLAUDE.md)
- [ ] Create `src/types/database.ts` — re-export generated types; add client-facing normalized interfaces
- [ ] Implement anonymous session bootstrap (runs once on first visit, server-side):
  - `supabase.auth.signInAnonymously()` if no session
  - Generate `bookstore_cart_id` UUID cookie if absent
  - Insert `carts` row in DB linked to cookie
- [ ] Set up TanStack Query `QueryClientProvider` in `src/app/layout.tsx`
- [ ] Create `src/hooks/useSupabaseUser.ts` — reactive current user hook
- [ ] Create `src/lib/auth/` — helpers: `login`, `register`, `logout`, `migrateCart` (anon → user)
- [ ] Review and verify Supabase RLS policies:
  - Anon: read books, read/write own cart rows
  - Authenticated: read/write own orders, own account
  - Admin: full access

---

## Phase 4 — Core UI Components

**Goal**: Radix-based component library styled with SCSS modules, visually matching the current app.

Each component: implement Radix primitive + `.module.scss`, match current app's visual style.

- [ ] `Button` — variants: primary, secondary, ghost, danger; loading state
- [ ] `Input` — text and password; error state; label
- [ ] `Textarea`
- [ ] `Select` — Radix `Select` primitive
- [ ] `Checkbox` — Radix `Checkbox` primitive
- [ ] `Dialog` — Radix `Dialog` primitive (modal)
- [ ] `Popover` — Radix `Popover` primitive
- [ ] `Toast` — Radix `Toast` primitive (success / error notifications)
- [ ] `Badge` — price, category, availability tags
- [ ] `Spinner` — inline loading indicator
- [ ] `Skeleton` — loading placeholder for cards and text
- [ ] `Pagination`
- [ ] `BookCard` — cover image, title, author, price, add-to-cart button
- [ ] `PageLayout` — outer shell: header + main content + footer
- [ ] `Header` — logo, navigation, cart icon with item count, auth buttons
- [ ] `Footer`

---

## Phase 5 — Book Catalog & Filters

**Goal**: `/books` page with server-rendered catalog and URL-param-driven filters.

- [ ] Configure root redirect: `/` → `/books` (via `next.config.ts` redirect or `app/page.tsx`)
- [ ] Create `src/entities/book/server.ts` — Supabase query definitions and inferred server types
- [ ] Create `src/entities/book/client.ts` — normalized frontend interface
- [ ] Create `src/entities/book/normalize.ts` — server → client transform
- [ ] Create `src/entities/book/validation.ts` — Zod schemas
- [ ] Create `api/books/` — query functions wrapping Supabase calls
- [ ] `app/books/page.tsx` — Server Component; fetches initial book list; passes to client grid
- [ ] `app/books/layout.tsx` — catalog layout with filter sidebar
- [ ] `BookGrid` component — responsive grid of `BookCard`
- [ ] `FiltersPanel` component — genre, price range, author; state via URL search params
- [ ] `SearchBar` — client component; filters by title / author
- [ ] Sorting controls — price asc/desc, newest first
- [ ] `app/books/loading.tsx` — skeleton grid
- [ ] `app/books/error.tsx`
- [ ] Configure `next/image` for Supabase Storage book covers

---

## Phase 6 — Book Detail Page

**Goal**: `/books/[id]` full book page with add-to-cart.

- [ ] `app/books/[id]/page.tsx` — Server Component
- [ ] Display: cover image, title, author, description, genre tags, price
- [ ] "Add to cart" button — Client Component island
- [ ] Related books section (same genre, excluding current)
- [ ] Breadcrumb navigation
- [ ] `generateMetadata()` for SEO (title, description, og:image)
- [ ] `app/books/[id]/loading.tsx`
- [ ] `app/books/[id]/error.tsx`

---

## Phase 7 — Cart System

**Goal**: Cookie-persisted cart, DB-backed, fully functional without login.

- [ ] `CartContext` — React Context providing cart items, totals, item count, add/remove/update actions
- [ ] TanStack Query hooks for cart read/write against Supabase `cart_items` table
- [ ] Cookie middleware — ensure `bookstore_cart_id` is set on every request
- [ ] `app/cart/page.tsx` — cart page
- [ ] `CartItemRow` component — thumbnail, title, price, quantity controls, remove button
- [ ] Cart totals and "Proceed to checkout" button
- [ ] Optimistic updates on add/remove for instant UI feedback
- [ ] Cart migration on login: transfer `cart_items` from anonymous cart to user account
- [ ] Cart icon in Header shows live item count

---

## Phase 8 — Checkout & Delivery

**Goal**: Simulated payment flow → eBook delivery by download or email.

- [ ] `app/checkout/page.tsx` — multi-step checkout (Client Component)
- [ ] Step 1 — Order summary: items list, total price
- [ ] Step 2 — Payment: integrate YooKassa test SDK; simulate success / failure
- [ ] On payment success:
  - Create `orders` + `order_items` rows in Supabase
  - Clear cart
- [ ] Step 3 — Delivery choice:
  - **Download**: generate signed Supabase Storage URL (time-limited); trigger file download
  - **Email**: email input field (no account required); send via Resend with eBook attached
- [ ] `app/checkout/success/page.tsx` — confirmation, download link, optional registration upsell
- [ ] `app/checkout/failure/page.tsx` — error message, retry button
- [ ] React Email template: order receipt + eBook attachment
- [ ] Resend integration: `src/lib/email/sendOrderEmail.ts`
- [ ] Verify Resend free tier supports file attachments at eBook file sizes

---

## Phase 9 — User Auth & Account

**Goal**: Optional registration/login; order history for registered users.

- [ ] `app/auth/login/page.tsx` — email + password login form (React Hook Form + Zod)
- [ ] `app/auth/register/page.tsx` — registration form
- [ ] `app/auth/reset-password/page.tsx` — password reset request
- [ ] `app/auth/update-password/page.tsx` — set new password (from reset email link)
- [ ] Server Actions for login, register, logout in `src/lib/auth/actions.ts`
- [ ] `app/(protected)/account/page.tsx` — order history list
- [ ] `app/(protected)/account/orders/[id]/page.tsx` — order detail + re-download link
- [ ] Middleware auth guard: redirect unauthenticated users from `/account/*` to `/auth/login`
- [ ] "Create account" upsell on checkout success page
- [ ] "Continue as guest" option visible on auth pages

---

## Phase 10 — Admin Section

> **Lowest priority.** Begin only after Phases 1–9 are fully complete and working.

- [ ] `app/(admin)/admin/page.tsx` — dashboard: total books, recent orders count
- [ ] `app/(admin)/admin/books/page.tsx` — book list with edit/delete actions
- [ ] `app/(admin)/admin/books/new/page.tsx` — add book form with cover upload to Supabase Storage
- [ ] `app/(admin)/admin/books/[id]/edit/page.tsx` — edit book
- [ ] `app/(admin)/admin/orders/page.tsx` — orders list with status
- [ ] `app/(admin)/admin/users/page.tsx` — user list
- [ ] Middleware admin guard: check `admin` Supabase role; redirect others to `/`

---

## Phase 11 — CI/CD & Deployment

> **Future work.** Implement after the application is feature-complete and tested locally.

### Docker

- [ ] `Dockerfile` — multi-stage: `builder` stage runs `next build`; `runner` stage uses `standalone` output
- [ ] `docker-compose.yml` — prod service, internal port
- [ ] `docker-compose.staging.yml` — staging service, different internal port
- [ ] Confirm `output: 'standalone'` is set in `next.config.ts`

### NGINX

- [ ] `nginx/prod.conf` — SSL termination (Let's Encrypt / Certbot), proxy to prod container, `location /bookstore-app`
- [ ] `nginx/staging.conf` — proxy to staging container at `stg.devmildfire.net`
- [ ] Document NGINX setup steps in `docs/deployment.md`

### GitHub Actions

- [ ] `.github/workflows/ci.yml` — on PR: run `npm run lint` + `tsc --noEmit`
- [ ] `.github/workflows/deploy-staging.yml` — on push to `main`: SSH to VPS, pull, rebuild staging container
- [ ] `.github/workflows/deploy-prod.yml` — on tagged release (`v*`): deploy to prod container
- [ ] Set GitHub repository secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, all env vars from `.env.local.example`

### Environment Config

- [ ] Document `.env.production` and `.env.staging` templates in `docs/deployment.md`
- [ ] Confirm `NEXT_PUBLIC_BASE_URL` is set correctly per environment

---

## Phase 12 — Testing Suite & Health Checks

> **Future work.** Implement after CI/CD pipeline is operational.

### Unit & Integration Tests

- [ ] Choose and configure test runner (Vitest recommended for App Router)
- [ ] Configure Supabase mock client for tests
- [ ] Tests for all Zod schemas in `src/entities/*/validation.ts`
- [ ] Tests for all normalize functions in `src/entities/*/normalize.ts`
- [ ] Tests for cart migration logic
- [ ] Tests for auth helper functions

### E2E Tests (Playwright)

- [ ] Configure Playwright
- [ ] E2E: browse catalog → add to cart → checkout (simulated payment) → download
- [ ] E2E: register → login → view order history → re-download
- [ ] E2E: admin — add a book, verify it appears in catalog

### Health Checks

- [ ] `app/api/health/route.ts` — `GET` returns `200 OK` with Supabase connectivity status
- [ ] Docker `HEALTHCHECK` in `Dockerfile` hitting `/bookstore-app/api/health`
- [ ] NGINX upstream health check pointing to health endpoint

---

## Notes for Resuming Models

1. **Check the Progress Tracker first** — update status to 🔄 when you start a phase, ✅ when every checkbox is done.
2. **Complete phases in order** — each phase depends on the previous one being done.
3. **SCSS**: follow the v3frontend conventions at `/home/mildfire/repos/AADS/v3frontend/libs/css/`. Key files: `params.scss` (variables), `breakpoint.scss` (mixin), `common.scss` (barrel).
4. **Tailwind is banned** — if any install introduces it transitively, remove it before proceeding.
5. **Supabase types**: regenerate with the command in `CLAUDE.md` whenever the DB schema changes. Output goes to `src/types/supabase.ts`.
6. **Visual design must match the current app** — reference the legacy code in this repo or the current deployed site when building components. Do not invent a new design.
7. **Cart cookie**: `bookstore_cart_id`, UUID v4, `HttpOnly`, `SameSite=Lax`, `Secure` in production.
8. **basePath is `/bookstore-app`** — all internal `<Link href>` values, `next/image` src paths, and Server Action routes must account for this. Next.js handles it automatically when `basePath` is set in `next.config.ts`.
9. **No real payments** — YooKassa integration uses test credentials only. Never add real payment keys.
10. **Resend free tier** — verify attachment support and limits before implementing Phase 8 email delivery.
