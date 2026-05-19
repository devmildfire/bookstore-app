# Cart Page Redesign — Progress Tracker

**Plan**: [cart-page-redesign.md](./cart-page-redesign.md)
**Branch**: update

Resume by reading the plan, then picking the first unchecked step.
Tick a step only after its acceptance criterion is met. Notes section
at the bottom for blockers.

---

## Steps

- [x] **1. Shared price formatter `src/lib/formatPrice.ts`**
  `formatPrice(amount: number)` → `"300₽"` (no space). Pure function, no
  Intl. Used only inside cart components in this task; broader rollout is
  a follow-up.

- [x] **2. `EmptyCart` component**
  `src/components/cart/EmptyCart/`. Title `Корзина` + headline `В корзине
  пока ничего нет` + body + outlined `Перейти на главную` button to `/`.
  Match the empty-desktop and empty-mobile Figma frames.

- [x] **3. Rewrite `CartItemRow`**
  `src/components/cart/CartItemRow/`. Render as a single row at desktop +
  744 (slots into the parent grid via subgrid or matched columns) and as a
  stacked card at 360. Image + name/author + type + price block (current
  + struck old) + qty stepper + sum + delete-X. Keep `onUpdateQuantity` /
  `onRemove` signature.

- [x] **4. `PromoCodeForm` component**
  `src/components/cart/PromoCodeForm/`. Label "Промокод" above an input +
  "Применить" button. Always-clickable, click does nothing. Renders
  side-by-side on desktop/744, stacked on mobile.

- [x] **5. `CartTotals` component**
  `src/components/cart/CartTotals/`. Two rows (`Количество`, `Сумма`),
  full-width "Продолжить" button → `/checkout`, caption "После оплаты
  нажмите «Вернуться в магазин», чтобы скачать книгу." Right-aligned at
  desktop/744; full-width column at mobile.

- [x] **6. Rewrite `src/app/cart/page.tsx`**
  Stitch together: `Корзина` heading, column-header row (desktop only),
  items grid (responsive), promo + totals block. Drop the
  `Очистить корзину` button. Drop the row count text in the heading.

- [x] **7. Rewrite `src/app/cart/page.module.scss`**
  Responsive grid layout. Column headers visible only ≥768. Items grid
  uses CSS grid with column tracks matching the headers; rows separated by
  a hairline. At 360 each item becomes a 2-col stacked layout (image |
  info). All breakpoints via existing mixins (`page-container`,
  `breakpoint(...)`).

- [x] **8. Visual verification under chrome-devtools**
  Hit `/cart` at 1920, 1440, 1280, 1024, 744, 532, 360 with throttling
  off (already covered by previous skeletons work). For each:
  - Filled state (have items in cart) matches Figma.
  - Empty state matches Figma.
  - Stepper + delete buttons still update cart.
  - "Продолжить" navigates to `/checkout`.
  - "Перейти на главную" (empty state) navigates to `/`.

- [ ] **9. Lint, commit, push**
  `npm run lint`. Check diff for secrets / >1MB. Short imperative commit
  message ("redesign cart page"). Push immediately per project memory.

---

## Notes / blockers

_(append entries as you work — date, what happened, what's needed to unblock)_
