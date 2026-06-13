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
| 1 | Lock down catalog tables (RLS + revoke writes) | F1 | Critical | ⬜ |
| 1 | RLS drift guard query | F1 | Critical | ⬜ |
| 2 | Typed `rpc()` helper + remove casts | F4 | High | ⬜ |
| 2 | Delete legacy catalog-signature fallback | F4 | High | ⬜ |
| 3 | Single pricing source (quote RPC) | F2 | High | ⬜ |
| 3 | Surface anon-migration failures | F3 | High | ⬜ |
| 4 | Indexes on hot FK/join paths | F6 | Medium | ⬜ |
| 4 | Trim entity boilerplate + delete `user/` | F7 | Medium | ⬜ |
| 4 | Catalog facets RPC (kill over-fetch) | F8 | Medium | ⬜ |
| 5 | Remove legacy `place_order` | F9 | Low | ⬜ |
| 5 | Boundary nits (AvatarUpload, `select('*')`) | F10 | Low | ⬜ |
| 6 | Editions-model consolidation — SPIKE | F5 | Medium | ⏸️ |

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
- ⬜ Backup DB (per AGENTS.md).
- ⬜ Write + apply the migration locally.
- ⬜ Smoke test: catalog pages still read (`/books`, `/books/[slug]`); admin book/author
  CRUD still writes; an anon-key `DELETE`/`INSERT` against `Titles` now fails.
- ⬜ Fold into the baseline; regenerate types; `tsc` + `npm run build`.

**Acceptance:** the cross-check below returns **zero rows**; storefront reads and admin
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
- ⬜ Add as `scripts/check-rls.mjs` (or a SQL file) runnable locally / in CI.
- ⬜ Document in AGENTS.md next to the destructive-ops rules.

**Acceptance:** the script exits non-zero if a table regresses; passes after 1.1.

---

## Phase 2 — P1: Type the RPC surface (F4)

**Why second:** typed RPCs turn future signature drift into build errors and make the
Phase 3 pricing/legacy refactors safe. The generated `supabase.ts` already contains every
RPC under `Database['public']['Functions']` (verified: `create_pending_order`,
`mark_order_paid`, `apply_promo_code`, `migrate_anonymous_user`, … all present).

### 2.1 One typed `rpc()` helper
- ⬜ Add `src/lib/supabase/rpc.ts` exporting a thin, generically-typed wrapper that takes
  the supabase client + an RPC name keyed to `Database['public']['Functions']` + typed
  args, returns the typed `{ data, error }`. Centralize the `this`-binding note currently
  inline in `getBooks.ts:25`.
- ⬜ Replace all **16** `as unknown as RpcFn` casts (12 files: `api/books/*`,
  `api/likes/toggleLike.ts`, `lib/auth/actions.ts`, `lib/email/sendOrderConfirmation.ts`,
  `lib/subscribers/actions.ts`, `app/(site)/auth/callback/route.ts`,
  `app/(site)/newsletter/{confirm,unsubscribe}/route.ts`) with the typed helper.
- ⬜ Derive `BookServerRow` (`src/entities/book/server.ts`) from the catalog function's
  return type instead of hand-maintaining it (where the generated return shape allows;
  the JSONB columns stay `unknown` for `normalize.ts` to narrow).

**Acceptance:** no `as unknown as RpcFn` remains; `tsc` green; a deliberately wrong RPC
arg name fails to compile.

### 2.2 Delete the legacy catalog-signature fallback
- ⬜ Remove `getCatalogBooksWithFallback`, `isMissingCatalogFunctionError`,
  `getFirstParamValue`, `normalizeLegacySort` from `src/api/books/getBooks.ts`; call
  `get_catalog_books` once with the current params.

**Acceptance:** catalog loads/filters/sorts/paginates exactly as before; the runtime
fallback branch is gone.

---

## Phase 3 — P1: Integrity (F2, F3)

### 3.1 Single source of truth for money (F2)
- ⬜ Extract the pricing math in `create_pending_order`
  (`baseline:280–526`) into a shared SQL function (e.g. `compute_cart_totals(user, gift_cards)`
  returning subtotal / book-discount / promo-delta / final / gift-card-eligible / amount-due).
- ⬜ Have `create_pending_order` call it (no behavioural change to the charge).
- ⬜ Add a read-only `quote_cart()` RPC that returns the same struct for display.
- ⬜ Point cart/checkout at `quote_cart()` for the **displayed + charged** figure; demote
  `src/lib/cartTotals.ts` to an explicit optimistic estimate (clearly commented) or remove
  it and its callsite in `src/contexts/cart.tsx:214` if the quote is fast enough.

**Acceptance:** the total shown at checkout is produced by the same SQL that charges;
removing/altering one pricing path can't silently diverge the other. Manual re-test of the
promo + gift-card scenarios in `docs/testing/promo-codes.md`.

