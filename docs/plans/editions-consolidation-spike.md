# Spike: Editions-Model Consolidation (audit F5)

**Status:** spike / investigation only — no code changed. Ends with a go/no-go.
**Date:** 2026-06-14. Companion to [data-architecture audit](../audits/data-architecture.md) F5
and [the fix plan](data-architecture-fix-plan.md) Phase 6.

---

## 1. The current model

Editions are **four parallel tables**, each with its **own worker join table**:

| Edition table | rows | `category` value | external id prefix |
|---|---|---|---|
| `Ebooks` | 62 | `EBook` | `EBook-<id>` |
| `Audiobooks` | 4 | `AudioBook` | `AudioBook-<id>` |
| `PrintedBooks` | 21 | `PrintBook` | `PrintBook-<id>` |
| `CardBooks` | 63 | `Book2.0` | `Book2.0-<id>` |

Worker joins: `EbookWorkers`, `AudiobookWorkers`, `PrintedBookWorkers`, `CardBookWorkers`
— **identical shape** (`id, <edition>_id, worker_id, sort_order`).

**Columns — mostly shared, small type-specific tail:**
- Shared by all four: `id, title_id, price, discount, is_published, publish_date,
  release_date, demo_path, sold`.
- `sold_out`: PrintedBooks, CardBooks. `file_path`: Ebooks, Audiobooks, CardBooks.
- Type-specific: Ebooks `{formats[], character_count}`; Audiobooks `{duration_seconds,
  file_size_bytes}`; PrintedBooks `{format, page_count, paper, cover_material, binding,
  illustrations}`; CardBooks `{format, printing_technique, paper, packaging, demo, extra,
  counter_color}`.

**Referential reality (the key constraint):**
- The **only** inbound FKs to the edition tables are the four worker join tables.
- `Cart.id`, `OrderItems.book_id`, `PromoCodes.target_product_id`, `BoxSetBooks.product_id`
  all reference editions as the **loose text string `"<Category>-<id>"`** — no FK.
- The four tables have **overlapping `id` ranges** (e.g. `Ebooks.id` 1–62 and `CardBooks.id`
  1–63); the category prefix is what disambiguates `EBook-55` from `Book2.0-55`.

---

## 2. What it costs (the F5 evidence)

- **Triplicated `UNION ALL`** over the four tables in **three** catalog RPCs:
  `get_catalog_books`, `get_catalog_book_by_slug`, `get_similar_books`. Adding a column or
  edition kind means editing the same union (and the per-edition `jsonb` detail builders +
  four worker subqueries) in every one.
- **~10 SQL functions branch per-edition-table**: the three above + `search_books`,
  `get_cart_with_title_ids`, `apply_promo_code` (4-table COALESCE to resolve a product id),
  `box_set_is_physical`, `default_edition_for_title`, plus edition reads in
  `getDownloadUrl`/`getOrders`/admin.
- **Latent correctness bug**: `search_books` scans **only `CardBooks`** — titles whose only
  published edition is an Ebook/Audiobook/PrintBook are invisible to search (verified: F5
  addendum in the audit).
- **Fat client type**: `Book` (123 LoC) carries every edition's attributes at once, almost
  all `null` per row; `normalizeBook` (200 LoC) does heavy per-edition `jsonb` narrowing.
- **Code-side abstraction already exists** to paper over it: `src/lib/admin/bookProducts.ts`
  (`EditionTable` union, `EDITION_LABEL`, `ALL_EDITION_TABLES`, `EDITION_FILE_FOLDER`),
  `getDownloadUrl`'s `DIGITAL_FILE_TABLE` map, the admin `ProductsManager`.
- **~30 code sites** parse/build the `"<Category>-<id>"` string.

---

## 3. Proposed target design

A single **`Editions`** table + a single **`EditionWorkers`** join.

```
Editions(
  id            bigserial PK,        -- new unified surrogate
  kind          text NOT NULL,       -- 'EBook' | 'AudioBook' | 'PrintBook' | 'Book2.0'
  source_id     integer NOT NULL,    -- the ORIGINAL per-table id (preserves external ids)
  title_id      int NOT NULL REFERENCES Titles,
  price, discount, is_published, publish_date, release_date,
  demo_path, file_path, sold, sold_out,        -- shared (nullable where N/A)
  details       jsonb NOT NULL DEFAULT '{}',   -- type-specific tail
  UNIQUE (kind, source_id)
)
EditionWorkers(id, edition_id REFERENCES Editions, worker_id, sort_order)
```

**The decisive design choice — preserve `"<kind>-<source_id>"`.** Because
`OrderItems.book_id` is an **immutable historical snapshot** (`EBook-55`) and Cart / promo /
box-set references are loose text with **overlapping id ranges**, the external id scheme must
keep resolving. Keep `kind` + `source_id` and resolve a product id `"<Category>-<n>"` →
`Editions WHERE kind=<Category> AND source_id=n`. This means **no rewrite of any existing
`book_id`/`Cart.id`/`target_product_id`/`product_id` string** — the riskiest part is avoided.

