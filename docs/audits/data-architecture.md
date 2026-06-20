# Data-Architecture Audit

**Scope:** how data is obtained, stored, mutated, served, and used across `chtivo-next`.
**Lens:** balanced — maintainability, correctness, and performance.
**Method:** static read of the repo (migrations, generated types, `src/api`, `src/entities`,
`src/lib`, contexts, hooks) plus read-only introspection of the running local Supabase
(`supabase_db_chtivo-next`) to verify RLS, grants, indexes, and scale.
**Date:** 2026-06-13. **Branch:** `update`.

> **Status (2026-06-20): all findings F1–F10 are resolved.** This audit is the
> analysis snapshot; the remediation is tracked in
> [data-architecture-fix-plan.md](../plans/data-architecture-fix-plan.md) (all phases ✅)
> and the high-level backlog in [data-architecture-refactor.md](../plans/data-architecture-refactor.md).
> Read the findings below as the *historical* problem statements, not open issues.

> This is an analysis document. The actionable, prioritized backlog lives in
> [docs/plans/data-architecture-refactor.md](../plans/data-architecture-refactor.md).

---

## 1. Executive summary

The data architecture is, in its bones, **sound and idiomatic** for a Next.js 16 App
Router + Supabase + TanStack Query stack. The layering is deliberate and mostly
consistent:

```
Postgres (tables + RLS + RPC functions)   ← source of truth
        │
   src/api/<domain>/*  +  src/lib/**/actions.ts   ← the ONLY Supabase callers
        │
   src/entities/<name>/  (server → normalize → client, validation)   ← shape boundary
        │
   RSC (direct) · TanStack Query (client reads/writes) · Server Actions (forms/auth/orders)
        │
   components (receive normalized props / consume hooks)
```

The read path is well thought through (catalog assembled in SQL RPCs that return
flat rows, normalized once, cached with a sane global `staleTime`), the write path
for commerce is genuinely careful (two-phase order, idempotent `mark_order_paid`,
immutable order snapshots, gift-card reservation/release), and the conventions in
`docs/conventions/DATA.md` are real and largely followed.

**But** the audit surfaced **one critical security/integrity hole** and a cluster of
**correctness and drift risks** that undercut the otherwise-good design, plus
structural friction that makes the catalog/editions area expensive to change.

### Verdict on the four questions

| Question | Answer |
|---|---|
| **Is the architecture right?** | Mostly yes. The layering and the SQL-RPC read model are the right shape. It is let down by an RLS gap (critical), a duplicated pricing source of truth, and a typed-RPC escape hatch used everywhere. |
| **Does it follow best practice?** | Largely. Strong on the RSC/Query/Action split, normalization boundary, idempotent payment RPCs, optimistic updates. Deviates on RLS coverage, dual-language business logic, and bypassing generated types for the entire RPC surface. |
| **Easy to change / expand / edit?** | Mixed. Adding a *domain* is mechanical and predictable. Touching the **catalog/editions** model is not — the 4-table edition design forces the same `UNION ALL` to be re-written in every read RPC and produces one fat `Book` type. Entity boilerplate is light but unevenly applied. |
| **Helps or hinders dev?** | Net help for ordinary CRUD; net hindrance in three hotspots: the editions model, the pricing logic (two copies), and RPC typing (cast at every call site). |

### Findings at a glance

| # | Finding | Layer | Severity |
|---|---|---|---|
| F1 | Catalog tables have **RLS disabled + anon write/TRUNCATE grants** → catalog publicly destroyable | Mutation/integrity | **Critical** |
| F2 | **Pricing logic duplicated** in TS (`cartTotals.ts`) and SQL (`create_pending_order`) | Mutation/integrity | High |
| F3 | Anon→user **migration failure silently swallowed** → silent loss of cart/orders/gift cards | Mutation/integrity | High |
| F4 | **DB↔code drift smells**: runtime RPC-signature fallback + `as unknown as RpcFn` cast (16×/12 files) | Fetching/types | High |
| F5 | **4-table editions model** → triplicated `UNION ALL` in every catalog RPC + fat `Book` god-type | Schema/modeling | Medium |
| F6 | **Missing FK indexes** on hot join/filter paths (editions `title_id`, `Titles_Authors`, `Orders.user_id`, …) | Schema/perf | Medium (scalability) |
| F7 | **Entity 4-file pattern unevenly applied** — stub `server.ts`, missing `validation.ts`, empty `user/` | Entity/boilerplate | Medium |
| F8 | **Catalog filter-options over-fetch** — heavy catalog RPC run twice, `limit 10000` to derive facets in JS | Fetching/perf | Low–Medium |
| F9 | **Legacy dead code**: two `place_order` overloads + `api/orders/placeOrder.ts` no longer on the path | Mutation | Low |
| F10 | **Minor convention deviations**: direct storage call in `AvatarUpload` component; 22× `select('*')` | Fetching | Low |

