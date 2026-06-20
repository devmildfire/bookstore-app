# Data-Architecture Fix Plan

Concrete, phased execution plan to remediate the issues in the
[data-architecture audit](../audits/data-architecture.md), in priority order. The
high-level backlog is in [data-architecture-refactor.md](data-architecture-refactor.md);
**this** document is the step-by-step companion with files, migration sketches,
acceptance criteria, and a checklist tracker.

**Conventions for this work**
- Every DB change is a **new migration** under `supabase/migrations/`, then folded into
  the consolidated baseline once verified, then **regenerate `src/types/supabase.ts`**
  (command in AGENTS.md) and run `tsc` + `npm run build`.
- **Take a fresh backup before any destructive op** and never wipe storage (AGENTS.md
  HARD RULE). The changes here are additive (policies, grants, indexes) — none require a
  reset.
- One phase = one commit (or a small series), pushed immediately after committing.

**Status legend:** ⬜ todo · 🟡 in progress · ✅ done · ⏸️ blocked/needs sign-off
**Last updated:** 2026-06-13.

---

## Progress tracker

| Phase | Item | Finding | Severity | Status |
|------|------|---------|----------|--------|
| 1 | Lock down catalog tables (RLS + revoke writes) | F1 | Critical | ✅ |
| 1 | RLS drift guard query | F1 | Critical | ✅ |
| 2 | Use native typed `.rpc()`; remove all `RpcFn` casts | F4 | High | ✅ |
| 2 | Delete legacy catalog-signature fallback | F4 | High | ✅ |
| 3 | Single pricing source (quote RPC) | F2 | High | ✅ |
| 3 | Surface anon-migration failures | F3 | High | ✅ |
| 4 | Indexes on hot FK/join paths | F6 | Medium | ✅ |
| 4 | Trim entity boilerplate + delete `user/` | F7 | Medium | ✅ |
| 4 | Catalog facets RPC (kill over-fetch) | F8 | Medium | ✅ |
| 5 | Remove legacy `place_order` | F9 | Low | ✅ |
| 5 | Boundary nits (AvatarUpload, `select('*')`) | F10 | Low | ✅ |
| 6 | Editions-model consolidation | F5 | Medium | ✅ EXECUTED (orders wiped; see execution plan) |

---

## Phase 1 — P0: Close the catalog write hole (F1)

**Why first:** security exposure, independent of all other work.

### 1.1 Migration: enable RLS, add public-read, revoke writes
New migration `supabase/migrations/<ts>_lock_catalog_tables.sql`:

```sql
-- For each of: Titles, Authors, CardBooks, Titles_Authors
ALTER TABLE public."Titles" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read titles" ON public."Titles"
  FOR SELECT TO public USING (true);
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public."Titles" FROM anon, authenticated;
-- …repeat for Authors / CardBooks / Titles_Authors
```

This mirrors the **verified existing** policy shape on the sibling edition tables
(`Ebooks`/`Audiobooks`/`PrintedBooks`: `FOR SELECT TO public USING (true)`). Admin writes
are unaffected — they run via the **service role** (`createAdminClient`,
`src/lib/supabase/server.ts:71`), which bypasses RLS and grants.

**Steps**
- ✅ Backup DB (`backups/chtivo-db-backup-20260613-214040.sql`).
- ✅ Wrote + applied migration `20260613150000_lock_catalog_tables.sql` (registered in
  `schema_migrations`).
- ✅ Verified: all 4 tables RLS-on with 1 policy; anon write grants removed; anon `SELECT`
  reads 69 titles; anon `DELETE` → "permission denied for table Titles".
- ✅ Folded into the baseline (appended block). Types **not** regenerated — RLS/policies/
  grants don't affect generated TS types (no `tsc`/build impact; no app code changed).

**Acceptance:** ✅ the cross-check returns **zero rows**; storefront reads and admin
writes both work.

### 1.2 Standing RLS drift guard
Add a check that fails if any `public` table is RLS-off, or RLS-on with zero policies
(allow-list the intentional SECURITY-DEFINER-only tables, e.g. `Subscribers`).

