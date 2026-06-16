# Frontend Architecture & Rendering Strategy — Audit + Plan

**Status:** planning (no code changes yet). **Created:** 2026-06-16.

Goal: push as much rendering as possible to the server, reserve `'use client'` for
**interactive leaves**, and move the hero pages (home, book detail) toward a
**prerendered static shell with dynamic content streamed into Suspense slots** (PPR).
Paired with a full data-fetching / best-practices audit.

## How this was produced

Four parallel read-only audits (file:line evidence):
1. Client/server boundary — where `'use client'` is drawn too high.
2. PPR feasibility + rendering strategy + the two hero pages.
3. Data-fetching architecture (server vs client, hydration, waterfalls, caching).
4. Next.js best-practices + perf (providers, fonts, images, code-split, SEO infra).

## What's already good (do NOT churn)

- Route `page.tsx` and section wrappers are **server components**; `/about` is a model
  page (server sections, client islands only for forms/video/marquee).
- **Server-prefetch + `dehydrate`/`<HydrationBoundary>` + client `useQuery`** is used
  correctly for all user-scoped state (cart/likes/promo/gift-cards/orders). `cart.tsx`
  is exemplary; pricing stays server-authoritative (`quote_cart`).
- **Fonts**: `next/font` (Montserrat swap + local Chequeblack) via CSS vars — no FOIT.
- **LCP images**: hero `Slider` cover + `BookCover` use `priority` + `placeholder="blur"`
  from the DB blur columns — the blur pipeline is actually consumed. No raw `<img>` in
  the storefront. `AddToCartModal` is already `next/dynamic({ssr:false})`. Lexical editor
  is admin-only (not in storefront bundle).
- `LikeButton` / `StorySubmitButton` are model "server body + client leaf" splits.

## Key finding — the keystone

**`src/app/(site)/layout.tsx` reads cookies in the render path** (it server-prefetches
cart/likes/promo/gift-cards/quote, each via `createClient()` → `await cookies()`). Because
this layout wraps every `(site)` route, **the entire storefront is opted out of static
rendering** — even though catalog/book data uses a cookie-free anon client and is inherently
cacheable. **Nothing under `(site)` can be static or PPR until this is fixed.** This is
Phase 0 and unblocks everything else.

**PPR mechanism in Next 16.2.6 (verified against `node_modules/next`):** the old
`experimental.ppr` opt-in **throws at startup** — it has been merged into the top-level
**`cacheComponents: true`** flag (which also enables `'use cache'`). It is *all-or-nothing*,
project-wide: once on, every uncached dynamic read must be `<Suspense>`-wrapped or
`'use cache'`-annotated or the build errors. So PPR is the *last* phase, after the layout is
cookie-free and Suspense boundaries exist.

## Consolidated findings

### Rendering / static generation
- R1 — `(site)/layout.tsx` cookie reads force whole storefront dynamic. **(keystone)**
- R2 — **No `generateStaticParams`** anywhere → book/author pages never prebuilt (high-value SSG, independent of PPR).
- R3 — `<Suspense>` used **nowhere**; only 2 `loading.tsx` (book detail, admin). Home, catalog, cart, checkout, authors, gift-cards, profile children have no streaming fallback.
- R4 — PPR only via `cacheComponents: true` (project-wide migration), `experimental.ppr` throws.

### Data fetching
- D1 — Book detail head waterfall: `getPeriodical → getPeriodicalIssueRedirect → getBook` sequential (`books/[slug]/page.tsx:56-65`).
- D2 — **Duplicate RPC**: `getBook` and `getBookEditions` both call `get_catalog_book_by_slug` with the same arg → runs twice per book render. `generateMetadata` re-fetches it a third time.
- D3 — **No `cache()` / `unstable_cache` / `revalidate` in the read path** (systemic). No per-request dedup; catalog re-queried every request.
- D4 — Checkout fetches profile client-side, **never prefetched** (`checkout/page.tsx:40`); also uses `useSupabaseUser` for `isAnonymous` — CLAUDE.md explicitly warns against this. Resolve server-side.
- D5 — Profile has two unreconciled sources (context `initialProfile` + parallel TanStack `profileQueryKey`).
- D6 — `getBooks` tail waterfall (`getPeriodicalHrefs`: Titles then Periodicals serial) — minor.
- D7 — `MyBooksList`/`MyCoursesList` ship the full orders payload + derive client-side — could derive server-side.

