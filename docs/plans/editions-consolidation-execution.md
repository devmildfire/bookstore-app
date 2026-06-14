# Editions Consolidation — Execution Plan (clean-slate)

**Status:** PROPOSED — awaiting review. No code changed yet.
**Premise (user-confirmed 2026-06-14):** current `Orders`/`Cart`/issued `GiftCards`/
`UserSubscriptions` are throwaway test data and **may be wiped**. Priority is clean,
maintainable, expandable architecture + good DB design — not preserving those rows.

Supersedes the NO-GO in [editions-consolidation-spike.md](editions-consolidation-spike.md):
the spike's blocker was the immutable `OrderItems.book_id` snapshot + overlapping edition id
ranges. With orders disposable, that blocker is gone and we can do the **clean** design
(single unified id, no legacy-id artifact).

> HARD RULE reminder: this involves `TRUNCATE`/`DROP` (destructive). A full DB backup is
> taken first; **storage is never touched**. Each destructive step is called out.

---

## 1. Goal

Replace the four parallel edition tables (`Ebooks`, `Audiobooks`, `PrintedBooks`,
`CardBooks`) + four worker join tables with **one `Editions` table** + **one
`EditionWorkers`**, resolving audit F5: kills the triplicated `UNION ALL` in the catalog
RPCs, fixes the `search_books` CardBooks-only bug, shrinks the `Book` god-type and
`normalizeBook`, and removes the `EditionTable`/`DIGITAL_FILE_TABLE` code abstractions.

---

## 2. Target schema

```sql
-- Discriminator: reuse the existing edition category values (keeps the product-id
-- prefix mapping trivial). CHECK-constrained to the four edition kinds.
Editions (
  id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title_id      integer NOT NULL REFERENCES "Titles"(id) ON DELETE CASCADE,
  kind          text NOT NULL CHECK (kind IN ('EBook','AudioBook','PrintBook','Book2.0')),
  price         numeric(10,2),
  discount      numeric(10,2),
  is_published  boolean NOT NULL DEFAULT false,
  sold_out      boolean NOT NULL DEFAULT false,
  publish_date  text,
  release_date  text,
  file_path     text,          -- digital fulfilment (null for print)
  demo_path     text,
  details       jsonb NOT NULL DEFAULT '{}',  -- type-specific tail (see below)
  created_at    timestamptz NOT NULL DEFAULT now()
)
-- indexes: (title_id), (kind), partial (title_id) WHERE is_published
-- RLS: public SELECT; REVOKE write from anon/authenticated (F1 lesson)

EditionWorkers (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  edition_id  integer NOT NULL REFERENCES "Editions"(id) ON DELETE CASCADE,
  worker_id   integer NOT NULL REFERENCES "Workers"(id) ON DELETE CASCADE,
  sort_order  integer NOT NULL DEFAULT 0
)
-- index: (edition_id)
```

**Shared vs `details`:** the columns every edition needs are typed (queryable/filterable);
the small variant tail goes in `details jsonb` — which is exactly what the catalog RPCs
already emit as `edition_details` and what `normalizeBook` already parses, so the frontend
shape is unchanged. `details` contents per kind:
- EBook: `{ formats, character_count }`
- AudioBook: `{ duration_seconds, file_size_bytes }`
- PrintBook: `{ format, page_count, paper, cover_material, binding, illustrations }`
- Book2.0: `{ format, printing_technique, paper, packaging, counter_color }`

**Product-id scheme stays `"<kind>-<editionId>"`** (e.g. `EBook-42`), now with `editionId =
Editions.id` and `kind = Editions.kind`. The cart/order line must stay polymorphic because
it also references non-editions (`GiftCard`, `BoxSet`, `Subscription`, `Course`), so the
prefixed-text reference is the right pattern. Catalog RPCs return `product_type` (kind) + id;
`normalizeBook` builds the id exactly as today.