```sql
-- expect zero rows
SELECT c.relname,
       c.relrowsecurity AS rls_on,
       (SELECT count(*) FROM pg_policies p WHERE p.tablename = c.relname) AS policies
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
  AND c.relname NOT IN ('Subscribers')          -- intentional definer-only
  AND (c.relrowsecurity = false                  -- RLS off
       OR (SELECT count(*) FROM pg_policies p WHERE p.tablename = c.relname) = 0);
```

**Steps**
- ✅ Added `scripts/check-rls.mjs` (DATABASE_URL or local Docker; `Subscribers` allow-listed).
- ✅ Documented in AGENTS.md ("RLS invariant" section).

**Acceptance:** ✅ the script exits non-zero on drift; passes now
(`RLS guard OK — all public tables are RLS-enabled with policies.`).

---

## Phase 2 — P1: Type the RPC surface (F4)

**Why second:** typed RPCs turn future signature drift into build errors and make the
Phase 3 pricing/legacy refactors safe. The generated `supabase.ts` already contains every
RPC under `Database['public']['Functions']` (verified: `create_pending_order`,
`mark_order_paid`, `apply_promo_code`, `migrate_anonymous_user`, … all present).

### 2.1 Use native typed `.rpc()`; remove all casts — DONE
**Decision change (better than the original plan):** no wrapper helper was added. The
clients are already typed with `<Database>` (`createClient`/`createDataClient`/
`createAdminClient`), so the native `supabase.rpc(name, args)` is fully type-safe on its
own. A wrapper would only re-add indirection over an already-typed method, and the
`this`-binding hazard only existed because `getBooks` assigned `rpc` *unbound* — calling
`supabase.rpc(...)` inline avoids it. So the fix was to **delete the escape hatch**, not
wrap it.

- ✅ Removed all `RpcFn` type defs + `as unknown as RpcFn` casts — **14 files**:
  `api/books/{getBook,getBooks,getBookProducts,getLatestBooks,getFeaturedBooks,searchBooks}.ts`,
  `api/articles/getAuthorBooks.ts`, `api/likes/toggleLike.ts`, `lib/auth/actions.ts`,
  `lib/email/sendOrderConfirmation.ts`, `lib/subscribers/actions.ts`,
  `app/(site)/auth/callback/route.ts`, `app/(site)/newsletter/{confirm,unsubscribe}/route.ts`.
  `grep RpcFn src` → none.
- ✅ **Bonus — the casts were hiding real bugs.** Native types surfaced 4 latent arg
  errors in `getBooks.ts` (passing `null` where the generated args want `string |
  undefined` / `number | undefined`) → fixed to `undefined`/`?? undefined`.
- ✅ `subscribe_newsletter.p_source` had no SQL default, so the generated type was a
  required `string` while callers passed `null`. Added migration
  `20260613160000_subscribe_newsletter_optional_source.sql` (`DEFAULT NULL`, body
  unchanged) → regenerated types (minimal diff: `p_source?: string`) → caller passes the
  optional value directly. No cast needed.
- ⏭️ Deriving `BookServerRow` from the function return type: **deferred** — the three
  catalog RPCs return overlapping-but-different shapes, so the hand-curated superset view
  (with the divergent fields optional + JSONB as `unknown`) is the cleaner contract. The
  call sites are now type-checked on name+args, which was the core F4 win.

**Acceptance:** ✅ no `RpcFn` remains; `tsc`, `eslint`, `npm run build` all green; a wrong
RPC arg now fails to compile (proven by the 4 bugs it caught).

### 2.2 Delete the legacy catalog-signature fallback — DONE
- ✅ Removed `getCatalogBooksWithFallback`, `isMissingCatalogFunctionError`,
  `getFirstParamValue`, `normalizeLegacySort` from `getBooks.ts`; calls `get_catalog_books`
  once with the current params.

**Acceptance:** ✅ `get_catalog_books`/`search_books` verified returning rows from the DB
(catalog=12, `search_books('Абзац')`→ match). Note: discovered `search_books` only scans
`CardBooks` (audit F5 addendum) — pre-existing, tracked, not addressed here.

---

## Phase 3 — P1: Integrity (F2, F3)

### 3.1 Single source of truth for money (F2) — DONE
**Approach (user-chosen):** single server-side pricing source, but keep the UI snappy via
optimistic composition + a deferred price (no blocking round-trip per change). See the
"optimistic over blocking" feedback note.