### Client/server boundary (push interactivity to leaves)
- B1 — **Card-fusion** (dominant): large static body + one cart/like/copy control fused into one client component. Targets, by value: `BookCard` (every catalog/home tile — highest), `GiftCardTierCard`, `SubscriptionCard`, `BoxSetCard`, `GiftCardWalletItem`. Fix uniformly: server presentational body + tiny client action leaf (the `LikeButton` pattern).
- B2 — Static cards co-located *inside* `'use client'` carousel modules (`SubscriptionCard` in `SubscriptionsCarousel.tsx`; `GiftCardTierCard`/`ArticleCard` imported by Swiper) → client even when a server grid renders them. Splitting B1 lets the server desktop grids stay server.
- B3 — Masonry/feed parents (`ArticleBatch`, `ArticlesFeed`) cascade every `ArticleCard` client (defensible: infinite-scroll + JS masonry, but note the whole feed tree is client).
- B4 — **False directives**: `Marquee` (pure CSS animation, zero client need — delete `'use client'`); `Button`'s `href` branch is a pure `<Link>`.
- B5 — `Header` (global) is mostly static `<Link>`s but fully client; can extract a static logo+nav server sub-component, keep cart badge / search / burger / dropdowns as client islands.
- B6 — Stray `console.log('play button clicked')` at `HeroVideo.tsx:17` (cleanup).

