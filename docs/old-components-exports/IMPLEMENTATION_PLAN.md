# Old Components Migration — Implementation Plan

## Current State

The new project already has: Header, Footer, PageLayout, Button, BookCard, Dialog, Popover, SCSS design tokens, menuItems, book catalog + detail pages, cart, auth.

## Components to Migrate

Listed in dependency order — build bottom-up.

---

### Phase 1: Shared UI Primitives

#### 1a. Counter (`src/components/common/Counter/`)
- **Old**: `src/components/Common/Counter.tsx` — styled-component with +/- buttons and count display
- **New**: SCSS Module, functional component
- **Styles from old**:
  - Container: `display: flex`, `width: 200px`, `height: 50px`, `border: 1px solid #cfcfcf`, `border-radius: 4px`
  - Buttons: `flex: 1`, `background: transparent`, `font-size: 25px`, `color: #DCDCDC`
  - Count: `flex: 2`, `text-align: center`, `font-size: 18px`, `color: #DCDCDC`
  - Hover: buttons get `background: #fafafa`
- **Files to create**: `Counter.tsx`, `Counter.module.scss`
- **No dependencies on other new components**

#### 1b. Slider / Carousel (`src/components/common/Slider/`)
- **Old**: `src/components/PageLayout/Slider.tsx` — uses Swiper with navigation/pagination
- **New**: Use `swiper` package (already React-compatible) or a lighter alternative
- **Old Swiper config**: `slidesPerView: 1`, `loop: true`, `autoplay: { delay: 5000 }`, navigation + pagination modules
- **Banner images**: 1920×600, with overlay text (book title, author, link button)
- **Styles from old**:
  - Banner: `width: 100%`, `height: 600px`, `object-fit: cover`
  - Overlay: positioned absolute, centered text with Cheque font
  - Title: `font-size: 57px`, `line-height: 68px`, `color: #DCDCDC`
  - Subtitle: `font-size: 24px`, `line-height: 29px`, `color: #DCDCDC`
  - CTA button: `320px × 70px`, `border: 1px solid #FFFFFF`, `border-radius: 4px`
  - Responsive: banner 600px → 400px (LG) → 300px (SM)
- **Files to create**: `Slider.tsx`, `Slider.module.scss`
- **Note**: New app already has `src/consts/menuItems.ts`

---

### Phase 2: Homepage Sections

#### 2a. NewProduct Section (`src/components/book/NewProducts/`)
- **Old**: `src/components/NewProduct/index.tsx` — grid of book cards with "НОВИНКИ" heading
- **New**: Use existing `BookCard` component, wrap in grid layout
- **Styles from old**:
  - Title: `font-family: Cheque`, `font-weight: 900`, `font-size: 60px`, `line-height: 72px`, `text-transform: uppercase`, `color: #DCDCDC`, `margin: 204px 0 80px`, centered
  - Grid: `display: grid`, `grid-template-columns: repeat(auto-fit, minmax(320px, 1fr))`, `column-gap: 219px`, `row-gap: 100px`, `max-width: 1400px`
  - Button: `320px × 70px`, `border: 1px solid #FFFFFF`, `border-radius: 4px`, `color: #FFFFFF`, hover → `color: #930000`, `border: 0.5px solid rgba(220,220,220,0.5)`
  - Button margin: `margin-top: 100px`, `margin-bottom: 200px`
- **Files to create**: `NewProducts.tsx`, `NewProducts.module.scss`
- **Depends on**: existing `BookCard`

#### 2b. Homepage Page Update
- **Old**: `pages/index.tsx` → `MainPage` (Slider + NewProduct)
- **New**: Update existing homepage route to compose Slider + NewProducts
- **Note**: Root `/` redirects to `/books` currently. Decide: keep redirect or add homepage?

---

### Phase 3: Book Detail Sub-Components

These extract sections from the existing book detail page (`src/app/books/[slug]/page.tsx`) into separate components.

#### 3a. BookDescription (`src/components/book/BookDescription/`)
- **Old**: `src/components/BookPage/BookDescription.tsx`
- **New**: Extract from detail page, SCSS Module
- **Styles from old**:
  - Layout: two-column (image left, info right), `column-gap: 60px`
  - Book cover: `width: 320px`, `height: 500px`, `border-radius: 4px`
  - Title: `font-family: Cheque`, `font-size: 57px`, `line-height: 68px`, `color: #DCDCDC`
  - Author: `font-size: 24px`, `line-height: 29px`, `margin-bottom: 20px`
  - Description: `font-size: 18px`, `line-height: 22px`
  - Price: `font-size: 36px`, `color: #A10202`, `font-weight: 700`
  - Old price: `text-decoration: line-through`, `color: #aeaeae`
  - Responsive: stacks vertically at MD breakpoint
- **Files to create**: `BookDescription.tsx`, `BookDescription.module.scss`

#### 3b. BookProperties (`src/components/book/BookProperties/`)
- **Old**: `src/components/BookPage/BookProperties.tsx`
- **New**: SCSS Module
- **Styles from old**:
  - Section margin-bottom: `100px` (desktop), `70px` (SM)
  - Title: `font-family: Cheque`, `font-size: 57px`, `line-height: 68px`, centered
  - Property rows: `display: flex`, `justify-content: space-between`, `padding: 30px 0`, `border-bottom: 1px solid #cfcfcf`
  - Label: `color: #cfcfcf`, Value: `color: #DCDCDC`