- ✅ Migration `20260614120000_compute_cart_totals.sql`:
  - `compute_cart_totals(p_user_id)` — the **one** pricing implementation (subtotal,
    original_sum, book_disc_total, promo_delta, final_total, gift_card_eligible_total,
    recurring_amount, has_physical, promo_code), extracted verbatim from the old inline loop.
  - `create_pending_order` rewritten to `SELECT … FROM compute_cart_totals(...)` for pricing
    — everything else (gift-card reserve, Orders insert, OrderItems) unchanged.
  - `quote_cart()` — read-only, returns the same numbers for display.
- ✅ Client: `src/api/cart/quoteCart.ts` (`getCartQuote`/`cartQuoteQueryKey`); `CartProvider`
  now reads the quote with `placeholderData: keepPreviousData` (deferred price). Cart
  mutations (add/remove/update/clear) are **optimistic** so composition is instant; each
  invalidates the quote. Deleted `src/lib/cartTotals.ts` (no client price math) and the now-
  dead `getCartWithTitleIds` wrapper + `cartTitleIds`/`matchedCartIds` machinery.
- ✅ **Parity verified** (compute_cart_totals vs hand-computed, rolled-back txns):
  no-promo → 4200/0/4200; cart-20% → Δ840/3360/3360; item-50% on Book2.0-26 → Δ1400/2800/2800;
  and `quote_cart()` as the authenticated user (RLS path) → total 4200. `tsc`/`eslint`/`build` green.
- Note: the new/updated functions live in the migration (not folded into the baseline),
  matching how the existing `20260611180000` `create_pending_order` redefinition is handled;
  they replay correctly in version order. Fold at the next full baseline regen.

**Acceptance:** ✅ the displayed total (cart + checkout) comes from the same SQL that charges;
there is exactly one pricing implementation; promo + gift-card scenarios re-verified.

### 3.2 Surface anon-migration failures (F3) — DONE
- ✅ `migrateAnonymousUserAction` now returns `{ ok; error? }` and logs the RPC error with
  `from`/`to` ids (no more `void` + swallow).
- ✅ `loginAction` awaits the result and `console.error`s on failure but still redirects
  (non-blocking). `/auth/callback` already logged — both sign-in paths now consistent.
- ⏭️ **Deferred (product UI call):** the user-visible "migration failed / retry" banner.
  The data is safe on failure (the RPC is transactional — nothing migrated, anon row
  intact, recoverable on next sign-in), so the telemetry fix is the substance; where/how
  to surface a banner is a UI decision to make separately.

**Acceptance:** ✅ a forced migration failure is logged with context (not silent); login
still succeeds; anon cart/orders remain recoverable. `tsc` green.

---

## Phase 4 — P2: Maintainability & scalability (F6, F7, F8)

### 4.1 Indexes on hot FK/join paths (F6) — DONE
- ✅ Migration `20260614130000_fk_indexes.sql` — btree indexes on **all 16 FK columns that
  lacked one** (edition `title_id`s, `Titles_Authors` both directions, `Orders.user_id`,
  gift-card/subscription/promo/audit FKs). Applied + folded into baseline.