### Perf / Next best-practices
- P1 — **No `sitemap.ts` / `robots.ts`** (the `src/app/manifest/page.tsx` is a *page*, not a metadata route). SEO gap for a content/commerce site. **(high)**
- P2 — **No `metadataBase`** in root metadata → relative OG/canonical URLs don't resolve (`NEXT_PUBLIC_BASE_URL` already exists). **(high)**
- P3 — **Double `auth.getUser()` per request** (`proxy.ts:77` + `layout.tsx:36`); `getUser()` is an auth-server round-trip. Root layout only needs `is_anonymous` → use `getClaims()` (local JWT decode). **(high)**
- P4 — **Swiper eager in the homepage critical path** (`BaseSlider` imports `swiper/react`+css statically; home renders `Slider` directly) — ~120-150 KB in first-load JS on the LCP route. Defer below-fold carousels via `next/dynamic`.
- P5 — Almost no `loading.tsx` (= R3).
- P6 — `Providers`/`CartProvider` is a large root client boundary on every page incl. static content pages; verify cart API modules don't pull server-only/heavy code (zod/normalizers) into the client bundle.
- P7 — `output:'standalone'` + `@svgr/webpack` forces the build onto **Webpack, not Turbopack**. Evaluate the Turbopack-compatible SVGR path (`turbopack.rules`).
- P8 — No `experimental.optimizePackageImports` for Radix / TanStack barrels.
- P9 — `BookCard` covers never get `priority` — thread `priority` to the first ~4-6 grid cards for grid-first LCP.
- P10 — QueryClient defaults thin (`staleTime:60s`, `retry:1`); add `refetchOnWindowFocus:false` so server-hydrated queries don't refetch on focus.
- P11 — `ReactQueryDevtools` statically imported (guard with `next/dynamic` to guarantee it's never in the prod bundle).

## Plan (phased)

### Phase 0 — Remove all cookie reads from the storefront render path *(keystone; unblocks all static/PPR)* — **DONE + browser-verified**
- **`(site)` layout:** remove the per-user server prefetch entirely; `CartProvider`/`LikeButton`
  client-fetch (they already do). *(Initially tried a Suspense-wrapped server-prefetch island —
  Option A — but a browser test proved that pre-PPR the consumers mount before the late island
  hydrates, so they client-fetch **anyway**, making the server prefetch pure redundant work
  (~12 fetches) AND keeping a cookie read in the tree. Pivoted to client-fetch — Option B.)*
  Server-prefetch-hydrate is fundamentally incompatible with static rendering (it reads cookies
  in render); per-user data must be client-fetched (or, under PPR, a dedicated cart-badge island).
- **Root `app/layout.tsx`:** removed `getUser()` (it duplicated the proxy's per-request call).
  The proxy sets a non-HttpOnly `bookstore_has_session` hint cookie; `providers.tsx` reads it
  client-side to gate anonymous sign-in (stays client-side, so JS-less bots don't create anon users).
- `getUser()→getClaims()` is **moot under HS256** (proven from SDK source — falls back to network
  `getUser`); local verify needs asymmetric keys → Solution B (Phase 5).
- **Result (verified):** static routes 3 → **13** (`/cart`, `/checkout`, `/auth/*`, `/contacts`,
  `/investors`, `/abzac`, …). `/`, `/books/[slug]`, `/about` remain `ƒ` only because of
  `searchParams` (home → Phase 4) and missing `generateStaticParams` (dynamic segments → Phase 2),
  **no longer because of cookies**. Browser smoke test green: anon sign-in fires for a fresh
  visitor, reload preserves the same anon user (no clobber, hint flips 0→1), cart/likes fetch 200,
  no console errors.

### Phase 1 — Quick wins (low-risk, independent)
- P2 `metadataBase`, P1 `robots.ts` + `sitemap.ts` (enumerate books/authors/articles).
- P10 `refetchOnWindowFocus:false`; P11 dynamic-guard devtools; P8 `optimizePackageImports`.
- P9 `priority` on first few `BookCard`s; B6 remove `HeroVideo` `console.log`; B4 drop the false `Marquee` `'use client'`.
- **Acceptance:** build clean; Lighthouse SEO ↑; no devtools/extra barrels in prod bundle.

### Phase 2 — Static generation + caching + book-detail waterfall
- R2 add `generateStaticParams` to `books/[slug]` (and consider `authors/[id]`, `dino-magazine/[slug]`).
- D3 wrap pure read fns (`getBook`, `getPeriodical`, catalog facets) in React `cache()` for
  per-request dedup — this also fixes D2 (duplicate RPC) and the `generateMetadata` re-fetch.
  Add `unstable_cache`/`revalidate` for rarely-changing catalog/facets.
- D1 collapse the book-detail head waterfall (batch the periodical probes; branch after one await).
- **Acceptance:** book page issues `get_catalog_book_by_slug` once; known slugs prebuilt; fewer round-trips on the hottest page.

### Phase 3 — Client/server boundary: push interactivity to leaves
- B1 split the product cards (server body + client action leaf), **`BookCard` first**, then
  `GiftCardTierCard`, `SubscriptionCard`, `GiftCardWalletItem`, `BoxSetCard`.
- B2 move co-located static cards out of the client carousel modules so server desktop grids stay server.
- B5 extract `Header`'s static logo+nav into a server sub-component; keep cart/search/burger/dropdowns as islands.
- **Acceptance:** catalog/home card markup renders on the server; `'use client'` count drops
  meaningfully; only interaction leaves remain client.

### Phase 4 — Suspense / streaming / loading skeletons
- R3/P5 add `loading.tsx` for home + catalog + high-traffic dynamic routes.
- Wrap `NewProducts` (home, `searchParams`-driven), book-detail secondary sections
  (`similarBooks`, `BoxSetsSection`), and the Phase-0 per-user chrome island in `<Suspense>`.
- P4 defer below-fold Swiper carousels via `next/dynamic`.
- **Acceptance:** static shells paint immediately; dynamic/below-fold content streams; smaller first-load JS on home.

### Phase 5 — Enable PPR (`cacheComponents`) + asymmetric JWT keys *(last)*
- Set `cacheComponents: true`; annotate anon catalog reads with `'use cache'`; fix every
  remaining build-surfaced uncached dynamic read (Suspense-wrap or `'use cache'`).
- **Acceptance:** home + book detail serve a prerendered static shell with dynamic islands streamed; build is green under cacheComponents.

#### Solution B — migrate self-hosted Supabase off legacy HS256 → asymmetric signing keys
*Separate security+perf initiative; pairs with PPR because it makes the auth reads in the
remaining dynamic islands cheap. NOT a blocker for static rendering (the cookie read is what
forces dynamic, not the verification algorithm).*

- **Why:** with HS256, `supabase.auth.getClaims()` falls back to a network `getUser()` (proven
  from `@supabase/auth-js` source — `header.alg.startsWith('HS') ⇒ signingKey=null ⇒ getUser`).
  Asymmetric keys (ES256 + JWKS) let `getClaims()` verify **locally** (cached JWKS, no
  auth-server round-trip) — speeds the proxy's per-request check and any island auth reads.
  Also a security win: rotatable keys, public JWKS, no shared `JWT_SECRET` across services.
- **Scope (deployment-level, prod-touching — do with a backup + staged rollout):**
  - GoTrue: enable asymmetric signing key, expose JWKS (`/auth/v1/.well-known/jwks.json`).
  - PostgREST: validate via JWKS (`PGRST_JWT_SECRET` → JWKS URL / key set) instead of the shared secret.
  - Storage (+ any other JWT-validating service): same JWKS validation.
  - Anon/service API keys: these are themselves `JWT_SECRET`-signed today — decide transition
    (keep legacy keys validating during a dual-key window, or move to the publishable/secret
    key model). Update `deploy/production/.env(.example)` + Kong if needed.
  - Then swap the proxy's `getUser()` → `getClaims()` (now local) and re-check TTFB.
- **Acceptance:** `getClaims()` verifies with no network call; all services validate via JWKS;
  prod auth/REST/storage smoke tests still green; documented in `deploy/production/`.

### Phase 6 — Build system (optional, decoupled)
- P7 evaluate Turbopack-compatible SVGR (`turbopack.rules`) to drop the Webpack pin; D5/D7
  data-source unification + server-side order derivation as cleanup.

## Risks / caveats
- **Phase 0 touches the documented auth/session + cart-hydration contract** (CLAUDE.md). Verify
  session-refresh semantics and that cart/likes still hydrate without a first-load spinner.
- **Phase 5 is a project-wide migration**, not a flag flip — budget for build-error churn.
- Keep the shared-UI-component rule (no forks): card splits add a *leaf*, not a duplicate card.
- Re-run `npm run build` + a real browser check after each phase (curl misses CORS/hydration).

## Tracker

Legend: `[ ]` pending · `[~]` in progress · `[x]` done

### Phase 0 — keystone — **DONE (browser-verified) on branch `feat/ppr-phase0-layout`**
- [x] `(site)` layout reads no cookies — removed the per-user server prefetch; `CartProvider`/`LikeButton` client-fetch. *(Pivoted from the Option-A Suspense island after a browser test showed it double-fetched (server prefetch + client refetch ≈ 12 requests) and didn't hydrate pre-PPR. Server-prefetch-hydrate is incompatible with static rendering; per-user data must be client-fetched — or a dedicated cart-badge island under PPR.)*
- [x] Root `app/layout.tsx` auth-free — removed `getUser()` (duplicated the proxy's per-request call). Proxy sets non-HttpOnly `bookstore_has_session` hint cookie; `providers.tsx` gates anon sign-in client-side off it (stays client-side, so JS-less bots don't create anon users). Duplicate auth call gone = the **P3 win**.
- [x] `getUser()→getClaims()` confirmed **moot under HS256** (SDK falls back to network `getUser`) → asymmetric-key migration is **Solution B (Phase 5)**.
- [x] `books/[slug]` + `/` no longer cookie-forced-dynamic — static routes **3 → 13**; remaining `ƒ` on hero pages is `searchParams` (home → Phase 4) + missing `generateStaticParams` (dynamic segments → Phase 2), not cookies.
- [x] Browser smoke test: fresh-visitor anon sign-in fires; reload preserves same anon user (hint 0→1, no clobber); cart/likes 200; zero console errors.
- [ ] Merge `feat/ppr-phase0-layout` → `update`.

### Phase 1 — quick wins — **DONE (merged to `update`, CI green)**
- [x] `metadataBase` in root metadata (P2)
- [x] `robots.ts` (P1)
- [x] `sitemap.ts` — static public routes + books (`getAllBookSlugs`) + authors + articles; ISR `revalidate=3600`; each source guarded. `robots.txt`/`sitemap.xml` build as static `○`. (P1)
- [x] QueryClient `refetchOnWindowFocus:false` (P10)
- [x] Dynamic-guard `ReactQueryDevtools` (next/dynamic + NODE_ENV) (P11)
- [x] `experimental.optimizePackageImports` for Radix (6) + TanStack (P8)
- [x] Remove `HeroVideo` `console.log` (B6)
- [x] Drop false `'use client'` on `Marquee` (B4)
- [~] **P9 (`priority` on `BookCard`s) — intentionally SKIPPED.** There is no grid-first catalog page (the catalog *is* the home page, where the grid sits below the hero `Slider` LCP). Prioritizing grid covers would compete with the hero LCP and hurt, not help. Reconsider only if a grid-first listing page is ever added.

### Phase 0 follow-up — admin prerender CI fix — **DONE (merged, CI green)**
- [x] `admin/(panel)/layout.tsx` → `export const dynamic = 'force-dynamic'`. Making the root layout auth-free (Phase 0) let the build's prerender pass descend into admin pages and execute `getAdminNavCounts()` → `createAdminClient()` → `SUPABASE_SERVICE_ROLE_KEY`, which is **server-only and absent from the CI build env** → `supabaseKey is required`. Admin is auth-gated/per-request — `force-dynamic` is the correct mode (the service key belongs at runtime, never in the build). Storefront SSG is unaffected (it uses the public anon key). Reproduced + verified locally with the service key blanked.

### Phase 2 — SSG + caching + waterfall — *(branch `feat/ppr-phase2-book-ssg`, build-verified)*
- [x] `generateStaticParams` for `books/[slug]` (`getAllBookSlugs` — published, non-issue slugs; returns [] on error → degrades to on-demand). Build now prerenders `/books/[slug]` as **● SSG** (+ `ƒ` on-demand fallback via dynamicParams). (R2)
- [x] React `cache()` on the `get_catalog_book_by_slug` rows (`getBook`+`getBookEditions` share one call) and on `getPeriodical`/`getPeriodicalIssueRedirect` → fixes the duplicate RPC (D2) + the `generateMetadata` re-fetch. (D3)
- [x] Collapse book-detail head waterfall — `getPeriodical`/`getPeriodicalIssueRedirect`/`getBook` now run via `Promise.all` instead of in series. (D1)
- [x] Build robustness for mass-SSG: `experimental.staticGenerationRetryCount: 3` + `staticGenerationMaxConcurrency: 4` (mass prerender was overloading Supabase → transient upstream error failed the build).
- [ ] `generateStaticParams` for `authors/[id]` + `dino-magazine/[slug]` (follow-up).
- [ ] `unstable_cache`/`revalidate` for catalog/facets — deferred (admin writes already `revalidatePath`; add time-based ISR if needed). (D3)
- [x] Browser-verified an SSG book page: renders (title/edition-tabs/content), anon sign-in fires, **add-to-cart → `POST /Cart 201`**, zero console errors.
- [ ] Merge `feat/ppr-phase2-book-ssg` → `update`.

### Phase 3 — boundary / leaves
- [ ] Split `BookCard` → server body + client add-to-cart leaf (B1)
- [ ] Split `GiftCardTierCard`, `SubscriptionCard`, `GiftCardWalletItem`, `BoxSetCard` (B1)
- [ ] Move co-located static cards out of client carousel modules (B2)
- [ ] Extract `Header` static logo+nav to server sub-component (B5)

### Phase 4 — Suspense / streaming — *(branch `feat/ppr-phase4-suspense`, browser-verified)*
- [x] Home catalog isolated into `HomeCatalog` (async child) behind `<Suspense fallback={<HomeCatalogFallback/>}>` — `searchParams` read + heavy `getBooks` moved off the shell, so hero/subscriptions/box-sets stream first and the filtered grid streams behind a skeleton. Verified: all sections render, `?q=` filtering still works (empties the grid → "Книги не найдены"), no console errors. (`/` stays `ƒ` until `cacheComponents`/Phase 5 — same as Phase 0's cookie isolation.)
- [ ] Route-level `loading.tsx` for home — NOT added: home is `(site)/page.tsx`, so a `(site)/loading.tsx` would over-broadly cover every `(site)` route (the route-group caveat in CLAUDE.md). The in-page Suspense fallback covers the catalog streaming. Revisit if a `(catalog)` route group is introduced.
- [ ] `<Suspense>` around book-detail secondary sections (similar/box-sets) — follow-up.
- [ ] `next/dynamic` for below-fold Swiper carousels (P4) — follow-up.
- [x] Infra: bumped `actions/checkout` + `actions/setup-node` `@v4 → @v5` across all workflows (GitHub Node 20 deprecation).
- [ ] Merge `feat/ppr-phase4-suspense` → `update`.

### Phase 5 — PPR + asymmetric JWT keys
- [ ] `cacheComponents: true` + `'use cache'` on anon reads; clear build errors (R4)
- [ ] Verify home + book detail prerendered shell + streamed islands
- [ ] **Solution B:** migrate self-hosted Supabase HS256 → asymmetric signing keys (ES256 + JWKS): GoTrue signs + exposes JWKS; PostgREST + Storage validate via JWKS; transition anon/service keys; then proxy `getUser()` → local `getClaims()`. Backup + staged rollout; smoke-test prod auth/REST/storage.

### Phase 6 — build/cleanup (optional)
- [ ] Turbopack-compatible SVGR; drop Webpack pin (P7)
- [ ] Unify profile data source (D5); server-derive MyBooks/MyCourses (D4/D7)
