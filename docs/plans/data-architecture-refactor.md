# Data-Architecture Refactor — Backlog

High-level, rough-priority backlog derived from the
[data-architecture audit](../audits/data-architecture.md). This is a **backlog, not a
step-by-step plan** — each item links back to its finding (Fn) for evidence and detail.
Sequence is a recommendation; each item is independently shippable.

**Status legend:** ⬜ not started · 🟡 in progress · ✅ done
**Last updated:** 2026-06-13.

---

## P0 — Critical (do before any public launch)

- ⬜ **Lock down catalog tables** (F1). Enable RLS on `Titles`, `Authors`, `CardBooks`,
  `Titles_Authors`; add `SELECT`-only public policies mirroring
  `Ebooks`/`Audiobooks`/`PrintedBooks`; `REVOKE INSERT/UPDATE/DELETE/TRUNCATE` from
  `anon` and `authenticated`. Ship as a migration, fold into the baseline, regenerate
  types. **Acceptance:** the live RLS-off cross-check returns zero public tables with
  write grants to anon; admin writes (service role) still work; catalog still reads.
  - ⬜ Add a standing CI/check query that fails if any `public` table is RLS-off **or**
    RLS-on-with-zero-policies (except intentional SECURITY-DEFINER-only tables like
    `Subscribers`). Makes F1-class drift impossible to reintroduce silently.

---

## P1 — High (correctness / integrity / drift)

- ⬜ **One source of truth for money** (F2). Extract the pricing math out of
  `create_pending_order` into a shared SQL function; expose a read-only `quote` RPC the
  cart/checkout use for the displayed + charged figure. Demote `src/lib/cartTotals.ts`
  to an explicit client-side estimate (or delete it in favour of the quote).
  **Acceptance:** the number shown at checkout comes from the same SQL path that charges;
  no second pricing implementation can drift.

- ⬜ **Stop swallowing migration failures** (F3). Have `migrateAnonymousUserAction`
  inspect and propagate the RPC error; keep login non-blocking but log server-side (with
  from/to user ids) and surface a non-fatal banner/retry. **Acceptance:** a forced
  migration failure is logged and visible, not silent; anon cart/orders are recoverable.

- ⬜ **Type the RPC surface; delete the escape hatch** (F4). Add one typed `rpc()`
  helper built on `Database['public']['Functions']` (centralizing the `this`-binding
  workaround); remove all 16 `as unknown as RpcFn` casts across the 12 files. Then
  **delete** the legacy-signature fallback in `getBooks.ts`. Derive `BookServerRow` from
  the function return type. **Acceptance:** RPC calls are compile-checked; a renamed
  arg/column is a build error; no runtime signature fallback remains.

---

## P2 — Medium (maintainability / scalability)

- ⬜ **Add indexes on hot FK/join paths** (F6). btree on edition `title_id`
  (`Ebooks`/`Audiobooks`/`PrintedBooks`), `Titles_Authors(title_id)` and `(author_id)`,
  `Orders(user_id)`, and gift-card/subscription FK columns. Migration + baseline.
  **Acceptance:** `EXPLAIN` on the catalog RPC and order-history query uses index scans
  on a seeded-large dataset. *Cheap; can ship anytime.*

- ⬜ **Trim entity boilerplate** (F7). Collapse stub entities (`partner`, `worker`,
  `subscription`, `giftCard`, `giftCardProduct`) to a single `<name>.ts`; delete the
  empty `user/` directory; update the convention doc to say "split into the 4-file shape
  when the entity earns it." Keep `book`/`order` as-is. **Acceptance:** fewer files, same
  behaviour; convention reflects reality.

- ⬜ **Fix the filter-facets over-fetch** (F8). Replace the second `limit 10000`
  catalog-RPC call with a dedicated `get_catalog_facets` RPC (or materialized view).
  **Acceptance:** a catalog page load runs the heavy RPC once; facets bounded.

- ⬜ **Evaluate consolidating the editions model** (F5). *Spike first* — design a single
  `Editions` table (shared columns + `kind` + details) and one `EditionWorkers` join;
  estimate blast radius on the `category` enum, the `category-id` product-id scheme, cart,
  and orders. Only proceed if the spike shows the migration cost is justified by the
  reduction in triplicated SQL + the fat `Book` type. **Acceptance:** a written
  go/no-go with a migration sketch; do not start the migration without sign-off (this is
  the one item that is genuinely large).

---

## P3 — Low (cleanup)

- ⬜ **Remove legacy `place_order`** (F9). Confirm zero call sites, then drop both SQL
  overloads + `src/api/orders/placeOrder.ts`. **Acceptance:** checkout still works via
  the two-phase path; dead code gone.

- ⬜ **Minor boundary fixes** (F10). Move `AvatarUpload`'s direct storage call behind an
  `api/profile` function; tighten the handful of list-feeding `select('*')` into explicit
  projections. Leave the deliberate best-effort `.catch(() => {})` storage-cleanup calls
  as-is. **Acceptance:** no Supabase calls in components; list payloads bounded.

---

## Notes on sequencing

1. **P0 first, alone.** It's a security fix and independent of everything else.
2. **F4 (typed RPCs) before F2/F9** — typed RPCs make the pricing-consolidation and
   legacy-removal refactors safe (the compiler catches signature mistakes).
3. **F6 and F7 and F10 are low-risk** and can be picked up as filler anytime.
4. **F5 is the only large, optional item** — gate it behind a spike. Everything else is
   incremental and reversible.
