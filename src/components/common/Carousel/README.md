# `<Carousel>`

A responsive image / slide carousel with a centered active slot, side-slide
previews, infinite wrap-around, drag/swipe input and a click-to-fullscreen
overlay. Implemented as a self-contained React component with no external
carousel dependency — pure state + CSS transitions.

Used by the book detail page to show the print-book photo gallery
(`src/app/books/[slug]/BookEditionTabs/BookEditionTabs.tsx`).

---

## Usage

```tsx
import Carousel from '@/components/common/Carousel'

<Carousel
  slides={photos.map((src, i) => (
    <Image key={src} src={src} alt={`Фото ${i + 1}`} width={500} height={500} />
  ))}
  ariaLabel="Фотографии книги"
  slotWidth={500}
  slotHeight={500}
/>
```

The component sizes each slot to `slotWidth × slotHeight` (default 500×500)
and lets the consumer render anything inside. Images should use
`object-fit: contain` (or be square) — the slot is a fixed bounding box;
content uses whatever space fits inside.

## Props

| Prop             | Type                                        | Default       | Notes |
|------------------|---------------------------------------------|---------------|-------|
| `slides`         | `ReactNode[]`                               | —             | Required. One node per slide; usually a Next.js `<Image>`. |
| `slotWidth`      | `number`                                    | `500`         | Active slot width in px. |
| `slotHeight`     | `number`                                    | `500`         | Active slot height in px. |
| `sideSlideScale` | `number`                                    | `0.636`       | Visible size of the prev/next slides as a fraction of the active. Matches the Figma source. |
| `loop`           | `boolean`                                   | `true`        | Wraps from the last slide back to the first seamlessly. |
| `ariaLabel`      | `string`                                    | `'Изображения'` | `aria-label` on the `role="region"` wrapper. |
| `labels`         | `Partial<CarouselLabels>`                   | (Russian)     | Override the inner button labels and live-region text. See [Labels](#labels). |
| `className`      | `string`                                    | —             | Forwarded to the root element. |

### Labels

```ts
type CarouselLabels = {
  prev: string
  next: string
  close: string                                            // fullscreen close button
  slide:  (index: number, total: number) => string         // aria-label per slide
  status: (index: number, total: number) => string         // SR-only live region
}
```

Russian defaults:

```js
{
  prev:   'Прокрутить влево',
  next:   'Прокрутить вправо',
  close:  'Закрыть',
  slide:  (i, n) => `${i + 1} из ${n}`,
  status: (i, n) => `Слайд ${i + 1} из ${n}`,
}
```

---

## Responsive modes

Mode is purely CSS-driven; the component renders the same DOM at every size.

| Mode      | Width range  | Layout                                                                                                     |
|-----------|--------------|------------------------------------------------------------------------------------------------------------|
| Wide      | ≥ 1024 px    | Three slides visible. Nav buttons outside the slot area with `$space-8` gap. Click active → fullscreen.    |
| Medium    | 600–1023 px  | Same three-slide preview; nav buttons collapse onto the carousel's inner left/right edges (above slides).  |
| Mobile    | ≤ 599 px     | Single full-bleed slide; carousel breaks out of parent padding to `100vw`. Nav: tall thin red chevrons inside the slide. Fullscreen disabled. |

### Layout math

The Carousel exposes four CSS custom properties (set on the root via inline `style`):

```
--slot-w        active slot width, scaled
--slot-h        active slot height, scaled
--side-scale    sideSlideScale prop, used for prev/next sizing
--drag-offset   current drag translateX, applied to the active slide
```

A `ResizeObserver` shrinks `--slot-w` / `--slot-h` proportionally when the
parent is narrower than the ideal carousel width (active + 2 × side previews
+ nav buttons + gaps). Mobile mode overrides slot dimensions to `100%`.

---

## Looping mechanism

A naïve list `[A, B, C, D]` can't wrap smoothly because the slide that should
appear as `prev(A)` is `D` — which lives at the opposite end of the DOM. We
solve it with **slide triplication**:

```
rendered = [A, B, C, D,  A, B, C, D,  A, B, C, D]   // 12 DOM nodes
selected starts at idx 4 (middle copy of A)
```

Navigation increments / decrements `selectedIndex`. Each click runs a CSS
transition between role classes (`active`, `prev`, `next`, `farPrev`,
`farNext`, hidden). When `selectedIndex` drifts outside the middle copy
range, the component **silently teleports** back to the equivalent middle-copy
position after the animation completes:

1. `selectedIndex` enters the outer triplet (e.g. moves from idx 7 → idx 8).
2. Slide transition plays normally for `TRANSITION_MS` (300 ms).
3. `isTeleporting=true` is set, `selectedIndex` jumps to the equivalent
   middle-copy index (8 - slides.length = 4).
4. Slide transitions are suppressed for two `requestAnimationFrame` ticks via
   the `.teleporting` class so the DOM-element swap is invisible.
5. `isTeleporting=false`; ready for the next navigation.

The destination slide in the middle copy has identical content to the
just-departed slide in the outer copy, so the user sees no change.

This works for any `slides.length ≥ 2`. For `slides.length === 1` looping
is auto-disabled.

---

## Drag & click

Custom pointer handlers on the viewport (Embla was tried and dropped for *this*
component — its loop modes didn't compose with `position: absolute` slides + centered
preview at small slide counts. Embla is still used elsewhere in the app — `Slider`
and `CardCarousel` — just not here):

* **`onPointerDown`** — captures the pointer and the starting X. Records
  whether the press started on the active slide (needed for fullscreen).
* **`onPointerMove`** — writes `dragOffset` (px from start) into the
  `--drag-offset` CSS var. Only the active slide reads this var (its
  transform includes `translateX(var(--drag-offset))`), so side slides stay
  put while only the active follows the finger.
* **`finishDrag`** (`pointerup` / `pointercancel`):
  * if `|distance| > DRAG_THRESHOLD_PX` (40), invokes `scrollNext`
    or `scrollPrev` based on direction
  * else if `|distance| < CLICK_TOLERANCE_PX` (5), it's a click — if it
    landed on the active slide and the viewport is ≥ 600 px, open fullscreen
  * resets `dragOffset` to 0; CSS transitions take over

> **Why custom drag?**: Native image drag (`<img>` triggers the OS
> drag-and-drop affordance) was capturing the pointer and starving our
> handler. `.content { pointer-events: none }` lets events fall through to
> the slot div, which bubbles them to the viewport. The image still receives
> `-webkit-user-drag: none` for defence-in-depth.

---

## Fullscreen mode

Triggered by a clean click (no drag, no nav button) on the active slide
**on viewports ≥ 600 px**. Below that, fullscreen is disabled because the
mobile layout is already a single full-width slide.

In fullscreen the root is `position: fixed; inset: 0; background: #000`,
slides render in the same single-full-slide layout as mobile (active centred,
others translated off-screen), and a red X close button appears at top-right.

Exit via:

* clicking the X
* pressing `Escape`

Body scroll is locked while open. State (`selectedIndex`) is preserved so
closing fullscreen returns to the same slide in the normal layout.

---

## Accessibility

* `role="region"` + `aria-roledescription="carousel"` on the root.
* Each slide has `role="group"` + `aria-roledescription="slide"` and a
  generated `aria-label`. Non-active slides get `aria-hidden="true"`.
* A visually hidden `[aria-live="polite"]` element announces slide changes:
  *"Слайд 2 из 4"* (configurable via `labels.status`).
* Keyboard: when the carousel has focus, `←` / `→` navigate, `Esc` closes
  fullscreen. The wrapper has `tabIndex={0}` so it's reachable in tab order.

---

## Known limitations

* The carousel breaks out of ancestor padding on mobile via the classic
  full-bleed pattern (`width: 100vw; margin-left: calc(50% - 50vw)`). This
  assumes no ancestor has `overflow: hidden` clipping the horizontal
  overflow.
* Slot dimensions are uniform — there's no per-slide aspect ratio. Mixed
  aspect ratios within the same gallery rely on `object-fit: contain` on the
  consumer-provided image to fit them inside the fixed slot.
* `TRANSITION_MS` (300 ms) is hardcoded to match the slide transition in
  CSS. If you change the transition timing in `Carousel.module.scss`, update
  the constant.
