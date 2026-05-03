# Old Components Export Plan

## Task Status

**Current Status**: 🔄 In Progress — utilities and implementation plan remaining
**Goal**: Document and prepare ALL components from the old site (bookstore-app) for exact recreation in the new update branch

## Approach

Going page-by-page, component-by-component through the old site to document:
1. Exact component structure
2. All styled-components CSS (exact values)
3. Responsive breakpoints
4. Colors and typography
5. Dependencies and icons

## Pages to Analyze

### 1. Homepage (`pages/index.tsx`)
- ✅ Components: MainPage
- ✅ Sub-components: Slider, NewProduct
- ✅ Documented: `docs/old-components-exports/pages/01-homepage-components.md`

### 2. Books Page (`pages/books.tsx`)
- ✅ Components: BookCard
- ✅ Documented: `docs/old-components-exports/pages/02-books-page-components.md`

### 3. Book Detail Page (`pages/books/[id].tsx`)
- ✅ Components: BookDescription, BookProperties, BookTrailer, BookAuthor, SimilarBooks
- ✅ Documented: `docs/old-components-exports/pages/03-book-detail-page-components.md`
- ✅ Documented: `docs/old-components-exports/pages/04-book-detail-continued-components.md`

### 4. Layout Components
- ✅ Header: `src/components/PageLayout/Header.tsx`
- ✅ Footer: `src/components/PageLayout/Footer.tsx`
- ✅ PageLayout: `src/components/PageLayout/PageLayout.tsx`
- ✅ Slider: `src/components/PageLayout/Slider.tsx`
- ✅ HeaderTab: `src/components/PageLayout/components/HeaderTab.tsx`
- ✅ Documented: `docs/old-components-exports/components/01-layout-components.md`
- 🔄 Slider component only

### 5. Popper Component
- ✅ Popper: `src/components/Popper/index.tsx`
- ✅ Documented: `docs/old-components-exports/components/04-popper-and-utilities.md`

### 6. Shared Components
- ✅ BookCard: `src/components/BookCard/index.tsx`
- ✅ Button: `src/components/Common/Button.tsx`
- ✅ Counter: `src/components/Common/Counter.tsx`
- ✅ Documented: `docs/old-components-exports/components/03-shared-components.md`

## Progress Tracker

| Page / Section | Status | Components Documented |
|------|--------|---------------------|
| Homepage | ✅ Complete | MainPage, NewProduct, Slider |
| Books Page | ✅ Complete | BookCard |
| Book Detail Page | ✅ Complete | BookDescription, BookProperties, BookTrailer, BookAuthor, SimilarBooks |
| Layout Components | ✅ Complete | Header, Footer, PageLayout, Slider, HeaderTab |
| Shared Components | ✅ Complete | BookCard, Button, Counter |
| Popper + Utilities | ✅ Complete | Popper, colors, breakpoints, menuItems |
| Data Utilities | 🔄 Remaining | booksData, bookInfo, bookPropertiesData, contactIconsData, Socials, types |
| **TOTAL** | **~90%** | **~18 components documented** |

## Next Steps

- [x] Document remaining data utilities (booksData, bookInfo, bookPropertiesData, contactIconsData, Socials)
- [x] Create implementation plan (phase-by-phase migration guide)
- [ ] Execute Phase 1: Counter + Slider
- [ ] Execute Phase 2: NewProducts + Homepage
- [ ] Execute Phase 3: Book detail sub-components (Description, Properties, Trailer, Author, SimilarBooks)
- [ ] Execute Phase 4: Header dropdown enhancement

---

**Note**: Each component will be documented in a separate file with complete code and styles ready for migration.
