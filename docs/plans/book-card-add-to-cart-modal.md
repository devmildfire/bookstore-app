# Book Card Redesign + Add-to-Cart Modal

**Status**: In progress  
**Branch**: update

---

## Goal

Redesign homepage book cards to match the new visual spec and add a multi-product-type
add-to-cart modal.

---

## Card layout (spec)

```
┌─────────────────────────────┐  dark bg ($color-bg-surface)
│                             │
│      COVER IMAGE            │  aspect-ratio 2/3, Link to /books/[slug]
│   (text baked into image)   │
│                             │
└─────────────────────────────┘
  300Р  400Р              [🛍+]  padding ~12px 16px
```

- White price = current/discounted price (always shown)
- Red price = original price before discount (only shown when `discount` is set)
- No red strikethrough — just colour difference
- Cart icon = line-art shopping bag with `+`, turns red on hover
- Click cover → navigate to book detail page
- Click cart icon:
  - Title has >1 published product type → open AddToCartModal
  - Title has exactly 1 product type → `addItem` directly (no modal)

---

## Modal layout (spec, desktop)

```
┌──────────────────────────────────────────┐
│  Title name                              │
│  Author name                             │
│                                          │
│  Выберите тип издания                    │
│                                          │
│  [✉]  ПЕЧАТНОЕ ИЗДАНИЕ   - 0 +  400Р 300Р│
│  [📱]  ЦИФРОВОЕ ИЗДАНИЕ  - 0 +      300Р │
│  [▦]  КНИГА 2.0          - 0 +      300Р │
│  [▶]  АУДИОКНИГА         - 0 +      300Р │
│                                          │
│  Итог:           2 шт.           600Р   │
│                                          │
│  [ Добавить в корзину ]                  │
└──────────────────────────────────────────┘
```

- Only published product types shown
- Sold-out rows: greyed out, stepper disabled, "нет в наличии" label
- "Добавить в корзину" disabled when all quantities = 0
- On confirm: calls `addItem` for each product with qty > 0, shows success toast, closes modal
- Modal opened via Radix `Dialog`
- All icons are inline line-art SVG components

Product type display names:
- `PrintBook` → "ПЕЧАТНОЕ ИЗДАНИЕ" + envelope icon
- `EBook` → "ЦИФРОВОЕ ИЗДАНИЕ" + tablet icon
- `Book2.0` → "КНИГА 2.0" + open-book/grid icon
- `AudioBook` → "АУДИОКНИГА" + play-button icon

---

## Implementation steps

### Step 1 — DB migration
File: `supabase/migrations/20260506000000_discount_all_products.sql`

- `ALTER TABLE "Ebooks" ADD COLUMN IF NOT EXISTS discount integer;`
- `ALTER TABLE "Audiobooks" ADD COLUMN IF NOT EXISTS discount integer;`
- `ALTER TABLE "PrintedBooks" ADD COLUMN IF NOT EXISTS discount integer;`
- `CREATE OR REPLACE FUNCTION get_catalog_books(...)` — add `discount` and
  `has_multiple_products boolean` (window count: `COUNT(*) OVER (PARTITION BY title_id) > 1`)
  to RETURNS TABLE and query body
- `CREATE OR REPLACE FUNCTION get_catalog_book_by_slug(...)` — add `discount` to RETURNS TABLE
  and each UNION ALL branch

Apply locally:
```bash
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f supabase/migrations/20260506000000_discount_all_products.sql
```

### Step 2 — Regenerate types
```bash
supabase gen types typescript --db-url "postgresql://postgres:postgres@127.0.0.1:54322/postgres" 2>/dev/null > "./src/types/supabase.ts"
```

### Step 3 — Entity layer
- `src/entities/book/server.ts`: add `discount: number | null`, `has_multiple_products: boolean`
- `src/entities/book/client.ts`: add `discount: number | null`, `originalPrice: number | null`,
  `hasMultipleProducts: boolean`
