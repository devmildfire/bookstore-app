# SimilarBooks Component - Complete Analysis

## Component: `src/components/BookPage/SimilarBooks.tsx`

### Dependencies
```tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import styled from 'styled-components';
import breakPoints from '../../utils/breakPoints';
import booksData from '../../utils/booksData';
```

### Exact Styles
```scss
.Title {
  margin-bottom: 50px;
  text-align: center;
  font-family: Cheque;
  font-style: normal;
  font-weight: 900;
  font-size: 44px;
  line-height: 53px;
  
  @media ${breakPoints.lg} {
    font-size: 40px;
    line-height: 48px;
  }
  
  @media ${breakPoints.sm} {
    font-size: 24px;
    line-height: 28px;
  }
}

.BooksList {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  position: relative;
  
  .swiper-slide {
    text-align: center;
  }
  
  .mySwiper {
    @media ${breakPoints.sm} {
      margin: 0 -60px;
    }
}

.BookItem {
  flex: 0 0 18.5%;
}

.Banner {
  width: 100%;
  height: 387px;
  
  @media ${breakPoints.xl} {
    height: 288.5px;
  }
  
  @media ${breakPoints.lg} {
    height: 228.5px;
  }
  
  @media ${breakPoints.md} {
    width: 120px;
    height: 190px;
  }
  
  @media screen and (max-width: 700px) {
    width: auto;
    height: auto;
  }
}
```

### Component Structure
```tsx
<section>
  <Title>Познакомьте также</Title>
  <BooksList>
    {isSliderActive
      ? (
        <Swiper className='mySwiper' {...params}>
          {booksData.map((book, index) => {
            if (index < 5) {
              return (
                <SwiperSlide key={book.id}>
                  <Link href={`/books/${book.id}`}>
                    <a href='fakeHref'>
                      <Banner src={book.link} alt={book.title} />
                    </a>
                  </Link>
                </SwiperSlide>
              );
            }
            return null;
          })}
        </Swiper>
      )
      : booksData.map((book, index) => {
          if (index < 5) {
            return (
              <BookItem>
                <Link href={`/books/${book.id}`}>
                  <a href='fakeHref'>
                    <Banner src={book.link} alt={book.title} />
                  </a>
                </Link>
              </BookItem>
            );
            return null;
          })}
      </BooksList>
  </section>
```

### Key Measurements
- **Title**: 44px font-size, 53px line-height
- **Banner dimensions**: 387px height (desktop), responsive
- **Book item**: 0 0 18.5% flex width
- **Swiper slidesPerView**: 3
- **Swiper spaceBetween**: 20px

### Responsive Logic
The component has conditional rendering:
- **Desktop (700px+)**: Swiper carousel with 3 slides
- **Below 700px**: Switch to static grid layout
- **Width threshold**: 700px (controlled by window.innerWidth)

### Resize Handler
```tsx
const resizeHandler = () => {
  if (window.innerWidth < 700) {
    setIsSliderActive(true);
  }
  if (window.innerWidth > 700) {
    setIsSliderActive(false);
  }
};

useEffect(() => {
  window.addEventListener('resize', resizeHandler);
  return () => {
    window.removeEventListener('resize', resizeHandler);
  };
}, []);
```

---

## Migration Notes for Update Branch

### Critical Style Preservations
1. **Exact banner dimensions**: 387px × 100% (desktop), responsive scaling
2. **Book item spacing**: 0 0 18.5% between books
3. **Title typography**: Cheque font, 900 weight, exact sizes per breakpoint
4. **Flex wrap behavior**: justify-content: space-between, relative positioning

### Component Dependencies
- **Old**: `swiper` v7.3.1, `swiper/react` v7.3.1
- **New**: Can use existing Swiper or migrate to Radix UI Carousel

### Style Stack Mappings
- **Old**: styled-components with exact CSS values
- **New**: SCSS Modules with token system
- **Colors**: Map from `#DCDCDC`, `#930000`, `#fff` to new token system
- **Typography**: Cheque font (custom) vs Inter (Google Fonts)
- **Breakpoints**: sm: 830px, md: 830px, lg: 1440px

### Key Differences to Preserve
1. **Conditional rendering** based on 700px width threshold
2. **Exact banner aspect ratios** must be maintained
3. **Exact spacing** between carousel items and buttons
4. **Title sizes** at each breakpoint
5. **JavaScript resize listener** for state management

---

## Dependencies Summary

### External Libraries Used
- `swiper`: Carousel component library
- `swiper/react`: React wrapper
- `swiper/css`: Swiper CSS styles
- `react-svg`: For SVG handling (if any)

### Component Relationships
- Used in: Book Detail Page (bottom section)
- Shares `booksData` utility with Homepage Slider component
- Links to individual book pages

### Migration Priority
- **HIGH**: Exact dimensions and responsive behavior
- **MEDIUM**: Banner aspect ratio and scaling
- **LOW**: JavaScript resize logic (can be modernized)

---

## Implementation Notes for Update Branch

### Complex State Management
The component manages two states:
1. `isSliderActive`: Boolean for conditional rendering
2. Window width detection for responsive behavior

### Modern Alternatives
1. **CSS Media Queries**: Replace JS resize listener with `@media` queries
2. **Radix UI Carousel**: More stable, better accessibility
3. **Next.js Image**: Use `next/image` for banner optimization

### Data Structure
The `booksData` utility provides the same book data structure used across multiple components.

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Understand conditional rendering logic
- [ ] Document all exact measurements
- [ ] Map colors to token system

### Phase 2: Implementation
- [ ] Recreate component with SCSS Modules
- [ ] Implement responsive behavior
- [ ] Replace resize listener with CSS media queries

### Phase 3: Integration
- [ ] Integrate with book detail page
- [ ] Test responsive breakpoints
- [ ] Verify carousel behavior matches old site exactly
