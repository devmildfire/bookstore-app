# Promo Codes

**Status**: Pending
**Branch**: update
**Tracker**: [promo-codes-tracker.md](./promo-codes-tracker.md)

---

## Goal

Add two kinds of promo codes — **item-level** (one Title or one specific
edition) and **cart-level** (whole cart) — applied through the existing
`PromoCodeForm` at the bottom of the cart. Each code has a discount percent
and a validity window. The admin panel to create codes is out of scope; the
data shape needs to support it.

---

## Confirmed behavior (locked via Q&A)

| Decision | Answer |
|---|---|
| Codes per cart at once | **One total** — applying a new code replaces the previous one (cart or item). |
| Persistence | DB-stored. Survives reload / new sessions until removed, expired, or checked out. |
| Cart-promo base | `cart_promo_pct × sum(original_price × qty)` — original (pre-book-discount) sum. |
| Title-target scope | Discount applies to **every** Cart row whose product belongs to that Title. |
| Case sensitivity | Case-insensitive. Codes stored upper-cased; comparison after trim + upper. |
| Item-level code, target not in cart | **Reject** with Russian inline error. Code is not saved. |
| Code weaker than current discounts | **Apply silently.** Final price always uses the larger discount per the "max wins" rule. If the cart later changes, the code may start helping. |
| Usage limits | None for now — unlimited reuse while active. |
| Input UX | One shared input at the bottom of the cart. System looks the code up to know which kind it is. |
| Totals display | `Сумма` (current behaviour: post-book-discount subtotal) + `Скидка (CODE)` line (only when promo provides additional savings) + `Итого` line. |
| Discount % range | 1–100 (100 = free, supports giveaway promos). |
| Per-row UI | Rows unchanged. Only the totals block reflects the promo. |

---

## Pricing rules (the "max wins" math)

For each Cart row:
- `originalLine = originalUnitPrice × qty`
- `bookDiscOnLine = (originalUnitPrice − price) × qty`  *(intrinsic book discount already baked into `price`)*

Then:

### No promo applied
- `bookDiscountTotal = Σ bookDiscOnLine`
- `subtotal = Σ (price × qty)` *(= `originalSum − bookDiscountTotal`)*
- `discountAmount = 0`
- `total = subtotal`

### Cart-level promo (`kind = 'cart'`)
- `originalSum = Σ originalLine`
- `promoAmount = round(originalSum × pct / 100)`
- `totalDiscount = max(bookDiscountTotal, promoAmount)`
- `discountAmount = max(0, totalDiscount − bookDiscountTotal)` *(extra savings vs intrinsic discounts)*
- `total = subtotal − discountAmount`

### Item-level promo (`kind = 'item'`)
For each row, decide if it matches the target:
- product-target: `row.id === promo.target_product_id`
- title-target: row's product's title_id === `promo.target_title_id` *(joined at compute time)*

Per row:
- `effectiveDisc = matches ? max(bookDiscOnLine, round(originalLine × pct / 100)) : bookDiscOnLine`

Then:
- `totalDiscount = Σ effectiveDisc`
- `discountAmount = max(0, totalDiscount − bookDiscountTotal)`
- `total = subtotal − discountAmount`

`subtotal` ("Сумма") stays exactly as today; the new "Скидка" line only
appears when `discountAmount > 0` (i.e. the code is actually providing
additional savings beyond intrinsic book discounts).

---

## Schema

### `PromoCodes`

```sql
CREATE TABLE "PromoCodes" (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code              TEXT NOT NULL,                       -- stored upper-case
  kind              TEXT NOT NULL CHECK (kind IN ('cart', 'item')),
  target_title_id   INTEGER NULL REFERENCES "Titles"(id) ON DELETE CASCADE,
  target_product_id TEXT NULL,                           -- matches Cart.id
  discount_pct      SMALLINT NOT NULL CHECK (discount_pct BETWEEN 1 AND 100),
  starts_at         TIMESTAMPTZ NOT NULL,
  ends_at           TIMESTAMPTZ NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT promo_kind_targets CHECK (
    (kind = 'cart' AND target_title_id IS NULL AND target_product_id IS NULL)
    OR
    (kind = 'item' AND (
      (target_title_id IS NOT NULL AND target_product_id IS NULL)
      OR
      (target_title_id IS NULL AND target_product_id IS NOT NULL)
    ))
  ),
  CONSTRAINT promo_dates CHECK (starts_at < ends_at)
);

CREATE UNIQUE INDEX promo_codes_code_unique ON "PromoCodes" (code);
CREATE INDEX promo_codes_active_idx ON "PromoCodes" (starts_at, ends_at);

ALTER TABLE "PromoCodes" ENABLE ROW LEVEL SECURITY;
CREATE POLICY promo_codes_select ON "PromoCodes"
  FOR SELECT TO authenticated, anon USING (true);
-- Writes only via service_role (admin tooling, not yet built)
```

### `CartPromo`

One row per user — the currently applied code. Replacing a code = UPSERT.

```sql
CREATE TABLE "CartPromo" (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  promo_id   UUID NOT NULL REFERENCES "PromoCodes"(id) ON DELETE CASCADE,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE "CartPromo" ENABLE ROW LEVEL SECURITY;
CREATE POLICY cart_promo_select ON "CartPromo"
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY cart_promo_insert ON "CartPromo"
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY cart_promo_update ON "CartPromo"
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY cart_promo_delete ON "CartPromo"
  FOR DELETE USING (user_id = auth.uid());
```

After the migration: regenerate `src/types/supabase.ts`.

---

## API layer

New `src/api/promo/`:

