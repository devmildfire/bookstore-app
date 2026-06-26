# Single-Image CI/CD + App-Edge Test Coverage — Refactor Plan

**Status:** planning (no code yet) · **Created:** 2026-06-26
**Related:** [docs/plans/frontend-architecture-rendering.md](./frontend-architecture-rendering.md),
[docs/testing/STRATEGY.md](../testing/STRATEGY.md), [docs/deployment/README.md](../deployment/README.md),
`.github/workflows/ci.yml` + `deploy-production.yml`

> **Rule:** finish + agree the plan first. Do not start implementing until the tracker
> below is reviewed. Each phase is independently shippable and verifiable.

---

## 1. Why

Two problems remain after the 2026-06-26 CI consolidation (one pipeline on main; production
deploy-only):

1. **E2E tests the dev server, not the artifact.** Playwright runs against `npm run dev`
   (`next dev --webpack`), which differs from the production build in ways that matter here:
   no static generation / PPR path, no prod bundling/minification, React Strict Mode double
   renders, build-time errors not exercised. Prod-only bugs have bitten before (admin prerender,
   route-group `loading.tsx` CLS, Firefox RSC-stream race). We want E2E to run the **real shipped
   image**.
2. **The image bakes `NEXT_PUBLIC_SUPABASE_URL` per environment.** Next inlines `NEXT_PUBLIC_*`
   into client bundles at build, so the prod image's browser code is hard-wired to the prod
   Supabase host and can't be pointed at the CI test database. That blocks (1) and prevents a
   single immutable artifact promoted through environments.
3. **"Integration" only covers the DB seam.** `tests/integration/` is `rls/` + `rpc/` only —
   real coverage of one (high-risk) boundary. The app has **17 route handlers** and **20
   server-action files**; the HTTP edges that do signature-verify / idempotency / DB-write /
   external-call (payment callbacks, the GoTrue send-email webhook, redeem-token, newsletter,
   vitals) are essentially untested. `STRATEGY.md` already flags "money-path integration" as
   pending Phase 2.

**Decision (chosen 2026-06-26):** Option B — **same-origin Supabase via a `/sb` path** so the
browser/SSG value is a build-baked *constant* (`/sb`) while the per-env difference lives in
routing. This is the only option that keeps a single image **and** preserves SSG (an env-specific
Supabase host frozen into static cover-image URLs is what otherwise makes single-image + SSG
incompatible). Plus: build once → **E2E against the built image** → deploy that exact digest; and
expand integration coverage to the app's money/security edges.

**Target pipeline:** `audit + unit + integration` (source/DB gates, no image) → `build` (single
env-agnostic image) → `e2e` (runs the built image) → `deploy` (promote the same digest). Unit and
integration stay on source because neither exercises the Next runtime; e2e is the only seam where
the artifact is in the request path.