---

## 2. What is done well (keep these)

These are genuine strengths — the refactor must not regress them.

- **Single Supabase boundary.** Components don't call Supabase; reads go through
  `src/api/<domain>/`, writes through `src/lib/**/actions.ts`. The rule holds across
  the codebase (one minor exception, F10).
- **SQL-RPC read model.** `get_catalog_books`, `get_catalog_book_by_slug`,
  `get_similar_books`, `search_books` assemble the whole denormalized catalog row
  (authors, awards, workers, contexts, trailer) server-side and return flat/JSONB
  shapes, normalized once in `normalizeBook`. This is the right place for that join
  work and keeps the client dumb.
- **Two-phase commerce, done carefully.** `create_pending_order` writes a `pending`
  order without wiping the cart; `mark_order_paid` is **idempotent** (`status='paid'`
  early-returns), verifies the amount (`amount_due` ±0.01), and only then wipes the
  cart and provisions subscriptions/gift cards. Orders are **immutable price
  snapshots** (`original_total`, `book_discount_total`, `promo_discount`, shipping).
  Gift-card balances are reserved at order time and released on cancel
  (`cancel_pending_order`). `FOR UPDATE` row locks guard the critical sections.
- **RLS where it matters.** User-scoped tables (`Cart`, `Orders`, `OrderItems`,
  `Profiles`, `GiftCards`, `Likes`, `CartPromo`, `UserSubscriptions`) have RLS on
  with owner-scoped policies; `Subscribers` is locked to SECURITY-DEFINER RPCs only.
- **Curated generated types.** `src/types/database.ts` is a thin, correct facade over
  the generated `supabase.ts` (`Row`/`Insert`/`Enums`), not a hand-maintained
  duplicate — `ProductCategory` is the real DB enum.
- **TanStack hygiene.** Global `staleTime: 60s` (`src/app/providers.tsx`), query keys
  co-located with API fns, invalidation on mutation, and a textbook optimistic-update
  with rollback in `useToggleLike` (`src/hooks/useLikes.ts:25`).

---

## 3. Findings in detail

### F1 — Catalog tables are publicly writable (CRITICAL)

**Evidence (verified against the live DB):**

```
RLS disabled (0 policies):  Titles, Authors, CardBooks, Titles_Authors
Grants to anon AND authenticated on each:
  SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
```

In Supabase, RLS is the *only* thing standing between the browser-shipped `anon` key
and a table. With RLS **off** and `anon` holding `INSERT/UPDATE/DELETE/TRUNCATE`, any
visitor can, through PostgREST, modify or wipe the catalog
(`DELETE FROM "Titles"`, `TRUNCATE "Authors"`, insert spam rows, rewrite prices).
`CardBooks` (the Book2.0 edition table) is affected too — its sibling edition tables
`Ebooks`/`Audiobooks`/`PrintedBooks` correctly have RLS **on**, so this is also an
inconsistency: one of four edition tables slipped the net.

These tables only ever need to be **publicly readable**; all writes already go through
the admin panel (service role) and SECURITY-DEFINER RPCs.

**Recommendation:** enable RLS on all four; add `SELECT`-only public policies
(mirroring the `Ebooks`/`Audiobooks`/`PrintedBooks` policies); `REVOKE INSERT, UPDATE,
DELETE, TRUNCATE` from `anon`/`authenticated`. Ship as a migration; fold into the
baseline. Re-run the cross-check for any *other* RLS-off public table.

> This is the headline item. Everything else is quality; this is exposure.

---

### F2 — Pricing logic is implemented twice (HIGH)

The max-wins promo / book-discount / gift-card-eligible algorithm exists in two
languages:

- **SQL (authoritative):** `create_pending_order`
  (`supabase/migrations/20260101000000_baseline_schema.sql:280–526`).
- **TypeScript (display):** `calculateCartTotals` (`src/lib/cartTotals.ts:34`),
  consumed by the cart context (`src/contexts/cart.tsx:214`).

