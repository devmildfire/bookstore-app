# Promo Codes — Progress Tracker

**Plan**: [promo-codes.md](./promo-codes.md)
**Branch**: update

Resume by reading the plan, then picking the first unchecked step.
Tick a step only after its acceptance criterion is met. Notes section
at the bottom for blockers.

---

## Steps

- [ ] **1. DB migration: `PromoCodes` + `CartPromo`**
  File: `supabase/migrations/<ts>_promo_codes.sql`
  - Create `PromoCodes` table with CHECK constraints (`promo_kind_targets`,
    `promo_dates`) + unique index on `code` + index on `(starts_at, ends_at)`.
  - Create `CartPromo` table keyed by `user_id`.
  - Enable RLS + policies (PromoCodes: select for authenticated+anon;
    CartPromo: full CRUD for owner).
  Apply via `psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f <file>`.
  Accept: tables visible via `\d "PromoCodes"`, `\d "CartPromo"`; RLS shown.

- [ ] **2. RPC: `get_cart_with_title_ids`**
  Same migration or a separate one. Returns `(cart_id text, title_id int)[]`
  for the calling `auth.uid()`, joining `Cart` to each edition table by
  category. Used by the cart context for title-target item-code matching.
  Accept: calling the RPC for a user with mixed-edition cart returns one row
  per cart line with the correct `title_id`.

- [ ] **3. Seed a few test codes**
  `supabase/seed-promo-codes.sql` (idempotent) with at least:
  - One cart-level code, 10% off, active today.
  - One item-level (product-target) code, 30% off, for the seeded "Белый цветок"
    ebook id.
  - One item-level (title-target) code, 20% off, for the same title.
  - One expired code (ends_at in the past) for negative-path testing.
  Accept: `SELECT * FROM "PromoCodes"` shows the seeded rows.

- [ ] **4. Regenerate `src/types/supabase.ts`**
  Per `AGENTS.md` command. Accept: new tables + RPC visible in the file;
  `npm run lint` clean.

- [ ] **5. Entity layer: `src/entities/promo/`**
  - `server.ts` — typed query def.
  - `client.ts` — `PromoCode`, `AppliedPromo` (= PromoCode + appliedAt).
  - `normalize.ts` — snake → camel.
  - `validation.ts` — Zod for input string (trim, upper, len 1–64).
  Accept: TS compiles; types match the seeded rows.

- [ ] **6. API layer: `src/api/promo/`**
  - `getActivePromo.ts` — join `CartPromo` → `PromoCodes`, return
    `AppliedPromo | null` for current user.
  - `applyPromoCode.ts` — normalize input, lookup, validate dates, validate
    target presence (using `get_cart_with_title_ids` for title-target), UPSERT
    `CartPromo`. Returns discriminated `ApplyPromoResult`.
  - `removePromoCode.ts` — delete the user's `CartPromo` row.
  - `index.ts` — barrel exports + `promoQueryKey`.
  Accept: each function has explicit types; unit-style smoke via dev console
  succeeds for the seeded codes; error cases return the correct discriminant.

- [ ] **7. Compute helper: `src/lib/cartTotals.ts`**
  Pure function `calculateCartTotals(items, promo, matchedTitleIds)`. Implements
  the "Pricing rules" section of the plan exactly. No React, no Supabase.
  Accept: hand-verified with sample inputs:
  - Items totalling 1000₽ orig / 800₽ subtotal (200₽ book disc), no promo →
    `{ subtotal: 800, discountAmount: 0, total: 800 }`.
  - Same items + 30% cart promo → `promoAmount = 300`, beats 200 → `{ subtotal:
    800, discountAmount: 100, total: 700 }`.
  - Same items + 10% cart promo → `promoAmount = 100`, loses to 200 → `{
    subtotal: 800, discountAmount: 0, total: 800 }`.

- [ ] **8. Cart context: wire up promo state**
  `src/contexts/cart.tsx`:
  - Sibling `useQuery` for `getActivePromo` (key `['cart', 'promo']`).
  - Sibling `useQuery` for `getCartWithTitleIds` (key `['cart', 'titleIds']`).
  - `applyPromoMutation` (invalidates promo + titleIds), `removePromoMutation`
    (invalidates promo).
  - Compute `discountAmount` + `finalTotal` via `calculateCartTotals`.
  - Expose `appliedPromo`, `applyPromo`, `removePromo`, `discountAmount`,
    `finalTotal` on the context value.
  Accept: `useCart()` callers compile; reload preserves applied promo.

- [ ] **9. `PromoCodeForm` — wire to `applyPromo`**
  - Trim + upper before sending (Zod handles).
  - Submit calls `applyPromo(code)`; show inline Russian error from the
    discriminated union; clear input on success.
  - Render applied-code chip (`Применён: SUMMER25 (-30%)` + X button) above
    the input when `appliedPromo != null`.
  - X calls `removePromo()`.
  Accept: full apply / remove cycle works against seeded codes. Wrong code,
  expired code, item-missing code each show the correct message.

- [ ] **10. `CartTotals` — show `Скидка` + `Итого`**
  - Existing `Сумма` row unchanged (= post-book-discount subtotal).
  - Conditionally render `Скидка (CODE): −X₽` when `discountAmount > 0`.
  - New `Итого: Y₽` row showing `finalTotal`.
  - `Продолжить` button uses `finalTotal` for any display copy if needed.
  Accept: totals reflect the math at every state — no promo, weaker promo,
  winning promo. Visual matches mock from the Q&A round.

- [ ] **11. Visual verification**
  Test against the seeded codes:
  - Apply `SUMMER25` (cart, 10%) on a cart with mixed book discounts → verify
    Скидка only appears when cart-promo wins.
  - Apply title-target code on a multi-edition cart → both rows participate.
  - Apply product-target code → only that row participates.
  - Apply expired code → error.
  - Apply unknown code → error.
  - Apply item code without matching item in cart → error with title name.
  - Reload page with code applied → chip + math persists.
  - Two browser profiles / sessions → no cross-leak via RLS.
  Accept: all checks pass at desktop and mobile breakpoints (1920, 1280, 744,
  360).

- [ ] **12. Lint, commit, push**
  `npm run lint`. Check diff for secrets / >1MB. One commit (or two if the
  migration step is significantly ahead of the rest). Push immediately.

---

## Notes / blockers

_(append entries as you work — date, what happened, what's needed to unblock)_