| File | Purpose |
|---|---|
| `getActivePromo.ts` | `Promise<AppliedPromo \| null>` — joins `CartPromo` → `PromoCodes` for the current user. |
| `applyPromoCode.ts` | Server-side: normalizes (trim + upper), validates code/dates/target, UPSERTs `CartPromo`. Returns a discriminated union. |
| `removePromoCode.ts` | Deletes the user's `CartPromo` row. |
| `index.ts` | Re-exports + `promoQueryKey`. |

`applyPromoCode` return shape (discriminated union, matches project conventions):

```ts
type ApplyPromoResult =
  | { status: 'ok'; applied: AppliedPromo }
  | { status: 'error'; reason: 'not_found' | 'inactive' | 'target_missing'; targetName?: string }
```

`target_missing` includes `targetName` (the book title) so the UI can render
"Промокод применим только к «<title>». Добавьте товар в корзину."

Validation must look up Cart rows server-side (browser RLS reads them anyway,
but the validator joins through `title_id` for title-target codes to identify
matching rows).

---

## Entity layer

`src/entities/promo/` mirroring the existing pattern:

- `server.ts` — typed `promoCodeQuery`
- `client.ts` — `PromoCode`, `AppliedPromo` (= `PromoCode` + `applied_at`)
- `normalize.ts` — `normalizePromoCode` (snake_case → camelCase)
- `validation.ts` — Zod schema for the input string (`z.string().trim().min(1).max(64).toUpperCase()`)

---

## Computation helper

`src/lib/cartTotals.ts`:

```ts
type CartTotals = {
  subtotal: number       // Σ price×qty (post-book-discount)  ← "Сумма"
  discountAmount: number // extra savings from promo beyond book discounts
  total: number          // = subtotal − discountAmount         ← "Итого"
}

export function calculateCartTotals(
  items: CartItem[],
  promo: AppliedPromo | null,
  matchedTitleIds: Set<number> | null // for title-target item codes
): CartTotals
```

Implements the math in the "Pricing rules" section above. Pure function, no
React, no Supabase — pure for easy reasoning and possible later testing.

---

## Cart context changes

`src/contexts/cart.tsx` is extended:

- Adds a sibling `useQuery` for `getActivePromo` (separate query key
  `['cart', 'promo']`).
- Adds an `applyPromoMutation` and `removePromoMutation`.
- For title-target item codes, the title_id of each cart row is needed; the
  context fetches a side query that maps `cart.id → title_id` (one extra
  query joining `Cart` to each edition table via RPC, or a per-row resolver).
  **Sub-decision**: add a Postgres RPC `get_cart_with_title_ids(user uuid)`
  that returns `(cart_id text, title_id integer)[]` so the join is one
  round-trip on the server side. Simpler than four UNION ALL joins in TS.
- Exposes:
  ```ts
  type CartContextValue = CartState & {
    addItem, removeItem, updateQuantity, clearItems, isPending,    // existing
    appliedPromo: AppliedPromo | null,
    applyPromo: (code: string) => Promise<ApplyPromoResult>,
    removePromo: () => void,
    discountAmount: number,
    finalTotal: number,
  }
  ```
- `CartState.total` stays as the post-book-discount subtotal (= "Сумма").
  `finalTotal` is the new value users actually pay.

---

## UI changes

| File | Change |
|---|---|
| `src/components/cart/PromoCodeForm/PromoCodeForm.tsx` | Wire to `applyPromo`. Show inline error message from the discriminated-union result. Clear input on success. Render an "applied code" chip above the input when a code is active. |
| `src/components/cart/PromoCodeForm/PromoCodeForm.module.scss` | Add styles for the applied-code chip + remove button + inline error. |
| `src/components/cart/CartTotals/CartTotals.tsx` | Add a conditional `Скидка ({code}): -X₽` row + `Итого: Y₽` row. Update the button label / handler if needed. |
| `src/components/cart/CartTotals/CartTotals.module.scss` | Style the new rows. |
| (no per-row changes) | Per Round 3 — rows are unaffected. |

Error label resolution for `target_missing`:
> Промокод применим только к «<targetName>». Добавьте товар в корзину.

Generic errors:
- `not_found` → `Промокод не найден`
- `inactive` → `Промокод неактивен или истёк`

---

## Acceptance

- Cart-level code: enter `SUMMER25` (any case) → totals block shows `Скидка
  (SUMMER25): -X₽` and `Итого: Y₽` whenever the cart-promo gives a larger
  discount than book discounts; otherwise the line is hidden but the chip
  remains.
- Item-level code targeting a Title with multiple editions in cart: all
  matching rows participate in the discount math.
- Item-level code with target missing: applying fails with the "Добавьте
  товар в корзину" message; nothing is saved.
- Removing an item from the cart with an item-level code applied: discount
  recalculates next render; the code remains active.
- A code outside `[starts_at, ends_at]` cannot be applied; if somehow already
  applied (e.g. ends_at passes mid-session) the compute helper treats it as
  inactive and `discountAmount = 0`.
- Reload preserves the applied code.
- Two users with different applied codes do not see each other's state (RLS).
- `npm run lint` clean.

---

## Out of scope

- Admin panel for creating/editing codes.
- Recording the used code on `Orders` at checkout.
- Per-user / global redemption caps.
- Multiple simultaneous codes.
- Codes that target categories ("all audiobooks", "all books by author X").
- Currency-amount discounts (only percent now).
- Anonymous-purchase recovery UX (the 30-day refresh-token window). Decided
  separately: anonymous purchases are allowed, but checkout (separate plan)
  must warn the user that without registration their purchases tether to one
  device. `CartPromo` rows are FK'd to `auth.uid()` like `Cart`, so they
  inherit whatever recovery story checkout settles on — nothing to design in
  this plan.