Both compute `originalUnitPrice` from `price/(1-discount/100)`, the per-line
`max(bookDiscount, promo)`, the cart-level `max(bookDiscountTotal, promoAmount)`, and
`giftCardEligibleTotal`. `docs/conventions/DATA.md` even flags the invariant ("apply
this in both places"), which is the tell: a business rule that must be hand-kept in
sync across a language boundary will drift. A divergence means the price the user sees
≠ the price charged.

**Recommendation:** make the server the single source of truth for *money*. Expose a
read-only `quote`/`preview_order_total` RPC that returns the same numbers
`create_pending_order` will use, and have the cart show those (the client can keep a
cheap optimistic estimate, but the displayed/charged figure should come from one
place). At minimum, extract the shared SQL into one function both `create_pending_order`
and a quote RPC call, so there is one SQL implementation, and treat `cartTotals.ts` as
explicitly "estimate only."

---

### F3 — Anonymous-user migration failures are silent (HIGH)

When an anon user logs in, their cart/orders/gift-cards/profile/likes are migrated by
`migrate_anonymous_user`. The call path swallows failure twice:

```ts
// src/lib/auth/actions.ts:39
if (anonId) { await migrateAnonymousUserAction(anonId).catch(() => {}) }

// src/lib/auth/actions.ts:106 — the RPC's returned error is never inspected
await (supabase.rpc as unknown as RpcFn)('migrate_anonymous_user', { ... })
```

The OAuth path at least logs (`src/app/(site)/auth/callback/route.ts:92`) but also
continues. The comment ("login must not fail if migration errors") is reasonable as a
UX stance, but "don't block login" should not mean "discard the error with no telemetry
and no user-visible signal." If migration fails, the user silently loses the cart and
purchases they made anonymously — exactly the tethering risk called out in the project's
own anon-purchase-recovery note.

**Recommendation:** keep login non-blocking, but capture the error (log server-side
with the user ids; surface a non-fatal toast/banner; consider a retry on next load).
Have `migrateAnonymousUserAction` check the RPC `error` and propagate it to the caller
instead of returning `void`. Note: `migrate_anonymous_user` is not idempotent-by-design
on partial failure — a retry strategy should account for that.

---

### F4 — DB↔code drift smells around RPCs and generated types (HIGH)

Two related symptoms:

1. **Runtime signature fallback.** `getBooks` calls `get_catalog_books` and, if the
   error says "Could not find the function", *retries with the legacy parameter shape*
   (`src/api/books/getBooks.ts:122–151`, `getCatalogBooksWithFallback`,
   `isMissingCatalogFunctionError`, `normalizeLegacySort`). Production read code
   defending at runtime against the DB having an older function signature is a strong
   signal that schema and code have drifted before and the team doesn't fully trust
   them to agree.
2. **Typed-RPC escape hatch.** Every meaningful RPC call casts through a hand-rolled
   `type RpcFn = (name: string, params) => Promise<{data: unknown; error}>` via
   `as unknown as RpcFn` — **16 occurrences across 12 files** (`api/books/*`,
   `api/likes/toggleLike.ts`, `lib/auth/actions.ts`, `lib/email/*`, `lib/subscribers/*`,
   newsletter + auth routes). The generated `supabase.ts` *does* contain RPC signatures
   (e.g. `migrate_anonymous_user` at `supabase.ts:1854`), but they aren't ergonomic, so
   the whole mutation/RPC surface opts out of type safety. The most critical calls in
   the app (orders, payments, migration, promo) are the *least* type-checked.

This is the root cause behind several other risks: when params are `Record<string,
unknown>` and results are `unknown`, a renamed RPC arg or changed return column won't
fail at compile time — it'll fail (or silently misbehave) at runtime, which is what the
fallback in (1) exists to paper over.

**Recommendation:** stop casting. Build a single thin typed `rpc()` helper that uses the
generated `Database['public']['Functions']` types (one place to centralize the `this`
-binding note from `getBooks.ts:25`), and delete the per-call `RpcFn` casts. Once RPC
calls are type-checked end-to-end, regenerate types on every schema change (already the
documented rule) and **delete the legacy-signature fallback** — drift becomes a build
error instead of a runtime branch. The hand-maintained `BookServerRow`
(`src/entities/book/server.ts`) can then be derived from the function's return type.

---

### F5 — The 4-table editions model drives repetition (MEDIUM, maintainability)

Editions are four parallel tables — `Ebooks`, `Audiobooks`, `PrintedBooks`,
`CardBooks` — each with its own parallel worker join table (`EbookWorkers`,
`AudiobookWorkers`, `PrintedBookWorkers`, `CardBookWorkers`). Consequences observed:

- The identical `all_products` `UNION ALL` over those four tables is **re-written in
  three RPCs**: `get_catalog_books` (`:895`), `get_catalog_book_by_slug` (`:679`),
  `get_similar_books` (`:1081`). Adding a fifth edition type, or a new shared column,
  means editing the same union in every read function (and the per-edition `jsonb`
  detail builders, and the four worker subqueries).
- The client `Book` type (`src/entities/book/client.ts`, 123 LoC) is a **god object**
  carrying every edition's attributes at once (`pageCount`, `binding`, `paper`,
  `durationSeconds`, `fileSizeBytes`, `formats`, `characterCount`, `printingTechnique`,
  …), almost all `null` for any given row, because one type must describe all four
  edition shapes flattened together.