**Type-specific columns: `jsonb details` vs nullable typed columns.** The tail is small and
bounded; nullable typed columns keep SQL filterable and the generated TS clean. But `jsonb`
makes "add an edition kind" a pure data change. Recommendation: **nullable typed columns**
(matches the rest of the schema; the audit's complaint was *table* duplication, not column
typing). Either works.

**Payoff:** the three catalog RPCs collapse their `UNION ALL` to a plain
`SELECT … FROM Editions WHERE …`; `search_books` becomes correct for free (one table);
`get_cart_with_title_ids`/`apply_promo_code`/`box_set_is_physical`/`default_edition_for_title`
each lose their 4-way branching; `Book`/`normalizeBook` shrink; the `bookProducts.ts`
`EditionTable` abstraction and `getDownloadUrl` map disappear.

---

## 4. Migration sketch (phased, reversible until the drop)

1. **Create** `Editions` + `EditionWorkers` (RLS: public read + revoke anon writes, like the
   other edition tables; add `(title_id)`, `(kind, source_id)` indexes).
2. **Backfill** `Editions` from the four tables (one INSERT…SELECT each, mapping columns →
   shared cols + `details`, setting `kind` + `source_id = old id`). Backfill `EditionWorkers`
   from the four worker tables joined via `(kind, source_id)`.
3. **Rewrite the ~10 SQL functions** to read from `Editions` (resolve product ids by
   `kind, source_id`). This is where `search_books` gets fixed.
4. **Update code**: `bookProducts.ts` (collapse the `EditionTable` abstraction to a `kind`
   list), `getDownloadUrl` (drop `DIGITAL_FILE_TABLE`, select from `Editions`),
   admin `ProductsManager` + `getAdminBook` + `lib/admin/books/actions.ts` (edition CRUD now
   one table), shrink `Book`/`normalizeBook`. Regenerate types.
5. **Verify** end-to-end (catalog list/detail/similar/search, cart, checkout charge, admin
   edition CRUD, digital download) — **no test suite exists**, so this is manual + DB parity
   queries against the old tables before dropping.
6. **Drop** the four edition tables + four worker tables (destructive — backup + approval).

Compatibility views named `Ebooks`/etc. over `Editions` could ease step 4, but they fight
Supabase typegen + RLS; a direct cutover is cleaner.

---

## 5. Blast radius

| Surface | Count | Notes |
|---|---|---|
| New tables | 2 | `Editions`, `EditionWorkers` |
| Tables dropped (step 6) | 8 | 4 edition + 4 worker |
| SQL functions rewritten | ~10 | incl. the 3 catalog RPCs + `search_books` (bug fix) |
| Code files | ~8 | `bookProducts.ts`, `getDownloadUrl`, `getOrders`, admin `ProductsManager`/`getAdminBook`/`actions`, `entities/book` (`server`/`client`/`normalize`) |
| `"<Category>-<id>"` parse/build sites | ~30 | **unchanged** if the (kind, source_id) scheme is preserved |
| Immutable `OrderItems.book_id` | — | **protected** by preserving the external id scheme |

---

## 6. Risks

- **Immutable order snapshots** — mitigated only by the `(kind, source_id)` preservation; a
  naive single-id renumber would orphan historical `OrderItems`. Non-negotiable.
- **No automated tests** — the catalog + checkout charge path is verified by hand today;
  consolidating ~10 functions at once is a lot to re-verify manually.
- **`category` enum stays** — it also covers non-edition kinds (`GiftCard`, `BoxSet`,
  `Subscription`, `Course`); `Editions` only absorbs the four book kinds. No enum change.
- **RLS re-setup** on the new tables (the F1 lesson: don't ship an RLS-off table).
- **Storage** (`file_path`/`demo_path`) is just data — unaffected.

---

## 7. Recommendation — **NO-GO as a big-bang now; do the cheap sliver instead**

At today's scale (≤63 rows/table, 64 titles) the four-table model **works**; its cost is
maintainability and one real bug. A full consolidation is a **large, high-risk migration**
across ~10 SQL functions and the checkout/order snapshot scheme, with **no test harness** to
catch regressions. The risk/reward is poor *right now*.

Recommended path:

1. **Now (cheap, separable):** fix the `search_books` CardBooks-only bug directly — make it
   `UNION ALL` the four tables like the catalog RPCs (or have it call the same logic). This
   removes the only *correctness* problem from F5 in ~20 lines, no data migration. ~1 commit.
2. **Defer the full consolidation** until there's a forcing function (adding a 5th edition
   kind, or a perf/scale need) **and** ideally a minimal test harness for the catalog +
   checkout path. When done, use the `(kind, source_id)`-preserving design above.
3. Keep this document as the ready-to-execute design when that time comes.

> If the team prefers to invest now regardless, §4 is the plan — but sequence it as its own
> multi-commit effort with a parity-verification gate before the step-6 drop, not folded into
> the audit cleanup.

**Decision:** ⬜ go (execute §4)  ·  ⬜ no-go, do sliver §7.1 only  ·  ⬜ no-go, defer entirely
