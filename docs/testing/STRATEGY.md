# Testing Strategy

**Status:** Phase 1 implemented (unit + integration + E2E harness, first tests, CI
workflows, coverage with a ratchet — §8/§10 steps 1–4 + 7) **and the production deploy
gate (§10 step 5)**: `deploy-production.yml` blocks build/deploy until the `Tests` + `E2E
tests` workflows are green for the deployed SHA (E2E now also runs on `main` so the
promoted SHA has a result). Phase 2+ (component tests, money-path integration, broader
E2E) pending. Last updated: 2026-06-22.

> **Branch model (as of 2026-06-22):** the trunk is `main`; production deploys are the
> `production` branch. The old `update`/`develop`/`staging` branches are retired — wherever
> an example workflow below targets a trunk branch, it means `main`.

This document defines the testing strategy for the bookstore-app: the stack, the layering
(unit → integration → E2E), what gets tested where, and how the full Next.js + Supabase
stack is reproduced in GitHub Actions CI for E2E on every feature-branch push.

The project currently has **no automated tests** — the sole quality gate is ESLint via a
pre-commit hook on staged files (`AGENTS.md`). This doc is the plan for changing that.

> See also: [`docs/testing/promo-codes.md`](promo-codes.md) — the existing manual-test
> fixture reference for the promo-code cart flow (seeded codes + expected behaviors).

---

## 1. Goals and constraints

### Goals

- **Catch regressions early** — on every push to a feature branch, before merge to `main`.
- **Lock down the money path** — cart pricing, order creation, payment callback, gift-card
  redemption, promo-code application. These are the highest-risk areas (immutable price
  snapshots, idempotent payment RPCs, anon→user migration).
- **Lock down the auth path** — anonymous sign-in, OAuth/email sign-in, anon→user
  migration, session refresh, admin role gating.
- **Verify the UI renders** — key storefront pages (home, catalog, book detail, cart,
  checkout, profile) and admin panel sections (orders, books, articles).
- **Prevent RLS drift** — a CI query that fails if any `public` table is RLS-off or
  RLS-on with zero policies (extends the existing `scripts/check-rls.mjs`).

### Constraints

- **No test framework is installed yet.** The stack below is the proposal.
- **Self-hosted Supabase, not Supabase Cloud.** The local dev stack runs via
  `supabase start` (Docker) — Postgres 17, GoTrue, PostgREST, Storage, Kong, Realtime.
  E2E and integration tests spin this up in CI.