- **Files to create**: `BookProperties.tsx`, `BookProperties.module.scss`

#### 3c. BookTrailer (`src/components/book/BookTrailer/`)
- **Old**: `src/components/BookPage/BookTrailer.tsx`
- **New**: SCSS Module, responsive YouTube embed
- **Styles from old**:
  - Section margin-bottom: `130px` (desktop), `100px` (LG), `70px` (SM)
  - Title: same pattern as other section titles (57px Cheque)
  - Video container: `padding-top: 56.25%` (16:9 aspect ratio), absolute-positioned iframe
- **Files to create**: `BookTrailer.tsx`, `BookTrailer.module.scss`

#### 3d. BookAuthor (`src/components/book/BookAuthor/`)
- **Old**: `src/components/BookPage/BookAuthor.tsx`
- **New**: SCSS Module
- **Styles from old**:
  - Section margin-bottom: `105px` (desktop), `70px` (SM)
  - Title: 57px Cheque pattern
  - AuthorInfo: `display: flex`, `margin-bottom: 40px`, stacks at MD
  - AuthorFoto: `margin-right: 40px`, `416×294` (XL), `288×200` (SM)
  - RedQuote: decorative `»`, `font-size: 105px`, `color: #930000`, absolute-positioned, hides below 960px
  - AuthorSpeech: `max-width: 661px`, italic
  - AuthorAbout: `margin-bottom: 54px`, `font-size: 24px`
  - AuthorContacts: centered flex with SVG icons, hover fill → `#A10202`
- **Files to create**: `BookAuthor.tsx`, `BookAuthor.module.scss`

#### 3e. SimilarBooks (`src/components/book/SimilarBooks/`)
- **Old**: `src/components/BookPage/SimilarBooks.tsx` — Swiper carousel on desktop, static grid on mobile
- **New**: Use Swiper or CSS scroll-snap
- **Styles from old**:
  - Title: `font-size: 44px`, `line-height: 53px`
  - Banner: `height: 387px` (desktop), responsive down
  - Book items: `flex: 0 0 18.5%`
  - Swiper: `slidesPerView: 3`, `spaceBetween: 20`, `loop: true`
  - Below 700px: switches to static layout (no carousel)
- **Files to create**: `SimilarBooks.tsx`, `SimilarBooks.module.scss`
- **Depends on**: Slider setup from Phase 1b (swiper)

---

### Phase 4: Header Enhancement

#### 4a. HeaderTab / Navigation Dropdown
- **Old**: `src/components/PageLayout/components/HeaderTab.tsx` — uses Popper for hover dropdown
- **New**: New Header already exists with navigation. Evaluate if dropdown menus are needed.
- **Old behavior**: Hover over nav item → dropdown with submenu items (uses react-popper)
- **New approach**: Use existing Radix UI DropdownMenu or NavigationMenu
- **Decision needed**: Does the current Header already handle submenus? If not, add dropdown support.

---

## Implementation Order

```
Phase 1a: Counter          → standalone, no deps
Phase 1b: Slider           → standalone, needs swiper dependency
Phase 2a: NewProducts      → depends on existing BookCard
Phase 2b: Homepage update  → depends on 1b + 2a
Phase 3a: BookDescription  → extract from existing detail page
Phase 3b: BookProperties   → standalone
Phase 3c: BookTrailer      → standalone
Phase 3d: BookAuthor       → standalone
Phase 3e: SimilarBooks     → depends on swiper (1b)
Phase 4a:  Header dropdown → depends on evaluation
```

## Cross-Cutting Concerns

### Typography Pattern (Section Titles)
Most section titles share the same pattern. Create a shared SCSS mixin:
```scss
@mixin section-title {
  margin-bottom: 30px;
  text-align: center;
  font-family: Cheque;
  font-weight: 900;
  font-size: 57px;
  line-height: 68px;

  @media (max-width: $breakpoint-lg) {
    font-size: 40px;
    line-height: 48px;
  }

  @media (max-width: $breakpoint-md) {
    font-size: 24px;
    line-height: 28px;
  }
}
```

### Color Token Mapping
| Old Variable | Old Value | New Token |
|-------------|-----------|-----------|
| `colors.blackBase` | `#121212` | `$color-bg-primary` |
| `colors.grey` | `#DCDCDC` | `$color-text-primary` |
| `colors.grey50` | `#aeaeae` | `$color-text-muted` |
| `colors.redBase` | `#A10202` | `$color-accent` |
| `colors.red` | `#930000` | `$color-accent-hover` |
| `colors.grey05` | `#fafafa` | `$color-bg-hover` |

### Responsive Breakpoints
| Old | Value | New |
|-----|-------|-----|
| `sm` | 576px | `$breakpoint-sm` (767px) |
| `md` | 830px | `$breakpoint-md` (830px) |
| `lg` | 1024px | `$breakpoint-lg` (1024px) |
| `xl` | 1440px | `$breakpoint-xl` (1440px) |

**Note**: Old `sm` (576px) maps closer to new `$breakpoint-sm` but exact values differ. Verify during implementation.

### Font: Cheque
The old site uses `Cheque` as display font. Verify this font is available/installed in the new project. If not, add it or find the closest alternative.
