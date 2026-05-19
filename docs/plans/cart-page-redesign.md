# Cart Page Redesign

**Status**: Pending
**Branch**: update
**Tracker**: [cart-page-redesign-tracker.md](./cart-page-redesign-tracker.md)

---

## Goal

Replace the placeholder `/cart` page with the Figma design across four
breakpoints (1920, 1280, 744, 360) and re-style the empty-cart state. The
underlying cart context, API and entity layer stay as-is — this is a
presentation + structure refresh.

---

## Figma references

| Breakpoint | Node | URL |
|---|---|---|
| 1920 (filled) | `1008:6661` | <https://www.figma.com/design/CZwt15WEQ3Qugfy2NM1CPy/?node-id=1008-6661> |
| 1280 (filled) | `1263:7941` | <https://www.figma.com/design/CZwt15WEQ3Qugfy2NM1CPy/?node-id=1263-7941> |
| 744 (filled)  | `3654:7765` | <https://www.figma.com/design/CZwt15WEQ3Qugfy2NM1CPy/?node-id=3654-7765> |
| 360 (filled)  | `1263:8687` | <https://www.figma.com/design/CZwt15WEQ3Qugfy2NM1CPy/?node-id=1263-8687> |
| Empty desktop | `1972:5691` | <https://www.figma.com/design/CZwt15WEQ3Qugfy2NM1CPy/?node-id=1972-5691> |
| Empty mobile  | `2437:10634` | <https://www.figma.com/design/CZwt15WEQ3Qugfy2NM1CPy/?node-id=2437-10634> |

---

## Layout structure

### Filled cart — desktop (1920, 1280)

```
┌─────────────────────────────────────────────────────────────────┐
│  Корзина                                                         │
│                                                                  │
│        Товар         Тип       Цена   Количество   Сумма         │
│  ──────────────────────────────────────────────────────────  X   │
│   [cover]  title     Цифровое  300₽    - 2 +       600₽      ×   │
│           author     издание   400₽‾   (strike-thru old price)   │
│  ──────────────────────────────────────────────────────────      │
│   [cover]  title     ...                                         │
│  ──────────────────────────────────────────────────────────      │
│   [cover]  title     ...                                         │
│                                                                  │
│  Промокод                          Количество:           3       │
│  [_________] [Применить]           Сумма:           1800₽        │
│                                    [   Продолжить   ]            │
│                                    После оплаты нажмите …        │
└─────────────────────────────────────────────────────────────────┘
```

- Grid columns: `image | name+author | type | price | quantity | sum | delete-X`
- Row separator is a thin horizontal hairline (`Line 54` in Figma).
- Old price under current price, struck-through, red accent (matches
  `BookCard` convention).
- Last column is the delete-X icon (27×27).

### Filled cart — tablet 744

- No column headers.
- One compact row per item: image + (title + author stacked) + type + price + qty stepper + sum + delete-X, all centered vertically.
- Cover is smaller (~80–100 px wide).
- Promo and totals stack the same as desktop (promo left, totals right), but
  in a much narrower viewport — totals stay right-aligned.

### Filled cart — mobile 360

- Each item is a stacked card:
  - Cover image on the left (~120 px wide)
  - Right column: title + author + type
  - Right column second row: price (left), qty stepper (middle), sum (right)
- Below items: full-width promo input + "Применить" button stacked vertically.
- Then `Количество / Сумма` rows.
- Full-width "Продолжить" button.
- Caption beneath the button.

### Empty cart (all breakpoints)

- Title "Корзина" at the top (same as filled).
- Headline: `В корзине пока ничего нет`.
- Body: `Вернитесь на главную или воспользуйтесь поиском, чтобы выбрать что-то.`
- CTA button: `Перейти на главную` → `/`. Outlined style, dark background,
  white border (mirrors the demo button in BookEditionTabs).
- Mobile: centered, content stacked.

---

## Behavior decisions (locked)

| Question | Answer |
|---|---|
| 744 title | Keep `Корзина` heading at every breakpoint. |
| "Продолжить" route | `/checkout` (existing). |
| Clear-all button | Remove. Per-row X is the only removal affordance. |
| Promo "Применить" click | Always-clickable, no feedback. Wired to a real flow later. |
| `Количество` semantic | **Sum of quantities** — re-use existing `useCart().itemCount`. |
| `Сумма` per-row | `item.price × item.quantity` (discounted price; existing). |
| Old price | Per-unit, struck-through, red accent under current price. |
| Currency format | Match Figma — `300₽` no space. New shared helper. |

---

## Files touched

| File | Change |
|---|---|
| `src/app/cart/page.tsx` | Rewrite. Top-level orchestrator: header, items grid, promo + totals, empty state. |
| `src/app/cart/page.module.scss` | Rewrite. Responsive grid + container per breakpoint. |
| `src/components/cart/CartItemRow/CartItemRow.tsx` | Rewrite. Strip the existing flex layout; render as a row in the parent grid (desktop/tablet) or compact card (mobile). |
| `src/components/cart/CartItemRow/CartItemRow.module.scss` | Rewrite to match design. |
| `src/components/cart/PromoCodeForm/` *(new)* | Input + "Применить" button. No-op submit. |
| `src/components/cart/CartTotals/` *(new)* | `Количество`, `Сумма`, "Продолжить" button, caption. |
| `src/components/cart/EmptyCart/` *(new)* | Empty state (title + headline + body + CTA). |
| `src/lib/formatPrice.ts` *(new)* | `formatPrice(amount)` → `"300₽"` (no space). Used by Cart, BookCard, etc. — but in this task only adopt on the cart page; other surfaces stay on `Intl` until follow-up. |

---

## Acceptance

- All four filled-cart breakpoints render visually consistent with their
  Figma frames (manual diff via chrome-devtools).
- Empty cart renders the new screen at desktop and mobile.
- Per-row quantity stepper still calls `updateQuantity` from `useCart`.
- Per-row X still calls `removeItem`.
- "Продолжить" navigates to `/checkout`.
- "Перейти на главную" navigates to `/`.
- Promo input + button render but do nothing on submit.
- `npm run lint` clean. Visual verification at 1920 / 1440 / 1200 / 1024 / 744 / 360.

---

## Out of scope

- The /checkout (payment + delivery) page itself — separate follow-up.
- Replacing the Intl currency formatter project-wide (only adopt the no-space
  formatter inside the cart for now; broader rollout is a follow-up).
- Touching the cart icon badge in the header.
- Replacing `useCart` semantics or API layer.

---

## Open follow-ups (separate tasks)

- Decide whether `formatPrice` should replace Intl currency formatting
  everywhere (`BookCard`, `BookEditionTabs`, etc.).
- Implement the /checkout (payment + delivery) page.