### 3.2 Surface anon-migration failures (F3)
- ⬜ `migrateAnonymousUserAction` (`src/lib/auth/actions.ts:101`): inspect the RPC `error`,
  log server-side with `from`/`to` ids, and return a typed result instead of `void`.
- ⬜ `loginAction` (`:39`): keep login non-blocking but replace `.catch(() => {})` with a
  logged, captured failure; pass a non-fatal signal to the cabinet (banner/toast +
  "retry migration" affordance on next load). Align `/auth/callback` (`:88`) to the same
  handling.

**Acceptance:** a forced migration failure is logged and user-visible (not silent); login
still succeeds; anon cart/orders remain recoverable.

---

## Phase 4 — P2: Maintainability & scalability (F6, F7, F8)

### 4.1 Indexes on hot FK/join paths (F6)
- ⬜ Migration adding btree indexes: `Ebooks(title_id)`, `Audiobooks(title_id)`,
  `PrintedBooks(title_id)`, `Titles_Authors(title_id)`, `Titles_Authors(author_id)`,
  `Orders(user_id)`, `CartPromo(promo_id)`, `GiftCards(order_id)`, `GiftCards(product_id)`,
  `OrderGiftCardApplications(gift_card_id)`, `UserSubscriptions(subscription_id)`.
- ⬜ Fold into baseline; regenerate types (no type change expected).

**Acceptance:** `EXPLAIN` on the catalog RPC + order-history query shows index usage on a
seeded-large dataset. (Cheap, low-risk — can ship any time.)

### 4.2 Trim entity boilerplate (F7)
- ⬜ Delete the empty `src/entities/user/` directory.
- ⬜ Collapse stub entities (`partner`, `worker`, `subscription`, `giftCard`,
  `giftCardProduct`) from 4 files to a single `<name>.ts` (type + normalize + optional
  schema); update imports.
- ⬜ Update `docs/conventions/DATA.md` / `COMPONENTS.md`: "use the 4-file split when the
  entity has non-trivial normalization or validation; a simple entity may be one file."

**Acceptance:** fewer files, identical behaviour, `tsc`/build green; `book`/`order` left
as-is.

### 4.3 Catalog facets RPC (F8)
- ⬜ Add `get_catalog_facets()` returning distinct authors / years / published product
  types (single pass), or a small materialized view refreshed on catalog writes.
- ⬜ Replace the `limit 10000` second catalog-RPC call + the four `is_published` probes in
  `src/api/books/getBooks.ts:70–120` with it.

**Acceptance:** a catalog page load runs the heavy catalog RPC **once**; facets bounded
and correct.

---

## Phase 5 — P3: Cleanup (F9, F10)

### 5.1 Remove legacy `place_order` (F9)
- ⬜ Confirm zero callers of `placeOrder` / `place_order` outside `api/orders/placeOrder.ts`
  (audit found none in `app/`/`components/`).
- ⬜ Drop both SQL overloads (`baseline:1376`, `:1527`) in a migration; delete
  `src/api/orders/placeOrder.ts` and any dead `entities/order` bits it alone used.

**Acceptance:** two-phase checkout still works; dead code + its duplicate pricing copy
gone.

### 5.2 Boundary nits (F10)
- ⬜ Move `AvatarUpload`'s direct `supabase.storage` call
  (`src/components/profile/AvatarUpload/AvatarUpload.tsx:44`) behind an `api/profile`
  function.
- ⬜ Tighten the handful of list-feeding `select('*')` (22 in `src/api`) into explicit
  column projections; leave single-row fetches as-is. Leave deliberate best-effort
  `.catch(() => {})` storage-cleanup calls in `lib/admin/**` as-is.

**Acceptance:** no Supabase calls in components; list payloads bounded.

---

## Phase 6 — P2 (optional, gated): Editions-model consolidation (F5)

**Do not start without a go/no-go.** This is the only large, risky item.

- ⬜ **Spike:** design a single `Editions` table (shared columns + `kind` discriminator +
  type-specific nullable columns or `jsonb details`) and one `EditionWorkers` join.
- ⬜ Estimate blast radius: the `category` enum, the `"<Category>-<id>"` product-id scheme
  (cart ids, order item `book_id`, promo `target_product_id`, box-set expansion), the
  three catalog RPCs, `normalizeBook`, the fat `Book` type.
- ⬜ Write a migration sketch + data-backfill plan + rollback.
- ⬜ **Decision:** proceed only if the spike shows the cost is justified by collapsing the
  triplicated `UNION ALL` and shrinking `Book`/`normalizeBook`.

**Acceptance:** a written go/no-go with migration sketch. If "go", it becomes its own
phased plan.

---

## Suggested order

1. **Phase 1** (security — ship alone, fast).
2. **Phase 2** (typed RPCs — unlocks safe refactoring).
3. **Phase 3** (pricing + migration integrity).
4. **Phase 4** (indexes / boilerplate / facets — low-risk, parallelizable).
5. **Phase 5** (cleanup).
6. **Phase 6** (only after a spike + sign-off).