### Design decisions — CONFIRMED (user, 2026-06-14)
1. **Variant storage:** ✅ **`details jsonb`** (expandable; matches current normalize).
2. **`kind` discriminator:** ✅ **reuse the `category` string values via CHECK** (no mapping).
3. **Scope ceiling:** ✅ **stop at Editions.** Cart/OrderItems keep the polymorphic
   `"<kind>-<id>"` text reference (still needed for GiftCard/BoxSet/Subscription/Course).
   A future `Products` supertable is explicitly out of scope for this plan.

---

## 3. Phased execution

### Phase A — schema + backfill (additive, non-destructive)
- A1. Migration: create `Editions` + `EditionWorkers` (RLS + indexes as above).
- A2. Backfill `Editions` from the four tables (INSERT…SELECT each, shared cols + build
  `details` jsonb + set `kind`). Build a temp map `(kind, old_id) → new edition id`.
- A3. Backfill `EditionWorkers` from the four worker tables via the map.
- A4. **Parity check** (no destructive step yet): per title, the set of `(kind, price,
  is_published, …)` and worker lists in `Editions` matches the old tables; counts match
  (62/4/21/63 → 150 rows).

### Phase B — repoint catalog config (non-destructive)
The only **non-disposable** data that references editions by `"<kind>-<id>"`:
- B1. `PromoCodes.target_product_id` — rewrite `<kind>-<old>` → `<kind>-<new>` via the map.
- B2. `BoxSetBooks.product_id` — same.
- (`default_edition_for_title` computes ids live — no stored data to fix.)
- B3. Verify every repointed reference resolves to an `Editions` row.

### Phase C — wipe disposable transactional data (DESTRUCTIVE — backup first)
Approved as throwaway. Truncate in FK-safe order (or `CASCADE`):
`OrderGiftCardApplications`, `OrderItems`, `Orders`, `CartPromo`, `Cart`,
`GiftCards` (issued instances), `UserSubscriptions`.
- C1. Confirm `Likes.item_*` does **not** reference edition ids (expected: titles only) —
  if it does, repoint or clear. 
- C2. Truncate. (Catalog/config — Titles, Authors, PromoCodes, BoxSets, GiftCardProducts,
  Subscriptions, Articles, … — untouched.)

### Phase D — rewrite SQL functions to use `Editions`
Rewrite the ~10 functions that branch per edition table:
`get_catalog_books`, `get_catalog_book_by_slug`, `get_similar_books` (UNION ALL → single
SELECT), `search_books` (**bug fixed** — now sees all kinds), `get_cart_with_title_ids`,
`apply_promo_code`, `box_set_is_physical`, `default_edition_for_title`,
`compute_cart_totals`/`create_pending_order` only if they touch edition tables (they read
Cart, not editions — likely unaffected), and the `get_catalog_facets` helper.
- D1. Rewrite + apply.
- D2. Parity check catalog output (list/detail/similar/facets) vs a snapshot taken before D.

### Phase E — code updates
- E1. `src/lib/admin/bookProducts.ts` — collapse `EditionTable`/`ALL_EDITION_TABLES`/
  `EDITION_FILE_FOLDER` to a `kind` list against `Editions`.
- E2. `src/api/orders/getDownloadUrl.ts` — drop `DIGITAL_FILE_TABLE`; select `file_path`
  from `Editions` by `(kind, id)`.
- E3. Admin edition CRUD: `components/admin/books/ProductsManager`,
  `api/admin/books/getAdminBook`, `lib/admin/books/actions.ts` — one table.
- E4. `src/api/orders/getOrders.ts` — edition lookup → `Editions`.
- E5. Shrink `entities/book` `client.ts` (`Book`) + `normalize.ts` where the 4-table shape
  leaked; keep the public `Book` fields the UI uses.
- E6. Regenerate `src/types/supabase.ts`; `tsc` + `eslint` + `build` green.

### Phase F — drop old tables (DESTRUCTIVE — backup already taken)
- F1. After full verification: `DROP TABLE` the 4 edition + 4 worker tables.
- F2. **Regenerate the consolidated baseline** from the live DB (the documented `pg_dump`
  process) so the baseline is the true source again — this also clears the accumulated
  "function changes live only in migrations, not folded" debt from earlier phases.