- `normalizeBook` (200 LoC) does correspondingly heavy `unknown`-narrowing of the
  per-edition `jsonb` blobs.

- **`search_books` only scans `CardBooks`** (`baseline:1888`, `FROM "CardBooks" cb`).
  A title whose only published edition is an Ebook/Audiobook/PrintBook is **invisible to
  search** — verified live: `search_books('Абзац')` (has a Book2.0) returns it, while
  print/ebook-only titles return nothing. This is a direct consequence of the per-edition
  table split (the author had to pick one table to scan) and is a latent correctness bug
  in its own right.

This is a defensible historical model (the editions genuinely differ), but it is the
single biggest "hinders change" area. The four tables share a large common core
(`title_id, price, discount, publish_date, release_date, is_published, sold_out,
demo_path`) with a small type-specific tail.

**Recommendation (evaluate, don't rush):** consider consolidating to one `Editions`
table with the shared columns + a `kind` discriminator + a `jsonb details` (or
type-specific nullable columns), and one `EditionWorkers` join. That collapses three
triplicated unions into plain selects, shrinks `normalizeBook`, and makes "add an
edition kind" a data change, not a schema-and-three-functions change. This is a larger
migration; scope it deliberately and weigh against the cost of touching the order/cart
`category` enum and the `category-id` product-id scheme that pervade the commerce code.

---

### F6 — Missing indexes on hot FK/join paths (MEDIUM, scalability)

Only 18 indexes exist. FK columns with **no backing index** (Postgres does not
auto-create them), verified live, on the hottest paths:

```
Ebooks.title_id, Audiobooks.title_id, PrintedBooks.title_id   ← every catalog UNION ALL join
Titles_Authors.title_id, Titles_Authors.author_id            ← author join on every catalog row
Orders.user_id                                                ← order-history queries
CartPromo.promo_id, GiftCards.order_id, GiftCards.product_id,
OrderGiftCardApplications.gift_card_id, UserSubscriptions.subscription_id, …
```

At today's scale (**69 titles, 7 orders, 194 workers**) this is invisible — the planner
seq-scans tiny tables faster than it would use an index. So this is a **scalability**
item, not a current bug. But the catalog RPCs are `O(editions × authors)` joins that
will degrade as the catalog grows, and `Orders.user_id` lookups grow with customers.

**Recommendation:** add btree indexes on the edition `title_id` columns,
`Titles_Authors(title_id)` and `(author_id)`, `Orders(user_id)`, and the gift-card /
subscription FK columns. Cheap to add, fold into the baseline. (`Cart.user_id` is
covered by the composite PK; `OrderItems(order_id)` already indexed.)

---

### F7 — Entity 4-file pattern is uneven ceremony (MEDIUM, boilerplate)

The `server.ts / client.ts / normalize.ts / validation.ts` convention is real for the
two complex entities and largely vestigial for the rest:

```
book      server=34  client=123 normalize=200 validation=57   ← real
order     server=5   client=59  normalize=103 validation=53   ← real
giftCard  server=5   client=17  normalize=28  validation=—    ← no validation
partner   server=3   client=8   normalize=14  validation=—
worker    server=3   client=8   normalize=14  validation=—
subscription server=3 client=15 normalize=24 validation=—
giftCardProduct server=3 client=9 normalize=15 validation=—
story     server=—   client=—   normalize=—   validation=48   ← only a schema
user      server=—   client=—   normalize=—   validation=—    ← EMPTY directory
```

The 3-line `server.ts` files are typically a single re-exported query or type, and
half the entities have no `validation.ts`. The pattern's payoff (a clear shape boundary)
is genuine for `book`/`order`; for a `Partner` (id, name, logo) it's four files where
one would do. This matches the "too much boilerplate" concern: the *ceremony* is
constant but the *value* is concentrated. The empty `user/` directory is dead scaffolding.

**Recommendation:** keep the full pattern only where it earns its keep (entities with
non-trivial normalization or validation). For simple entities, collapse to a single
`<name>.ts` (type + normalize + optional schema) and let the convention say "split into
the 4-file shape when the entity grows." Delete the empty `user/` dir. This is a
low-risk, incremental cleanup — not a rewrite.

---

### F8 — Catalog filter facets are derived by over-fetching (LOW–MEDIUM, perf)

`getBooks` builds the author/year filter dropdowns by calling the **full catalog RPC a
second time** with `result_limit: 10000` and computing distinct authors/years in JS
(`src/api/books/getBooks.ts:18,70–101`). So every catalog page load runs the heavy
`get_catalog_books` twice (once paginated, once for 10k rows) plus four `is_published`
probe queries. Fine at 69 titles; wasteful and unbounded as the catalog grows.

**Recommendation:** a dedicated, cached aggregation RPC (`get_catalog_facets`) returning
distinct authors/years/types, or a small materialized view. Drop the `limit 10000`
re-run.

---

### F9 — Legacy `place_order` dead weight (LOW)

Two `place_order` overloads survive in the baseline (`:1376`, `:1527`) and
`src/api/orders/placeOrder.ts` wraps one, but the live checkout path is the two-phase
`create_pending_order` → `mark_order_paid` (confirmed: nothing in `app/`/`components/`
imports `placeOrder`). `docs/conventions/DATA.md` and AGENTS.md already label it legacy.
Carrying two unused order-placement implementations invites someone to "fix" the wrong
one and keeps a second, divergent copy of pricing logic alive.

**Recommendation:** confirm zero call sites, then drop both SQL overloads and
`placeOrder.ts` in a dedicated migration/commit.

---

### F10 — Minor convention deviations (LOW)

- **Direct storage call in a component.** `AvatarUpload`
  (`src/components/profile/AvatarUpload/AvatarUpload.tsx:44`) calls
  `supabase.storage.from('avatars')` directly, bypassing the "all Supabase through
  `src/api`" rule. Small, but it's the one real breach of the boundary; move it behind
  an `api/profile` function.
- **`select('*')` (22× in `src/api`).** Several are single-row fetches where it's
  harmless, but a few feed list views; prefer explicit column projections to bound
  payloads and make column drift visible.
- **"Swallowed" errors — mostly fine.** The `.catch(() => {})` calls in
  `src/lib/admin/**/actions.ts` are deliberate best-effort *storage* cleanup after a DB
  delete (orphan-object removal) and are acceptable; the story-submission notify
  fire-and-forget is acceptable. The genuinely risky swallow is the auth migration (F3),
  not these.

---

## 4. Cross-cutting themes

1. **The DB is the real source of truth — except for money and types.** The design
   commits to "logic in SQL RPCs," and where it follows that (orders, promos, catalog)
   it's strong. The weak spots are exactly where that commitment leaks: pricing is also
   in TS (F2), and the RPC contract isn't typed (F4). Closing those two makes the stated
   architecture actually true.

2. **Drift is the recurring enemy.** RLS coverage drifted (F1), function signatures
   drifted (F4's fallback), generated types are bypassed (F4), `CardBooks` drifted from
   its sibling tables (F1). The codebase has scar tissue from past drift (see
   `docs/CONCERNS.md` D1). The fixes are less about new structure and more about making
   drift *impossible to ignore* (typed RPCs → build errors; a single RLS audit query in
   CI; one pricing implementation).

3. **Repetition is concentrated, not pervasive.** Most domains are clean and uniform.
   The pain is localized to the editions model (F5) and the entity stubs (F7). That's
   good news — targeted refactors, not a sweep.

4. **Performance is a non-issue today, a latent one tomorrow.** Nothing here hurts at
   69 titles / 7 orders. F6 and F8 are about not building in O(n) cliffs before launch.

---

## 5. Method notes / confidence

- DB facts (RLS state, grants, missing FK indexes, row counts) were **verified live**
  against `supabase_db_chtivo-next` via read-only `psql` — high confidence.
- Code findings cite `file:line`; the editions/pricing/migration paths were read in
  full. The catalog RPCs and `create_pending_order`/`mark_order_paid` were read
  end-to-end.
- Not exhaustively read: every one of the 90 `api/` files and 21 action files —
  representative and outlier domains were sampled. A full RLS-policy *correctness* review
  (per-policy `USING`/`WITH CHECK` audit) was **not** done beyond confirming presence;
  recommend a dedicated security pass on the policy bodies before launch (see F1).