**Non-goals:** load testing (that's the stress harness), turning realtime back on, multi-region,
moving server-side Supabase off its direct connection.

---

## Part 1 — Plumbing

### Architecture: same-origin `/sb`

Today (prod): browser → `https://api.mildfire.dev/...`; nginx routes `api.mildfire.dev`→Kong,
`bookstore-app.mildfire.dev`→app. Target: browser only ever talks to **its own origin** under
`/sb/*`, which is routed to Supabase. The baked value is the constant string `/sb` — identical in
dev, CI, and prod — so SSG stays valid everywhere and no `NEXT_PUBLIC_*` host is inlined.

```
browser → <app-origin>/sb/{rest,auth,storage,realtime}/v1/...   (baked constant "/sb")
   prod:  /sb/* → Kong (Supabase API)        per-env routing only
   CI:    /sb/* → 127.0.0.1:54321 (supabase-cli)
   dev:   /sb/* → 127.0.0.1:54321
server-side app → SUPABASE_INTERNAL_URL (runtime env; direct to Kong/local, never inlined)
```

**Proxy mechanism — sub-decision (recommend A):**
- **A. Next `rewrites()`** — `next.config` rewrites `/sb/:path*` → `${SUPABASE_INTERNAL_URL}/:path*`,
  destination read from **runtime** env at server start (works in standalone). One mechanism, one
  env var, identical in every environment, **no per-env proxy config and no CI proxy sidecar**.
  Cost: the Next server proxies Supabase REST/auth/storage traffic (acceptable here — realtime is
  stubbed/0×, uploads are small; image bytes already flow through the `next/image` optimizer
  server-side regardless). WebSockets aren't proxied by rewrites — fine, realtime is unused.
- **B. nginx `location /sb/`** — add a block under the app server that `proxy_pass`es to `kong:8000`
  (strip `/sb`). Keeps Supabase traffic off the Next process; reuses existing infra. Cost: per-env
  proxy config, and CI needs an nginx/caddy sidecar on the supabase network. Heavier.

Recommend **A** for simplicity and CI-friendliness; revisit B only if the app-as-proxy load is
ever measured to matter.

### Touch-points (what changes)

| Area | File(s) | Change |
|---|---|---|
| Browser client URL | `src/lib/supabase/client.ts` | base = `\`${window.location.origin}/sb\`` (runtime from origin — no env). Anon key: keep `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public, fine to bake) **or** also serve via `/sb`-style runtime; decide in 1.1. |
| Storage/in-page URLs | `src/lib/storage.ts` | `publicUrl()` returns **relative** `/sb/storage/v1/object/public/{bucket}/{path}`. `next/image` accepts a relative `src` as a local path → optimizer fetches same-origin `/sb` → routed to Supabase. |
| Absolute storage URLs | `src/lib/storage.ts` + callers in `src/lib/email/*`, `src/app/api/social-card/*`, OG metadata | Email / OG / social-card need an **absolute** URL — add `absoluteStorageUrl()` = `${siteUrl}/sb/...` using the runtime site origin (`src/lib/siteUrl.ts`). Audit every storage-URL caller and classify in-page (relative) vs absolute. |
| `next/image` allowlist | `next.config.ts` | Relative `/sb/...` srcs need **no** `remotePatterns`. Remove the `api.mildfire.dev` / `*.supabase.co` / localhost:54321 patterns once all srcs are relative (keep until migration verified). |
| Rewrite (mechanism A) | `next.config.ts` | `async rewrites()` → `{ source: '/sb/:path*', destination: \`${process.env.SUPABASE_INTERNAL_URL}/:path*\` }`. |
| Server client | `src/lib/supabase/server.ts`, `authCookie.ts` | Read `SUPABASE_INTERNAL_URL` (runtime) instead of `NEXT_PUBLIC_SUPABASE_URL`. Server env was never the inlining problem. |
| Direct REST/photo helpers | `src/api/books/getBookPhotos.ts`, `src/api/admin/books/getAdminBookPhotos.ts`, `src/proxy.ts` | Repoint from `NEXT_PUBLIC_SUPABASE_URL` to the runtime server URL (`SUPABASE_INTERNAL_URL`) or `/sb` as appropriate. |
| Auth redirect URLs | `src/app/api/auth/google/route.ts`, `auth/callback`, `auth/confirm`, `src/lib/auth/actions.ts` | These already build off `NEXT_PUBLIC_BASE_URL` / `siteUrl` (app origin), **not** the Supabase host — verify they're unaffected. GoTrue's own `GOTRUE_HOOK_SEND_EMAIL_URI` etc. stay server-side. |
| Env model | `Dockerfile`, `deploy/production/docker-compose.yml` + `.env.example`, CI | Stop passing `NEXT_PUBLIC_SUPABASE_URL` as a build-arg. Introduce runtime `SUPABASE_INTERNAL_URL`. Keep `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public) decision per 1.1. Update `docs/CONCERNS.md` prod-cutover notes. |
| Tests | `src/lib/storage.test.ts` | Update expected URLs to `/sb/...`. |

### Anon key — the single-image crux (sub-decision 1.0b)

The Supabase **anon key is environment-specific** (a JWT signed by each instance's secret —
local supabase-cli's demo key ≠ prod's). Baking `NEXT_PUBLIC_SUPABASE_ANON_KEY` therefore breaks
single-image (CI's image would carry the prod key but talk to the local DB → Kong rejects the
apikey). The URL is solved by the `/sb` constant; the **key still needs to be runtime**. It's
*public* (RLS is the guard), so exposure isn't the issue — only build-time inlining is. Two ways
that both keep SSG (the key never lives in static HTML or the bundle):

- **Option 1 — runtime config fetch (recommended; explainable).** A tiny dynamic route
  `GET /api/public-config` returns `{ anonKey: process.env.SUPABASE_ANON_KEY }` (read server-side at
  request time). `providers.tsx` fetches it once on mount and caches it; `createClient()` reads the
  cached key. Safe because Supabase use is already deferred to first interaction (config lands
  first); the deferred anon-session trigger `await`s config to be certain. Cost: `createClient`
  becomes config-dependent (~30–40 lines: route + cache + threading). No proxy header magic.
- **Option 2 — proxy-injected apikey.** Browser client is built with a baked **placeholder** key
  (a constant → single-image-safe); `src/proxy.ts` intercepts `/sb/*`, overrides `apikey` with the
  runtime `SUPABASE_ANON_KEY`, and rewrites the anon `Authorization: Bearer <placeholder>` to the
  real key (user-JWT Authorization passes through untouched). Client code unchanged. Cost: header
  logic in the proxy + a dependency on supabase-js's header behavior, and external-rewrite
  request-header mutation must be verified in Next 16 — more "clever", higher 3am-debug risk.

Recommendation: **Option 1** — more code but obvious and decoupled from supabase-js internals.

### Phase 1.1 — Same-origin app changes (local-first)

Implement the touch-points above; mechanism A rewrite. Drive everything against the **local
supabase-cli** with `SUPABASE_INTERNAL_URL=http://127.0.0.1:54321`. Verify in a real browser:
anon sign-in, cart, add-to-cart, avatar upload (storage write), cover images load via
`/_next/image?url=%2Fsb%2F...`, OAuth redirect, email links absolute. Confirm **book pages stay
SSG** (`next build` output shows `●`) and their cover URLs are the `/sb` constant.

**Acceptance:** app fully works against local Supabase with zero `NEXT_PUBLIC_SUPABASE_URL`
references remaining (grep clean); `next build` keeps book-page SSG; `storage.test.ts` green.

### Phase 1.2 — Prod proxy + env cutover

- Mechanism A: set `SUPABASE_INTERNAL_URL=http://kong:8000` in the prod app service env
  (`docker-compose.yml`); the app rewrites `/sb/*` → Kong internally. (`api.mildfire.dev` tunnel
  route can stay for now as a fallback / server path; browser stops using it.)
- Remove `NEXT_PUBLIC_SUPABASE_URL` build-arg from `Dockerfile` + the build workflow.
- **Backup the prod DB before any prod change** (CLAUDE.md hard rule, even though this is app/proxy
  config). Deploy via the normal promote; smoke-test live: images, auth, cart, upload.

**Acceptance:** live site fully functional through `/sb`; `api.mildfire.dev` no longer required by
the browser; image is now env-agnostic (same image bytes would run in CI).

### Phase 1.3 — E2E against the built image (CI)

- `build` job already pushes `:<sha>` to GHCR. Add an `e2e` job that `needs: build`:
  1. `supabase start` (migrations) + load seed (as today).
  2. `docker run --network host -e SUPABASE_INTERNAL_URL=http://127.0.0.1:54321 -e NEXT_PUBLIC_SUPABASE_ANON_KEY=… -e NEXT_PUBLIC_BASE_URL=http://localhost:3000 -e PAYMENT_PROVIDER=mock -e SEND_EMAIL_HOOK_SECRET=… ghcr.io/...:<sha>` (host network so the container reaches `127.0.0.1:54321` and Playwright reaches `localhost:3000`).
  3. Wait for `/` healthy.
  4. `playwright test` with `baseURL: http://localhost:3000` and **no `webServer`** (the image is the server). In `playwright.config.ts`, make `webServer` CI-conditional → omitted in CI.
- This runs the **exact shipped artifact** against the test DB — the whole point of Option B.

**Acceptance:** e2e job green driving the GHCR image; a deliberately-broken prod-only path
(e.g. a bad `generateStaticParams`) is caught here where the dev server would have missed it.

### Phase 1.4 — Re-wire `ci.yml` + gate deploy on the verified SHA

- New order: `audit + unit + integration` → `build` → `e2e (image, needs build)`. (`lint` stays a
  parallel gate; PR build-check unchanged.)
- `deploy-production.yml`: before promoting, query the GitHub Checks API for the resolved main
  SHA and **abort if its CI run isn't `success`** — so deploy can't ship a SHA whose image failed
  e2e, without re-running any tests. (Lightweight `gh api` step; replaces the old "re-run all
  tests in deploy" gate.)

**Acceptance:** one CI run per main push covering audit→…→e2e-on-image→build; production push
deploys only a green SHA, no test re-runs.

---

## Part 2 — Coverage: app-edge integration tests

The DB seam (`rls/`, `rpc/`) stays as-is. Add a new class of integration tests for the **HTTP
edges** — the money/security boundaries currently only happy-path-touched by e2e or untested.

**Flavor decision per test:**
- **Import-and-invoke** (preferred for logic/security): `import { POST } from '.../route'`, build a
  `Request`, call it, assert `Response` + DB side-effects against local Supabase. Runs in Vitest on
  source — fast, deterministic, no image. Best for signature/amount/idempotency/malformed-payload.
- **HTTP-against-the-image** (only when Next routing/middleware is the thing under test): fold into
  the Phase-1.3 image e2e instead.

Most of the below are **import-and-invoke** and run in the existing `integration` job (pre-build).

### Phase 2.1 — Harness
- Helper to invoke a route handler with a crafted `Request` + the test Supabase env, and to assert
  `Orders`/`Subscribers`/etc. rows after. Extend `tests/integration/stack.ts`.

### Phase 2.2 — Payment callbacks (highest value: money)
Files: `src/app/(site)/payments/success/route.ts`, `payments/fail/route.ts`,
`src/app/api/payments/mock/pay/route.ts`, `api/payments/robokassa/result/route.ts`.
- Valid signature + correct amount → order `paid`, cart wiped, `UserSubscriptions` anchored.
- **Bad signature → rejected, order untouched.**
- **Amount mismatch → rejected.**
- **Double callback → idempotent** (one paid transition; relies on `mark_order_paid` — assert at the
  handler level, not just the RPC level).
- FailURL → order stays `pending` (resumable), not cancelled.

### Phase 2.3 — Send-email webhook
File: `src/app/api/auth/hooks/send-email/route.ts`.
- Valid Standard-Webhooks signature (`SEND_EMAIL_HOOK_SECRET`) → 200, Resend called (mock the
  Resend client). **Forged/missing signature → 401, no send.** Recipient = `new_email || email`.

### Phase 2.4 — Token / opt-in flows
Files: `src/app/(site)/redeem/[token]/route.ts`, `newsletter/confirm`, `newsletter/unsubscribe`.
- Valid token → expected state change; invalid/expired/replayed token → safe rejection, no leak.

### Phase 2.5 — Vitals sink + misc
File: `src/app/api/vitals/route.ts`. Malformed/oversized payload → handled, no crash, no bad row.

### Phase 2.6 — Server-action money path (optional, after 2.2–2.4)
`startCheckoutAction` (`src/lib/orders/actions.ts`): empty cart, invalid gift cards, gift-card
over-limit, fully-covered → `paid` immediately. Import-and-invoke against local Supabase.

**Acceptance (Part 2):** the money + security edges have explicit pass **and** reject assertions;
`STRATEGY.md` Phase-2 "money-path integration" marked done; new tests run in the pre-build
`integration` gate.

---

## Risks / rollback

- **Same-origin migration is broad** (every storage-URL caller, auth redirect, the browser client).
  Mitigation: Phase 1.1 is entirely local + grep-verifiable before any prod change; keep the old
  `remotePatterns` until verified; `api.mildfire.dev` tunnel route stays as fallback during cutover.
- **Next-as-proxy load** (mechanism A): acceptable for this traffic profile; B (nginx) is the
  escape hatch if measured otherwise. Documented, reversible (it's config).
- **Prod-touching** (Phase 1.2): fresh DB backup first; promote + live smoke; revert = redeploy the
  previous image (the prior `:<sha>` is still in GHCR) and restore the old env/proxy.
- **SSG regression check**: every phase that touches rendering must confirm `next build` still marks
  book pages `●` (SSG) — that's the whole reason Option B was chosen over runtime injection.
- **Deploy gate**: the Checks-API gate (1.4) depends on the CI run existing for the SHA; fallback is
  the manual "only promote green main" discipline already in use.

---

## Tracker

Legend: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

### Part 1 — Plumbing
- [x] 1.0 Proxy mechanism: **A (Next rewrites)** chosen (2026-06-26)
- [x] 1.0b Anon-key handling: **Option 2 — proxy-injected apikey** chosen (2026-06-26). Consequence: `/sb` routing lives in **middleware (`src/proxy.ts`)**, not `next.config` rewrites (only middleware can mutate the forwarded request headers). Mechanism A is realized via the proxy. **First step is a spike** to confirm Next 16 middleware can rewrite `/sb/*` to an external URL *with* mutated request headers.
- [~] 1.1 Same-origin app changes (local-first). **Browser-facing slice DONE + browser-verified**
  (2026-06-26): `/sb` proxy in `src/proxy.ts` (apikey + Authorization injection, matcher) — spike +
  live (REST `/sb` 200 no-key, `POST /sb/auth/v1/signup` 200, cart `201`, covers via
  `/_next/image?url=%2Fsb%2F…`); browser client → `${origin}/sb` + placeholder key; `authCookie.ts`
  pinned to a constant (fixes the prod cookie-name mismatch the host-derived name would cause);
  `storage.ts` → relative `/sb` + `absoluteStorageUrl()`; `storage.test.ts` updated. `sameOrigin.ts`
  added. Remaining 1.1 sub-tasks (work via NEXT_PUBLIC fallbacks for now, so nothing is broken):
  - [ ] Server anon key `NEXT_PUBLIC_SUPABASE_ANON_KEY` → runtime `SUPABASE_ANON_KEY` (`server.ts` ×3)
  - [ ] Photo helpers `getBookPhotos` / `getAdminBookPhotos` → relative `/sb`
  - [ ] `createAdminClient` signed-URL host → app-origin `/sb` (currently public URL — browser-reachable, works)
  - [ ] OAuth `/api/auth/google` + `server.ts:89` public-origin handling under `/sb`
  - [ ] Email / OG / social-card → `absoluteStorageUrl()`
  - [ ] `next.config` remotePatterns cleanup once all srcs are relative; confirm book-page SSG intact
- [ ] 1.2 Prod proxy + env cutover (compose `SUPABASE_INTERNAL_URL`, drop `NEXT_PUBLIC_SUPABASE_URL`
  build-arg; backup; promote; live smoke)
- [ ] 1.3 CI e2e runs the **built image** (`docker run` on host network; Playwright no-webServer)
- [ ] 1.4 `ci.yml` order audit+unit+integration → build → e2e(image); deploy gates on the SHA's CI
  conclusion (no test re-run)

### Part 2 — Coverage
- [ ] 2.1 Route-handler invoke harness (`stack.ts` extension)
- [ ] 2.2 Payment callbacks — signature / amount / idempotency / fail-stays-pending
- [ ] 2.3 Send-email webhook — signature accept/reject, recipient
- [ ] 2.4 Redeem token + newsletter confirm/unsubscribe
- [ ] 2.5 Vitals sink malformed payload
- [ ] 2.6 `startCheckoutAction` money path (optional)
- [ ] Update `docs/testing/STRATEGY.md` (money-path integration done) + this tracker

### Docs
- [ ] Update `frontend-architecture-rendering.md` (same-origin Supabase note) + `deploy/production`
  README/.env.example + `docs/CONCERNS.md` prod-env items on cutover