### Phase G — verification gate (no test suite exists → manual)
End-to-end by hand + DB queries: catalog list/filter/sort/search/detail/similar; add to
cart (each kind + box set); checkout charge (mock gateway) → order created → mark paid;
admin: create/edit/delete an edition of each kind, upload a digital file, download it.
Only after G passes is the work considered done.

---

## 4. Blast radius / risk

| Surface | Detail |
|---|---|
| New tables | 2 | `Editions`, `EditionWorkers` |
| Dropped tables | 8 | 4 edition + 4 worker |
| Wiped (test) tables | 7 | orders/cart/giftcard-instance/subscription-instance |
| SQL functions rewritten | ~10 | incl. `search_books` bug fix |
| Code files | ~8 | bookProducts, getDownloadUrl, getOrders, admin ×3, entities/book ×2 |
| Product-id parse sites (~30) | mostly unchanged — scheme preserved (kind + new id) |

**Risks & mitigations:**
- Destructive steps (C, F) → full backup first; storage never touched; staged so backfill
  parity (A4) and config repoint (B3) are verified *before* any wipe/drop.
- No automated tests → Phase G manual gate; parity snapshots before/after D.
- RLS on the new tables from the start (don't repeat F1).
- `category` enum unchanged (still covers non-edition kinds).
- Rollback: until Phase F, the old tables still exist → revert code + drop `Editions` to
  restore. After F, restore from backup.

---

## 5. Outcome

One edition table, one worker join, one place to add a column or a kind; catalog SQL with no
`UNION ALL`; search that sees every edition; a lean `Book`/`normalizeBook`; and a freshly
regenerated baseline as the single source of truth. Estimated as its own multi-commit effort
(roughly: A–B one commit, C one, D one, E one, F one), each `tsc`/lint/build-green with the
Phase G gate before F's drop.

**Decision:** ✅ approved & EXECUTED (2026-06-14).

## Execution log (all phases done + verified)
- ✅ **A** `20260614160000_editions_table.sql` — `Editions`(150) + `EditionWorkers`(601),
  RLS + indexes. Field-level parity vs the 4 old tables: **0 mismatches** across all kinds.
- ✅ **B** `20260614170000_repoint_edition_refs.sql` — promo `AUDIO50` `AudioBook-4`→`AudioBook-66`
  (resolves); 0 box-set refs.
- ✅ **C** wiped disposable transactional tables (orders/cart/issued cards/subs) — backup first.
- ✅ **D** `20260614180000_editions_functions.sql` — 10 functions rewritten to one table;
  `search_books` fixed (now covers all kinds — `search('МРД')`→6 EBook titles).
- ✅ **E** code: `bookProducts`/`getAdminBook`/`actions`/`ProductsManager` (table→kind),
  `getDownloadUrl`/`getOrders` → `Editions`, `database.ts` `DbEdition`. `tsc`/lint/build green.
- ✅ **G** full checkout re-verified against `Editions` (create_pending_order→mark_order_paid,
  rolled back).
- ✅ **F** `20260614190000_drop_old_edition_tables.sql` — dropped the 8 old tables; types
  regenerated; RLS guard clean.
- ✅ **Reproducibility:** `seed.sql` regenerated (carries `Editions`/`EditionWorkers`, no old
  tables, promo ref repointed). Baseline+migrations+seed replays clean (migrations create
  `Editions` before seed loads).
- ✅ **Baseline regenerated (2026-06-14).** `20260101000000_baseline_schema.sql` rebuilt from
  the live DB (`pg_dump --schema-only` of public, schema-line stripped, `pg_trgm` prepended,
  the manual storage buckets/policies block re-attached). It now defines `Editions`/
  `EditionWorkers` directly (no old tables, no transitional churn). The 15 transitional
  migrations were moved to `supabase/migrations_archive/`; `migrations/` holds only the
  baseline; live `schema_migrations` realigned to the single baseline version.
  **Verified on a stubbed throwaway DB** (auth/storage stubbed): baseline + seed replay with
  0 errors → Editions 150, EditionWorkers 601, Titles 69, 16 buckets; `get_catalog_books`→12,
  `search_books('МРД')`→6, facets→4 kinds; old `Ebooks` absent. The baseline is once again the
  single source of truth.
