# Test Promo Codes

Seeded test codes for manually exercising the promo-code flow in the cart.
Source: [`supabase/seed-promo-codes.sql`](../../supabase/seed-promo-codes.sql).
Re-running the seed is idempotent — duplicates are skipped via `ON CONFLICT DO NOTHING`.

```bash
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres \
  -f supabase/seed-promo-codes.sql
```

Codes are case-insensitive when entered — type `summer25`, `Summer25`, or
`SUMMER25` and they all match.

---

## The codes

| Code       | Kind | Target                        | %    | Window           | Use it to verify |
|------------|------|-------------------------------|------|------------------|------------------|
| `SUMMER25` | cart | (whole cart)                  | 20%  | now – +1 year    | Cart-level happy path. With a cart of mixed book discounts, the `Скидка (SUMMER25)` line should appear only when 20% of original sum beats the sum of intrinsic book discounts; otherwise the chip stays but no discount line shows. |
| `FREECART` | cart | (whole cart)                  | 100% | now – +30 days   | Giveaway / 100% edge case. `Итого` should render `0₽`. |
| `WHITE30`  | item | title id 58 (Белый цветок)    | 30%  | now – +1 year    | Title-target item code. Add any edition of «Белый цветок» (ebook, printbook, etc.) to the cart and apply — discount should hit every matching row. Add multiple editions of the same title and verify they all participate. |
| `AUDIO50`  | item | product `AudioBook-4`         | 50%  | now – +1 year    | Product-target item code. Only the specific audiobook row gets the discount. Try applying without the audiobook in the cart — expect the `target_missing` error with title name "Белый цветок". |
| `OLDCODE`  | cart | (whole cart)                  | 50%  | –60 days – –1 day | Expired — should fail with `Промокод неактивен или истёк`. |

Plus negative paths:
- `NOPE` (or any random string) → `Промокод не найден`
- Empty / whitespace input → `Введите корректный промокод`

---

## What "Белый цветок" needs in the cart

Title id 58 has both an Ebook (id 50) and an Audiobook (id 4) seeded. To
fully exercise `WHITE30`'s "all matching editions" rule, add both:

1. Open the book page for «Белый цветок» (slug `white-flower`).
2. Add the printed edition and the ebook (or audiobook). The
   `AddToCartModal` lists every published edition of that title.
3. Apply `WHITE30` — every cart row whose product belongs to title 58 should
   participate in the discount.

---

## Resetting state between tests

Each user has at most one applied code (`CartPromo` table, PK on `user_id`).
Removing it via the chip's X button is enough for a clean re-test of the
same browser.

To wipe applied codes for **all** users (e.g. while exploring fresh
scenarios from multiple browser profiles):

```bash
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres \
  -c 'DELETE FROM "CartPromo";'
```

To wipe the codes themselves and re-seed:

```bash
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres \
  -c 'DELETE FROM "PromoCodes";'
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres \
  -f supabase/seed-promo-codes.sql
```

`PromoCodes.id` is a uuid, so re-seeding gets fresh ids — any `CartPromo`
rows referencing the old codes are cascaded away by the
`ON DELETE CASCADE` on the FK.

---

## Adding more codes for new test scenarios

Edit `supabase/seed-promo-codes.sql` directly — keep the file idempotent so
re-runs are safe. The CHECK constraint `promo_kind_targets` enforces:

- `kind = 'cart'` → both `target_title_id` and `target_product_id` NULL.
- `kind = 'item'` → exactly one of the two targets set, never both.

`discount_pct` must be 1–100. `starts_at < ends_at`. Codes are stored
upper-case (the unique index is on `UPPER(code)`).