- **Developer machines are NOT assumed to have the full Supabase stack running.** A
  developer may have only Node.js installed (e.g., working on a pure frontend component
  fix with no local Supabase). Therefore **all testing is CI-authoritative** — CI is the
  source of truth for whether tests pass, and CI gates deployment. Unit tests are the only
  layer that can optionally run locally (they're pure, no Supabase dependency);
  integration and E2E tests run in CI only. See §5 for the CI design and §9 for the local
  dev workflow (unit-only).
- **CI must gate production deployment.** The existing `deploy-production.yml` workflow
  must require the test workflows (`test.yml` + `test-e2e.yml`) to pass before the
  build-and-push + deploy jobs run. No green tests → no deploy. See §5.7.
- **591 TS/TSX source files, 72 pages, 14 API routes, 30 SQL RPC functions, 20 Server
  Action files.** Full coverage is not realistic day-one; the plan below prioritizes the
  high-risk surfaces first.
- **GitHub Actions `ubuntu-latest` runner**: 2 vCPU, 7 GB RAM, 14 GB SSD. This is enough
  for the Supabase local stack + Next.js + Playwright (see §5 feasibility analysis).
- **No CrUX data** (low-traffic portfolio site) — performance testing stays lab-based
  (PSI API sampling), not part of the automated test suite.

---

## 2. Test stack

### Recommended libraries

| Layer | Library | Version (pinned) | Why |
|-------|---------|------------------|-----|
| **Test runner** | `vitest` | `^3.2.0` | Native ESM + TypeScript + Next.js compatibility; faster than Jest; shares the Vite config ecosystem. Replaces the need for `ts-jest`/`babel-jest`. |
| **Assertions** | `vitest` (built-in, Chai-compatible) | — | No extra dep. |
| **Mocking** | `vitest` (built-in `vi`) + `msw` | `^2.7.0` | `vi` for module/function mocks; **MSW** (Mock Service Worker) for intercepting Supabase HTTP calls in integration tests without a real DB. |
| **Component testing** | `@testing-library/react` + `@testing-library/jest-dom` | `^16.0.0` / `^6.4.0` | The React Testing Library standard. `jest-dom` adds DOM matchers (`toBeInTheDocument`, etc.). |
| **E2E** | `@playwright/test` | `^1.48.0` | Best-in-class for Next.js App Router; multi-browser (Chromium/Firefox/WebKit); built-in auto-wait, trace viewer, component selector tools. |
| **DB fixtures** | `supabase` CLI (already installed) + custom seed scripts | `2.98.0` | Use the existing `supabase/seed.sql` + a dedicated `supabase/seed-test.sql` for test-only fixtures (promo codes, test admin user, predictable catalog rows). |
| **Supabase client in tests** | `@supabase/supabase-js` (already installed) | `2.106.1` | No extra dep — tests use the real client against the local Supabase stack. |

### Why Vitest over Jest

- **Native ESM.** The codebase uses `import` everywhere; Jest's ESM support is still
  experimental and requires `--experimental-vm-modules`. Vitest runs ESM natively.
- **TypeScript out of the box.** No `ts-jest` config, no transforms — Vitest uses esbuild.
- **Next.js 16 compatibility.** Jest + Next 16 requires the `next/jest` adapter which
  lags behind App Router features (Server Components, route handlers). Vitest handles
  these without adapter churn.
- **Speed.** Vitest's per-test-file transform cache is measurably faster on a 591-file
  codebase than Jest's cold transform.
- **Watch mode.** Vitest's HMR-style watch is better for local TDD.

### Why Playwright over Cypress

- **Multi-browser.** Cypress is Chromium-only (Firefox/WebKit are beta/experimental).
  Playwright runs all three engines — important because the project had a
  Firefox-specific RSC streaming bug in the OAuth flow (`AGENTS.md` auth section).
- **App Router support.** Playwright's `next` experimental plugin + the standard
  Next.js test setup handle Server Components and route handlers cleanly.
- **Parallelism.** Playwright runs tests in parallel across browser contexts by default;
  Cypress is single-threaded per spec file.
- **CI cost.** Playwright's browser binaries are cached efficiently in GitHub Actions
  via the official `actions/cache` recipe.

### What we do NOT add

- **`jest`** — superseded by Vitest (see above).
- **`cypress`** — superseded by Playwright (see above).
- **`supertest`** — for API route tests we use Playwright's `request` context or direct
  function invocation of the route handler, not a separate HTTP supertest layer.
- **`react-test-renderer`** — deprecated in React 19; Testing Library + `jsdom` is the path.
- **A separate assertion library** — Vitest's built-in assertions cover everything.

### `package.json` additions (devDependencies, all exact-pinned per `AGENTS.md`)

```jsonc
{
  "devDependencies": {
    "@playwright/test": "1.49.0",
    "@testing-library/jest-dom": "6.6.3",
    "@testing-library/react": "16.1.0",
    "@testing-library/user-event": "14.5.2",
    "@vitejs/plugin-react": "4.3.4",
    "jsdom": "25.0.1",
    "msw": "2.7.0",
    "vitest": "3.2.1"
  }
}
```

### New npm scripts

```jsonc
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:unit": "vitest run --dir src",
    "test:integration": "vitest run --dir tests/integration",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

> No `test:ci` script — CI runs the three layers as separate workflow jobs (`unit` →
> `integration` → `e2e`), not a combined command. This lets each layer fail and report
> independently, and matches the CI design in §5.

---

## 3. Test layers

### Layer 1 — Unit tests (`src/**/*.test.ts`, co-located)

**What:** pure functions with no Supabase / no Next.js / no browser dependencies.

**Run:** Vitest, no environment, no MSW, no DB. ~ms per test.

**Target files (highest-value unit tests):**

| Module | What to test | Example assertions |
|--------|--------------|--------------------|
| `src/lib/formatPrice.ts` | `formatPrice()` for all input ranges | `formatPrice(0)` → `«0 ₽»`; `formatPrice(1250.5)` → `«1 250,50 ₽»`; negative, `null`, `undefined`, `NaN` |
| `src/lib/orderDisplay.ts` | `formatOrderDate`, `orderStatusLabel`, `itemLink`, `fulfillmentLabel` | Russian labels; date formatting; link targets by product category |
| `src/lib/siteUrl.ts` | `absoluteUrl()` | Dev vs prod; trailing slash; `null` input |
| `src/lib/storage.ts` | `getCoverUrl`, `getAwardUrl`, `getDownloadUrl` | Bare filename → full URL; `null` input → `null`; URL shape for each bucket |
| `src/entities/*/normalize.ts` | Every `normalizeX()` function (10 modules) | Server row → client shape; `null`/missing fields → defaults; array fields; nested objects |
| `src/entities/*/validation.ts` | Every Zod schema (7 modules) | Valid input passes; invalid input fails with the right path; edge cases (empty strings, max length, enum values) |
| `src/entities/book/normalize.ts` | `normalizeBook()` — the most complex normalizer | Full catalog row (authors, awards, workers, contexts, trailer, editions) → `Book`; missing optional fields; `getCoverUrl` integration |
| `src/lib/payments/robokassa/signature.ts` | Robokassa signature computation | Known-input → known-hash (test vector from Robokassa docs); amount + invoice + password ordering |
| `src/lib/payments/robokassa/receipt.ts` | Receipt stub | Returns `undefined` until real fiscalization is wired |
| `src/lib/email/templates/*` | Email template rendering (React Email) | Props → expected HTML substring; Russian text; order line items |
| `src/contexts/cart.tsx` — `calculateState` | Cart state reducer | Add/remove/update/clear; quantity edge cases; promo interaction (this is a pure function extracted from the context) |

**Co-location rule:** `src/lib/formatPrice.test.ts` next to `src/lib/formatPrice.ts`.
Mirrors the convention in `docs/conventions/COMPONENTS.md` (co-located styles → co-located
tests). Vitest's default glob picks up `*.test.ts`/`*.test.tsx` anywhere under `src/`.

**Goal:** ~150-200 unit tests covering every pure function in `src/lib/`, every
normalizer, every Zod schema. Fast (< 5s total), no external dependencies.

### Layer 2 — Integration tests (`tests/integration/`)

**What:** modules that touch Supabase or Next.js infrastructure, tested against the
**real local Supabase stack** (not mocked). These verify that the `src/api/*` functions,
Server Actions, and RPCs actually work against Postgres + PostgREST + GoTrue + Storage.

**Run:** Vitest, with a `globalSetup` that starts the local Supabase stack once per run
(see §5). Each test file runs in isolation with a transaction-rollback or
schema-reset-between-tests strategy (see §6).

**Target areas (highest-value integration tests):**

| Area | What to test | Test approach |
|------|--------------|---------------|
| **Catalog read RPCs** | `get_catalog_books`, `get_catalog_book_by_slug`, `get_catalog_facets`, `search_books`, `get_similar_books` | Call via `supabase.rpc()` against the seeded DB; assert row counts, field shapes, filter combinations, sort orders |
| **Cart pricing** | `compute_cart_totals`, `quote_cart` | Seed a test cart; call the RPC; assert subtotal, book-discount, promo-delta, final-total, gift-card-eligible-total against hand-computed values (see `docs/plans/data-architecture-fix-plan.md` §3.1 for the parity vectors) |
| **Promo codes** | `apply_promo_code` | All 5 seeded codes from `docs/testing/promo-codes.md` (SUMMER25, FREECART, WHITE30, AUDIO50, OLDCODE); cart-level vs item-level; expired; not-found; target-missing; case-insensitivity |
| **Order lifecycle** | `create_pending_order` → `mark_order_paid` → `cancel_pending_order` → `expire_stale_pending_orders` | Two-phase flow: create pending (cart intact), mark paid (idempotent, cart wiped), cancel (cart restored), expire stale. Assert order status transitions, price snapshot immutability, cart wipe |
| **Gift cards** | `generate_gift_card_code`, `send_gift_card`, `redeem_gift_card_token` | Code generation uniqueness; redemption against a pending order; balance reservation + release on cancel |
| **Auth migration** | `migrate_anonymous_user` | Seed anon user with cart + orders + gift cards + likes; call the RPC with a real user ID; assert all rows migrated; anon row deleted; idempotency (second call is a no-op); failure rollback |
| **RLS enforcement** | Every public table | Anon key can `SELECT` catalog tables but not `INSERT/UPDATE/DELETE/TRUNCATE`; user-scoped tables (`Cart`, `Orders`, `Profiles`) only readable by owner; admin tables only writable via service role |
| **Storage** | `covers`, `avatars`, `digital-files` buckets | Public read of `covers/*`; signed URL for `digital-files/*` with 1h TTL; anon cannot write to `covers`; authenticated user can write to `avatars/{own-uid}` |
| **Server Actions** | `loginAction`, `registerAction`, `logoutAction`, `checkoutAction`, `cancelOrderAction`, admin CRUD actions | Invoke with mocked `FormData`; assert return shape (`{ error }` or redirect); verify side effects (DB row created/updated, cart wiped, etc.) |
| **Email hook** | `POST /api/auth/hooks/send-email` | Send a Standard-Webhooks-signed request; assert Resend is called with the right template + recipient; invalid signature → 401 |
| **Auth routes** | `GET /api/auth/google`, `POST /api/auth/hooks/send-email`, `/auth/confirm`, `/auth/callback` | OAuth redirect shape; callback session setup; error handling |
| **API routes** | All 14 route handlers under `src/app/api/` | Request → response shape; auth gating; error handling |

**Goal:** ~80-120 integration tests. Slower (~30-60s with the Supabase stack warm),
but the highest-confidence layer because they test the real SQL + RLS + auth.

### Layer 3 — E2E tests (`tests/e2e/`)

**What:** full browser-driven flows against the running Next.js app + Supabase stack.
Playwright launches a real browser, navigates pages, clicks buttons, fills forms, and
asserts on the rendered DOM.

**Run:** Playwright, with a `webServer` config that starts `next dev` (or the production
`next start`) + the local Supabase stack (see §5).

**Target flows (highest-value E2E tests):**

| Flow | Steps | Assertions |
|------|-------|------------|
| **Home → catalog → book detail** | Load `/`, click a hero carousel slide, click a catalog card, land on `/books/<slug>` | Hero renders; carousel navigates; catalog grid loads; book page shows cover, title, authors, editions, buy-box |
| **Add to cart → cart → checkout (mock payment)** | Book page → "В корзину" → cart icon → `/cart` → "Оформить" → `/checkout` → fill form → confirm → mock gateway → success page | Cart count updates; cart totals render; checkout form validates; order is created with status `pending`; mock payment marks it `paid`; success page shows order; cart is emptied |
| **Anonymous sign-in → profile → order history** | Load home (anon sign-in fires) → profile icon → `/profile` → `/profile/orders` | Anon user has a profile; orders list renders (empty for new anon); migration to real user on sign-in |
| **Email/password registration** → `/auth/register` → fill form → submit → confirm email (via Inbucket) → `/auth/confirm` → profile | Registration creates auth user + `Profiles` row; confirmation email is captured by Inbucket; clicking the confirm link sets the session; profile is editable |
| **Admin login → orders → set fulfillment** | `/admin/login` → fill admin creds → `/admin/orders` → click order → set tracking number → save | Admin role gates the panel; order fulfillment is saved; audit log entry is created |
| **Admin: book CRUD** | `/admin/books` → "Добавить" → fill form → save → edit → delete | Book is created in DB; appears in catalog; edit changes fields; delete removes (soft or hard per schema) |
| **Promo code application** | `/cart` with items → enter `SUMMER25` → apply → see discount line → remove → re-apply `WHITE30` (item-level) | Discount appears/updates; `Скидка (CODE)` line shows only when promo beats book discounts; removing code clears discount; one code at a time |
| **Search** | Header search bar → type "Абзац" → see results → click result | Search RPC returns matches; results render; clicking navigates to book page |
| **Mobile responsive** | Repeat key flows at 375px viewport | Layout doesn't break; mobile menu works; carousel goes full-bleed |
| **404 / error boundaries** | Navigate to `/books/nonexistent-slug` → 404 page; force a server error → `error.tsx` | `notFound()` renders the 404; server errors render the nearest `error.tsx` |

**Browser matrix:** Chromium (primary), Firefox (secondary — the OAuth RSC bug
historically hit Firefox), WebKit (smoke only — run on `main` branch pushes, not every PR).

**Goal:** ~30-50 E2E tests covering the critical user journeys. Slowest layer (~2-5 min
per browser), but the highest-fidelity because they test the real rendered app.

---

## 4. Test file layout

```
src/                              ← unit tests co-located with source
  lib/
    formatPrice.test.ts
    orderDisplay.test.ts
    storage.test.ts
    payments/robokassa/
      signature.test.ts
  entities/
    book/
      normalize.test.ts
      validation.test.ts
    cart/
      normalize.test.ts
      validation.test.ts
    ...
  contexts/
    cart.test.tsx                  ← component-context unit (jsdom)

tests/                             ← integration + E2E (not under src/)
  integration/
    rpc/
      catalog.test.ts
      pricing.test.ts
      promo.test.ts
      orders.test.ts
      gift-cards.test.ts
      auth-migration.test.ts
    rls/
      catalog-rls.test.ts
      user-scoped-rls.test.ts
    storage/
      buckets.test.ts
    actions/
      auth-actions.test.ts
      checkout-actions.test.ts
      admin-actions.test.ts
    routes/
      email-hook.test.ts
      auth-routes.test.ts
  e2e/
    home.spec.ts
    catalog.spec.ts
    book-detail.spec.ts
    cart-checkout.spec.ts
    auth.spec.ts
    admin.spec.ts
    promo.spec.ts
    search.spec.ts
    mobile.spec.ts
    errors.spec.ts

supabase/
  seed-test.sql                    ← test-only fixtures (promo codes, admin user, predictable catalog rows)
  seed-promo-codes.sql             ← existing (referenced by seed-test.sql)

# Config files (repo root)
vitest.config.ts
vitest.setup.ts                    ← jest-dom matchers, MSW server setup
playwright.config.ts
.github/
  workflows/
    test.yml                       ← new: runs unit + integration on every PR
    test-e2e.yml                   ← new: runs E2E on feature-branch pushes (§5)
```

---

## 5. CI: full Next.js + Supabase stack on GitHub Actions

> **The central question: can the GitHub Actions runner fully reproduce our stack for
> E2E tests on every feature-branch push?**

### Answer: yes, it is feasible and practical. Here's why and how.

### 5.1 What "the stack" means here

The app needs these services to run end-to-end:

| Service | Local dev port | Image | CI purpose |
|---------|---------------|-------|------------|
| **Postgres 17** | 54322 | `supabase/postgres:17.6.1.106` | Database (schema + seed + RLS) |
| **GoTrue (Auth)** | 9999 (internal) | `supabase/gotrue:v2.188.1` | Anonymous sign-in, email/password, OAuth |
| **PostgREST** | 3000 (internal) | `supabase/postgrest:v14.10` | REST API over Postgres |
| **Storage API** | 5000 (internal) | `supabase/storage-api:v1.54.1` | Storage buckets (covers, avatars, digital-files) |
| **Kong** | 8000 (internal) / 54321 (public) | `kong/kong:3.9.1` | API gateway — routes `/auth/v1`, `/rest/v1`, `/storage/v1` |
| **Inbucket** | 54324 | `inbucket/inbucket` | Email testing (captures GoTrue's Send-Email hook calls) |
| **Next.js** | 3000 | local build | The app under test |

Realtime and Studio are not needed for tests (the app doesn't use Realtime; Studio is an
admin UI, not a test dependency).

### 5.2 The approach: `supabase start` in CI

The Supabase CLI (`supabase` 2.98.0, already in `devDependencies`) has a built-in command
that starts the **entire local stack** via Docker:

```bash
supabase start
```

This reads `supabase/config.toml`, runs `supabase/migrations/*.sql` + `supabase/seed.sql`
against a fresh Postgres container, and starts GoTrue/PostgREST/Storage/Kong/Inbucket. It
exposes the same ports as local dev (`54321` for the API gateway, `54322` for Postgres,
`54324` for Inbucket). The app's `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` works
unchanged.

This is the **standard, supported way** to run Supabase in CI — it's what Supabase's own
docs recommend for GitHub Actions, and what the `supabase/test-db` action wraps.

### 5.3 CI workflow: `test-e2e.yml`

```yaml
name: E2E tests

on:
  push:
    branches: ['feature/**', 'feat/**']
  pull_request:
    branches: ['main']

jobs:
  e2e:
    name: Playwright E2E
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - name: Checkout
        uses: actions/checkout@v5

      - name: Set up Node.js
        uses: actions/setup-node@v5
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium firefox

      - name: Set up Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: 2.98.0

      - name: Start Supabase local stack
        run: supabase start
        env:
          # The Send-Email hook points at the dev server (host.docker.internal:3000).
          # In CI, the Next.js dev server runs on the host, so this works the same way.
          SEND_EMAIL_HOOK_SECRET: whsec_test_secret_for_ci

      - name: Apply test seed fixtures
        run: |
          PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres \
            -f supabase/seed-promo-codes.sql
          PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres \
            -f supabase/seed-test.sql

      - name: Seed admin user
        run: node --env-file=.env.test scripts/seed-admin.mjs admin@test.local testpass123
        env:
          # .env.test is committed with test-only values (no real secrets)
          SUPABASE_URL: http://127.0.0.1:54321
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_LOCAL_SERVICE_ROLE_KEY }}

      - name: Run E2E tests
        run: npx playwright test --project=chromium
        env:
          NEXT_PUBLIC_SUPABASE_URL: http://127.0.0.1:54321
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_LOCAL_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_LOCAL_SERVICE_ROLE_KEY }}
          NEXT_PUBLIC_BASE_URL: http://localhost:3000
          PAYMENT_PROVIDER: mock
          SEND_EMAIL_HOOK_SECRET: whsec_test_secret_for_ci
          # Playwright starts the Next.js dev server via webServer config
          # (see playwright.config.ts — it runs `npm run dev` and waits for :3000)

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

      - name: Stop Supabase
        if: always()
        run: supabase stop --no-backup
```

### 5.4 Feasibility analysis

#### Resource budget on `ubuntu-latest` (2 vCPU / 7 GB RAM / 14 GB SSD)

| Component | RAM | Disk | Notes |
|-----------|-----|------|-------|
| Postgres 17 | ~200 MB | ~500 MB | Schema + seed is small (~64 titles, ~150 editions, test fixtures) |
| GoTrue | ~50 MB | — | Stateless; uses Postgres for persistence |
| PostgREST | ~30 MB | — | Stateless |
| Storage API | ~80 MB | ~100 MB | Test fixtures only (a few covers, no real media) |
| Kong | ~60 MB | — | Stateless gateway |
| Inbucket | ~30 MB | ~10 MB | Captures emails in memory/disk |
| Next.js dev server | ~400 MB | — | `next dev` with webpack |
| Playwright (2 browsers) | ~600 MB | ~400 MB | Chromium + Firefox binaries + running contexts |
| Vitest (if combined run) | ~200 MB | — | Only if running unit + E2E in the same job |
| **Total** | **~1.6 GB** | **~1 GB** | **Well under the 7 GB / 14 GB limits** |

The 2 vCPU constraint is the real bottleneck, not RAM. Parallel test execution helps, but
the Supabase stack startup + Next.js build + Playwright browser launch will take
**~3-5 minutes of wall time** before the first test runs. With ~30 E2E tests at ~5s each
across 2 browsers, the full E2E job is **~8-12 minutes** — well within GitHub Actions'
6-hour limit and acceptable for a feature-branch push.

#### Does it work on every feature-branch push?

**Yes, with these caveats:**

1. **Docker is available on `ubuntu-latest`** — GitHub Actions runners have Docker
   pre-installed and running. `supabase start` works out of the box.
2. **The Supabase CLI is installed via `supabase/setup-cli@v1`** — the official action,
   pinned to the same version as local dev (`2.98.0`).
3. **`supabase start` reads `config.toml` + migrations + seed** — the same files that
   work locally work in CI. No CI-specific Supabase config needed.
4. **The Next.js dev server is started by Playwright's `webServer` config** —
   `playwright.config.ts` specifies `command: npm run dev` and `url: http://localhost:3000`,
   so Playwright manages the server lifecycle (starts it, waits for it to be ready, kills
   it after tests).
5. **Env vars use test-only values** — a committed `.env.test` with the local anon key,
   service role key, and `whsec_test_secret_for_ci`. The local Supabase stack generates
   these keys deterministically from `config.toml`'s JWT secret, so they're stable across
   runs. No real secrets in CI.
6. **The Send-Email hook works in CI** — GoTrue calls `host.docker.internal:3000/api/auth/hooks/send-email`,
   which reaches the Next.js dev server on the host. In CI, `host.docker.internal` resolves
   to the host (GitHub Actions runner) just like in local dev. The hook secret is a
   test-only value.
7. **Inbucket captures auth emails** — GoTrue's Send-Email hook calls the Next.js
   endpoint, which renders the email and sends via Resend. In CI, we either (a) mock
   Resend in the Next.js server (return 200 without sending), or (b) use Inbucket as the
   SMTP backend and skip Resend entirely. Option (b) is cleaner for E2E — the auth
   confirmation email lands in Inbucket's API, which the test can query to extract the
   confirmation link. **This requires configuring GoTrue to use Inbucket as SMTP** in
   `config.toml` (or a CI-specific override).
8. **Google OAuth is skipped in CI** — the OAuth flow requires real Google credentials
   and a real redirect URI. CI E2E tests cover email/password auth only. The OAuth
   redirect flow (`GET /api/auth/google`) is tested at the integration layer (assert the
   302 shape + redirect URL) without completing the OAuth round-trip.

#### What can go wrong (and mitigations)

| Risk | Mitigation |
|------|------------|
| `supabase start` is slow (~60-90s cold) | Cache Docker images via `actions/cache` on the Docker layer cache; the Supabase CLI reuses pulled images across runs. Expected cold start ~90s, warm start ~30s. |
| Postgres migration replay fails on a drift | Fail fast — the migration step is the first thing that runs; if it fails, the job fails in <2 min with a clear error (this is itself a valuable CI signal) |
| Port conflicts (54321, 54322, 3000) | `ubuntu-latest` is a clean runner — no services on these ports. `supabase start` binds to 127.0.0.1 only. |
| Flaky tests (network timing, carousel animation) | Playwright's auto-wait + `waitForResponse` + `expect` with retries. The mock payment gateway is deterministic. Carousel tests use `data-testid` anchors and `waitForSelector` not animation timing. |
| CI minutes cost | E2E runs on `feature/**` and `feat/**` pushes + PRs into `main` — not on every push to `main` (which gets the lighter `test.yml`). ~10 min per E2E run × ~5 PRs/week = ~50 CI minutes/week. GitHub free tier includes 2000 min/month for private repos; this is well within budget. |
| Storage test fixtures (cover images) | A small set of test covers committed under `tests/fixtures/covers/` (~5 images, <1 MB). Uploaded to the `covers` bucket in the CI seed step via `scripts/upload-covers-to-supabase.mjs` (or a dedicated test-fixture uploader). |

### 5.5 The lighter CI workflow: `test.yml` (unit + integration, every push)

```yaml
name: Tests

on:
  push:
    branches: ['main']
  pull_request:
    branches: ['main']

jobs:
  unit:
    name: Unit tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit

  integration:
    name: Integration tests
    runs-on: ubuntu-latest
    needs: unit
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - uses: supabase/setup-cli@v1
        with:
          version: 2.98.0
      - run: supabase start
        env:
          SEND_EMAIL_HOOK_SECRET: whsec_test_secret_for_ci
      - run: npm run test:integration
        env:
          NEXT_PUBLIC_SUPABASE_URL: http://127.0.0.1:54321
          NEXT_PUBLIC_SUPABASE_ANON_KEY: eyJhbGciOi...test-anon-key
          SUPABASE_SERVICE_ROLE_KEY: eyJhbGciOi...test-service-key
      - run: supabase stop --no-backup
        if: always()
```

This runs on every push to `main` + PRs into `main`. Unit tests (~5s) gate
integration tests (~60s with Supabase warm). Total ~2-3 min. The existing `docker-publish.yml`
CI workflow (lint + build) stays as-is; this adds the test gate alongside it. Neither this
workflow nor the E2E workflow below assumes the developer ran any tests locally — CI is the
authoritative runner.

### 5.6 The `audit.yml` extension

The existing `audit-reusable.yml` runs `npm audit --audit-level=high`. Extend it (or add a
new reusable workflow) to also run the RLS drift check:

```yaml
  rls-check:
    name: RLS drift check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - uses: supabase/setup-cli@v1
        with:
          version: 2.98.0
      - run: supabase start
      - run: node scripts/check-rls.mjs
        env:
          DATABASE_URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      - run: supabase stop --no-backup
        if: always()
```

This makes the RLS invariant (`AGENTS.md` — "every public table must be RLS-protected") a
CI-enforced gate, not just a local script.

### 5.7 Deploy gate — tests must pass before production deploy

The existing `deploy-production.yml` workflow already has a hard gate: the `audit` job
(calls `audit-reusable.yml` for `npm audit`) must pass before `build-and-push` runs. The
test workflows are added as additional hard gates.

**Approach A — `workflow_run` trigger (cleanest, no coupling between workflow files):**

`deploy-production.yml` adds a guard job that waits for the test workflows to complete on
the same SHA before allowing build-and-push:

```yaml
  # Add as the FIRST job, before build-and-push. Hard gate: no green tests → no deploy.
  tests-pass:
    name: Require green tests
    runs-on: ubuntu-latest
    # Check out the repo so we can query the GitHub API for workflow run status
    steps:
      - uses: actions/checkout@v5
      - name: Wait for test.yml + test-e2e.yml on this SHA
        uses: actions/github-script@v7
        with:
          script: |
            const required = ['Tests', 'E2E tests'];
            const sha = context.sha;
            for (let attempt = 0; attempt < 60; attempt++) {
              const runs = await github.rest.actions.listWorkflowRunsForRepo({
                owner: context.repo.owner,
                repo: context.repo.repo,
                head_sha: sha,
                status: 'completed',
                per_page: 100,
              });
              const done = required.every(name => {
                const run = runs.data.workflow_runs.find(r => r.name === name);
                return run && run.conclusion === 'success';
              });
              if (done) return core.info('All required test workflows are green.');
              const failed = required.find(name => {
                const run = runs.data.workflow_runs.find(r => r.name === name);
                return run && run.conclusion === 'failure';
              });
              if (failed) throw new Error(`Required workflow '${failed}' failed for ${sha}`);
              core.info(`Waiting for test workflows (attempt ${attempt + 1}/60)...`);
              await new Promise(r => setTimeout(r, 30000)); // 30s poll
            }
            throw new Error('Timed out waiting for test workflows to complete.');
  build-and-push:
    needs: [audit, tests-pass]   # ← add tests-pass here
```

**Approach B — inline the test jobs into `deploy-production.yml` (simpler, more coupling):**

Copy the `unit`, `integration`, and `e2e` jobs directly into `deploy-production.yml` as
jobs that `build-and-push` depends on. This duplicates the job definitions but avoids the
polling logic. **Not recommended** — duplication drifts.

**Approach C — reusable test workflow (best long-term):**

Convert `test.yml` + `test-e2e.yml` jobs into a reusable workflow
(`test-reusable.yml`, called via `workflow_call`), then have `deploy-production.yml` call
it as a gate — same pattern as the existing `audit-reusable.yml`. This is the cleanest
once the test jobs stabilize. Migrate to this after Phase 1.

**Regardless of approach, the invariant is:** a push to `production` cannot build or
deploy unless the test workflows for that exact SHA have all passed. A developer who
pushes a frontend-only fix with no local Supabase gets the same gate as everyone else —
CI runs the full stack and gates the deploy.

---

## 6. Test data and isolation

### 6.1 `supabase/seed-test.sql` (committed)

A dedicated test-fixture seed file, applied **after** `seed.sql` in CI. Contains:

- The 5 promo codes from `supabase/seed-promo-codes.sql` (or includes that file)
- A test admin user reference (the auth user is created by `scripts/seed-admin.mjs`,
  not by SQL — but the `Profiles` row for the admin can be seeded here)
- Predictable catalog rows for assertions (e.g., a title with known slug
  `test-book-1`, known price `1000`, known author)
- Test cart/order fixtures for integration tests (a pending order with known items)

This file is idempotent (`ON CONFLICT DO NOTHING`) and only run in test contexts, never
in production.

### 6.2 Isolation strategy for integration tests

**Approach: transaction-rollback per test file.**

Each integration test file wraps its setup + assertions in a single Postgres transaction
and rolls back at the end. This gives complete isolation without the cost of
`supabase db reset` between files.

```ts
// tests/integration/helpers/db.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

let setupClient: PoolClient | null = null

export async function withTestDb<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' })
  const client = await pool.connect()
  await client.query('BEGIN')
  try {
    const result = await fn(client)
    await client.query('ROLLBACK')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}
```

For tests that need to call the Supabase REST API (not direct SQL), the approach is:
1. Seed via direct SQL in the transaction
2. Call the RPC via `supabase.rpc()` (which goes through PostgREST — reads the seeded row)
3. Assert on the result
4. Rollback (the seeded row never commits, so the next test sees a clean state)

**Caveat:** GoTrue auth operations (sign-in, sign-up) are not transactional — they create
rows in `auth.users` which is outside the test transaction. For auth integration tests,
clean up explicitly in an `afterEach` hook (delete the test auth user via the service
role). The `migrate_anonymous_user` test is the one exception that needs careful setup
+ teardown because it touches both `auth.users` and public tables.

### 6.3 E2E test isolation

E2E tests run against the seeded DB (no per-test rollback — Playwright can't manage
Postgres transactions). Isolation is by:

- **Using the anon user** for storefront flows (each test run gets a fresh anon session
  via Playwright's isolated browser context)
- **Using the test admin user** for admin flows (seeded by `scripts/seed-admin.mjs`)
- **Cleaning up created rows** in an `afterEach` hook (e.g., delete orders created during
  the checkout test, delete books created during the admin CRUD test)
- **A `globalTeardown`** that runs `supabase db reset` (or a targeted cleanup script) to
  restore the DB to its post-seed state for the next CI run

---

## 7. Configuration files

### `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'tests/integration/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/types/supabase.ts'],
      thresholds: {
        // Start lenient, tighten over time
        statements: 40,
        branches: 30,
        functions: 40,
        lines: 40,
      },
    },
  },
})
```

### `vitest.setup.ts`

```ts
import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './tests/integration/mocks/server' // MSW server

// MSW: only active for integration tests that opt in via `server.listen()`
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### `playwright.config.ts`

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html']] : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: /.*mobile.*/, // Firefox runs desktop tests only (WebKit takes mobile)
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
      PAYMENT_PROVIDER: 'mock',
      SEND_EMAIL_HOOK_SECRET: 'whsec_test_secret_for_ci',
    },
  },
})
```

---

## 8. Coverage targets

### Phase 1 (initial — get the harness in place)

| Layer | Target | Priority |
|-------|--------|----------|
| Unit | `src/lib/*` + `src/entities/*/normalize.ts` + `src/entities/*/validation.ts` | High — pure functions, fast wins |
| Integration | Catalog RPCs + cart pricing + promo codes | High — highest-risk business logic |
| E2E | Home → catalog → book detail + add-to-cart → checkout (mock) | High — the critical user journey |
| CI | `test.yml` (unit + integration) + `test-e2e.yml` on feature branches | High |
| Coverage | 40% statements, 30% branches | Lenient — get the harness green first |

### Phase 2 (expand coverage)

| Layer | Target | Priority |
|-------|--------|----------|
| Unit | All `src/lib/**` including `payments/robokassa/*`, `email/templates/*` | Medium |
| Integration | Order lifecycle + gift cards + auth migration + RLS enforcement + storage | High — money + security path |
| E2E | Auth (register/confirm/login) + admin (orders, books CRUD) + promo application | High |
| Coverage | 60% statements, 50% branches | Tightening |

### Phase 3 (comprehensive)

| Layer | Target | Priority |
|-------|--------|----------|
| Unit | Every exported function in `src/` | Medium |
| Integration | Every Server Action + every API route + every RPC | Medium |
| E2E | Search + mobile responsive + 404/error + admin (all sections) | Medium |
| Coverage | 80% statements, 70% branches | Real target |

### What we deliberately do NOT aim to cover

- **Generated types** (`src/types/supabase.ts`) — generated, not hand-written.
- **The `supabase/migrations/*.sql` files themselves** — tested by replaying them in CI
  (`supabase start` runs them); no separate SQL unit tests.
- **Storage object upload scripts** (`scripts/upload-*.mjs`) — operational scripts, not
  app code. Tested by running them in CI setup, not by unit tests.
- **`next.config.ts`** — configuration, not code. Validated by the build succeeding.
- **CSS/SCSS** — no visual regression testing (not worth the maintenance cost at this scale).

---

## 9. Local development workflow

### CI is the authoritative test runner

**All test layers run in CI.** A developer is never required to run tests locally to
verify a change — CI is the gate. This is deliberate: a developer working on a frontend
component fix may not have the local Supabase stack running (or installed at all), and
should still be able to push a branch and get full test feedback from CI.

### What a developer runs locally (optional, convenience only)

**Unit tests** are the only layer that runs locally without infrastructure — they're pure
functions with no Supabase/Next.js/browser dependencies:

```bash
# Unit tests — no dependencies, instant, works on any machine with Node.js
npm run test:unit

# Watch mode during TDD on a pure function
npm run test:watch
```

**Integration and E2E tests do NOT run locally.** They require the full Supabase stack
(Postgres, GoTrue, PostgREST, Storage, Kong, Inbucket) + a running Next.js server. A
developer who wants to run them locally (e.g., debugging a flaky test) can — but it's
opt-in, never required:

```bash
# ONLY if the developer has the full local stack installed and wants to debug locally:
supabase start                          # requires Docker + supabase CLI
npm run test:integration                # integration tests against local Supabase
npm run test:e2e                        # E2E — Playwright starts the Next.js dev server
npm run test:e2e:ui                     # interactive Playwright UI for debugging
```

The normal workflow is: push the branch → CI runs all three layers → review the Playwright
report artifact if a test fails.

### Pre-commit hook (unit-only)

The existing `lint-staged` config runs ESLint on staged `.ts/.tsx/.js/.jsx` files. Extend
it to also run **unit tests only** on staged files (via `vitest related`):

```jsonc
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "vitest related --run"
    ]
  }
}
```

`vitest related` runs only the unit tests that import the staged file — fast, no Supabase
dependency. If a staged file has no related unit tests, `vitest related` is a no-op (no
failure). Integration and E2E tests are **not** in the pre-commit hook — they need the
Supabase stack and are CI's job.

### What happens when a developer pushes without running anything

1. Developer pushes a feature branch (e.g., a frontend component fix, no local Supabase).
2. `test.yml` triggers: runs `unit` job (~5s) → if green, runs `integration` job (~60s,
   CI spins up the Supabase stack).
3. `test-e2e.yml` triggers (feature-branch push): runs E2E (~10 min, CI spins up Supabase
   + Next.js + Playwright).
4. If any job fails, the PR is blocked from merging to `main` (required status check).
5. If the developer later pushes to `production`, `deploy-production.yml` requires all
   test workflows for that SHA to be green (§5.7) before build-and-push + deploy run.
6. The developer never had to install Supabase, Docker, or run a single test command
   locally. CI was the gate.

---

## 10. Migration path (how to get from zero tests to this)

This is a large change. Do it in this order, each step independently shippable:

1. **Install the stack.** Add the `devDependencies`, create `vitest.config.ts`,
   `vitest.setup.ts`, `playwright.config.ts`. Add the npm scripts. No tests yet — just
   the harness. Verify `npm run test:unit` runs and reports "no tests found" cleanly.

2. **Write the first unit tests.** `src/lib/formatPrice.test.ts`,
   `src/lib/storage.test.ts`, `src/entities/book/normalize.test.ts`. ~20 tests. Verify
   `npm run test:unit` passes locally (unit tests are pure, no Supabase needed). Add the
   `test.yml` CI workflow (unit-only job). Confirm it passes in CI.

3. **Write the first integration tests.** `tests/integration/rpc/catalog.test.ts` +
   `tests/integration/rpc/pricing.test.ts`. Add the integration job to `test.yml`.
   **Verify in CI only** — do not assume a local Supabase stack. If a developer wants to
   debug locally, they can opt-in via `supabase start && npm run test:integration`, but
   the CI run is the authoritative verification.

4. **Write the first E2E test.** `tests/e2e/home.spec.ts` (home → catalog → book detail).
   Add the `test-e2e.yml` CI workflow. **Verify in CI only** — the workflow spins up the
   full Supabase stack + Next.js + Playwright. Download the Playwright report artifact to
   debug failures.

5. **Add the deploy gate.** Wire `deploy-production.yml` to require the test workflows
   (§5.7). Start with Approach A (`workflow_run` poll) for Phase 1; migrate to Approach C
   (reusable workflow) once the test jobs stabilize.

6. **Expand.** Follow the Phase 1 → 2 → 3 priorities from §8. Each test is independently
   mergeable — no "big bang" test PR. CI is the gate throughout.

7. **Add coverage thresholds.** Once Phase 1 is green in CI, add the `coverage.thresholds`
   to `vitest.config.ts` and enforce in CI.

8. **Extend `audit-reusable.yml`** with the RLS drift check job (or add it to `test.yml`
   per §5.6).

---

## 11. What this does NOT solve

- **Visual regression testing.** No Chromatic/Percy — the app has ~72 pages and frequent
  layout tweaks; visual regression at that scale is high-maintenance for low payoff. If
  needed later, add Playwright screenshot comparisons on 3-4 key pages only.
- **Load/performance testing.** The PSI API sampling (see `docs/perf/psi-baseline.md`)
  stays the performance signal; no k6/Locust suite. The portfolio site has low traffic.
- **Contract testing.** No Pact/spec-against-frontend — the frontend and backend are in
  the same repo and share generated types (`src/types/supabase.ts`), so contract drift is
  caught by `tsc`.
- **Mutation testing.** No Stryker — overhead is high for the coverage gain at this
  project size. Reconsider if the codebase doubles.

---

## 12. Open questions (decide before implementation)

1. **Should E2E run on `next dev` or `next start` (production build)?** `next dev` is
   faster to start but doesn't test the production build. `next start` requires a build
   step (~60s in CI) but catches build-time issues. **Recommendation:** `next start` in
   CI (production-fidelity), `next dev` for local E2E (faster iteration).

2. **Should integration tests use MSW (mocked HTTP) or the real Supabase stack?** This
   doc proposes the real stack for maximum fidelity. MSW is faster but doesn't test RLS,
   RPC signatures, or PostgREST behavior. **Recommendation:** real stack for integration;
   MSW only for unit tests of `src/api/*` functions that need to mock Supabase responses.

3. **Should the RLS drift check be part of `test.yml` or `audit-reusable.yml`?** It needs
   the Supabase stack, so it's heavier than the current `npm audit` in
   `audit-reusable.yml`. **Recommendation:** new `rls-check` job in `test.yml` (not
   `audit-reusable.yml`) to keep the audit reusable workflow fast and dependency-free.

4. **Browser matrix for PRs vs `main` branch.** Running Chromium + Firefox + WebKit on
   every PR triples the E2E time. **Recommendation:** Chromium only on PRs; Chromium +
   Firefox + WebKit on `main` branch pushes (nightly or on-merge).

5. **Test admin user credentials.** `scripts/seed-admin.mjs` creates the admin auth user
   with a password. In CI, this password is in `.env.test` (committed, test-only). Is a
   committed test admin password acceptable, or should it be a CI secret? **Recommendation:**
   committed test-only value — the local Supabase stack is not accessible outside CI, and
   the admin user only exists in the ephemeral CI database.