- `src/entities/book/normalize.ts`: compute
  `originalPrice = discount ? Math.round(price / (1 - discount / 100)) : null`

### Step 4 — Client-side book products API
- `src/api/books/getBookProducts.ts`: browser-side function calling
  `get_catalog_book_by_slug`, returns `Book[]` (all published product types for a title)
- `src/hooks/useBookProducts.ts`: TanStack Query hook wrapping the above

### Step 5 — SVG icon components
- `src/components/common/icons/CartPlusIcon.tsx` — shopping bag with `+` (card cart button)
- `src/components/common/icons/ProductTypeIcon.tsx` — renders correct icon per `ProductCategory`
  (envelope / tablet / grid / play-button)

### Step 6 — BookCard redesign
- `src/components/book/BookCard/BookCard.tsx`: new layout
  - Remove title/author/badge section entirely
  - Cover block = `<Link>` to detail page, aspect-ratio 2/3
  - Footer bar = price(s) left-aligned + `CartPlusIcon` button right-aligned
  - `isModalOpen` state; click handler checks `book.hasMultipleProducts`
  - If single product: call `addItem` directly
  - If multiple: set `isModalOpen = true`
  - Render `<AddToCartModal>` inline (conditionally)
- `src/components/book/BookCard/BookCard.module.scss`: rewrite styles

### Step 7 — AddToCartModal
- `src/components/book/AddToCartModal/AddToCartModal.tsx`
  - Receives `slug`, `titleName`, `authorName`, `coverUrl`, `isOpen`, `onClose`
  - Uses `useBookProducts(slug)` to fetch all product variants
  - Local state: `quantities: Record<string, number>` (key = `book.id`)
  - Renders Radix `Dialog` with product rows + stepper + price display
  - "Добавить в корзину" calls `addItem` for each qty > 0, then fires `success()` toast,
    resets quantities, calls `onClose`
- `src/components/book/AddToCartModal/AddToCartModal.module.scss`

### Step 8 — Export / wiring
- Add `AddToCartModal` export from `src/components/book/AddToCartModal/index.ts`
- `NewProducts.tsx` passes the extra props the card needs (no structural change needed —
  all data is already on the `Book` object)

---

## Data flow summary

```
HomePage (RSC)
  └── getLatestBooks(12)          → Book[] (one per title, has hasMultipleProducts)
        └── normalizeBook()       → adds discount/originalPrice/hasMultipleProducts

NewProducts (client)
  └── BookCard (client)
        ├── cover Link → /books/[slug]
        ├── price bar (uses book.price, book.originalPrice)
        └── CartPlusIcon click
              ├── hasMultipleProducts=false → addItem(book)
              └── hasMultipleProducts=true  → open AddToCartModal
                    └── useBookProducts(slug)    ← client fetch
                          └── get_catalog_book_by_slug RPC
                                └── all Book[] for title
```

---

## Files changed

| File | Change |
|------|--------|
| `supabase/migrations/20260506000000_discount_all_products.sql` | New |
| `src/types/supabase.ts` | Regenerated |
| `src/entities/book/server.ts` | Add discount, has_multiple_products |
| `src/entities/book/client.ts` | Add discount, originalPrice, hasMultipleProducts |
| `src/entities/book/normalize.ts` | Compute originalPrice |
| `src/api/books/getBookProducts.ts` | New |
| `src/api/books/index.ts` | Export getBookProducts |
| `src/hooks/useBookProducts.ts` | New |
| `src/components/common/icons/CartPlusIcon.tsx` | New |
| `src/components/common/icons/ProductTypeIcon.tsx` | New |
| `src/components/book/BookCard/BookCard.tsx` | Rewrite |
| `src/components/book/BookCard/BookCard.module.scss` | Rewrite |
| `src/components/book/AddToCartModal/AddToCartModal.tsx` | New |
| `src/components/book/AddToCartModal/AddToCartModal.module.scss` | New |
| `src/components/book/AddToCartModal/index.ts` | New |