- ✅ Verified: the "FK columns without a backing index" query now returns **zero rows**. No
  type change (indexes aren't in generated TS).

**Acceptance:** ✅ every FK column is now index-backed; seq-scan cliffs avoided as data grows.

### 4.2 Trim entity boilerplate (F7) — DONE
- ✅ Deleted the empty `src/entities/user/` directory.
- ✅ Collapsed `partner`, `worker`, `subscription`, `giftCard`, `giftCardProduct` from
  3-file directories to single `src/entities/<name>.ts` files (row type + client type +
  normalizer). Updated all 19 consumer import sites (`@/entities/X/{client,server,normalize}`
  → `@/entities/X`) and merged the multi-symbol imports.
- ✅ Updated `docs/conventions/DATA.md`: split into the 4-file shape only when warranted; a
  simple entity is one file. `book`/`order` left as the canonical four-file entities.

**Acceptance:** ✅ fewer files (15 → 5), identical behaviour, `tsc`/`eslint`/`build` green.

### 4.3 Catalog facets RPC (F8) — DONE
- ✅ Migration `20260614140000_get_catalog_facets.sql` — returns distinct authors / years /
  published product types in one pass, scoped to the published catalog.
- ✅ `getBooks` now calls `get_catalog_facets()` instead of re-running `get_catalog_books`
  with `result_limit: 10000` + four `is_published` probe queries. Sorting (localeCompare
  'ru', canonical type order) kept client-side for identical output.

**Acceptance:** ✅ a catalog page load runs the heavy `get_catalog_books` **once** (page
data) + one tiny facets call; the 10k-row over-fetch + 4 probes are gone. `tsc`/lint/build green.

---

## Phase 5 — P3: Cleanup (F9, F10)

### 5.1 Remove legacy `place_order` (F9) — DONE
- ✅ Fresh backup first (`backups/chtivo-db-backup-20260614-113159.sql`).
- ✅ Confirmed `placeOrderAction` had zero callers; `placeOrder()` → `place_order` RPC was
  reachable only through it.
- ✅ Migration `20260614150000_drop_legacy_place_order.sql` drops both overloads (verified
  2 → 0). Deleted `src/api/orders/placeOrder.ts` + the dead `placeOrderAction`.
- ✅ Relocated the still-used types (`PlaceOrderInput`, `PlaceOrderErrorReason`) into
  `createPendingOrder.ts` (the live consumer); dropped the dead `PlaceOrderResult`. Updated
  `index.ts` re-exports + stale comments. Types regenerated (`place_order` gone).
- Note: baseline still defines `place_order`; the DROP migration removes it on replay
  (same migration-not-folded approach as the other function changes).

**Acceptance:** ✅ two-phase checkout RPCs intact (`create_pending_order`/`mark_order_paid`/
`compute_cart_totals`/`quote_cart`); dead code + its duplicate pricing copy gone.
`tsc`/lint/build green.

### 5.2 Boundary nits (F10) — DONE
- ✅ Moved `AvatarUpload`'s direct `supabase.storage` call behind `api/profile/uploadAvatar.ts`
  (the one real breach of "no Supabase in components").
- ✅ Tightened the storefront list getters (`getPartners`, `getTeam`, `getSubscriptions`,
  `getGiftCardProducts`) from `select('*')` to explicit column projections; narrowed each
  normalizer's param to `Pick<…Row, …>` so `tsc` enforces the projection covers what the
  normalizer reads. Left single-row admin edit fetches (`…eq('id').maybeSingle()`) and the
  deliberate best-effort `.catch(()=>{})` storage cleanup as-is.

**Acceptance:** ✅ no Supabase calls in components; storefront list payloads column-bounded
and drift-checked. `tsc`/lint/build green.

---

## Phase 6 — P2 (optional, gated): Editions-model consolidation (F5) — SPIKED

**Spike complete** → full write-up in
[editions-consolidation-spike.md](editions-consolidation-spike.md) (design, migration
sketch, blast radius, risks).

- ✅ Designed a single `Editions` + `EditionWorkers` model with the decisive
  `(kind, source_id)` choice that **preserves the `"<Category>-<id>"` external id scheme**
  (protects immutable `OrderItems.book_id` + cart/promo/box-set text refs; the four tables
  have overlapping id ranges so a naive single-id renumber would orphan order history).
- ✅ Blast radius: 2 new tables / 8 dropped, ~10 SQL functions rewritten, ~8 code files;
  the ~30 product-id parse sites stay unchanged thanks to id preservation.
- ✅ **Recommendation: NO-GO as a big-bang now.** At current scale the 4-table model works;
  the migration is large/high-risk across the checkout/order-snapshot scheme with no test
  harness. Instead do the **cheap sliver**: fix the `search_books` CardBooks-only bug
  (~20 lines, no data migration), and defer full consolidation until a forcing function +
  a test harness exist. Design is captured for when that time comes.

**Outcome:** go/no-go delivered. Awaiting user decision (go / sliver-only / defer).

---

## Suggested order

1. **Phase 1** (security — ship alone, fast).
2. **Phase 2** (typed RPCs — unlocks safe refactoring).
3. **Phase 3** (pricing + migration integrity).
4. **Phase 4** (indexes / boilerplate / facets — low-risk, parallelizable).
5. **Phase 5** (cleanup).
6. **Phase 6** (only after a spike + sign-off).
