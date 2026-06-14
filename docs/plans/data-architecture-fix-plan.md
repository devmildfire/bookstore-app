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
| 3 | Single pricing source (quote RPC) | F2 | High | 🟡 |
| 3 | Surface anon-migration failures | F3 | High | ✅ |
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
