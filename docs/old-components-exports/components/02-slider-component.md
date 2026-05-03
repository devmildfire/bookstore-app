# Slider Component Analysis

## Component: `src/components/PageLayout/Slider.tsx`

### Dependencies
```tsx
import SwiperCore, { Autoplay, Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { BooksData } from '../../types/api';
import 'swiper/css';
import 'swiper/css/pagination';
```

### Exact Styles
```scss
.mySwiper {
  width: 100%;
  height: 100%;
}

.swiper-slide {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  font-size: 22px;
  font-weight: bold;
  color: #fff;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
}

.swiper-pagination-bullet {
  width: 14px;
  height: 14px;
  margin-right: 25px;
  opacity: 1;
  background: #DCDCDC;
}

.swiper-pagination-bullet:not(:last-child) {
  margin-right: 20px;
}

.swiper-pagination-bullet-active {
  width: 22px;
  height: 22px;
  color: #fff;
  background: #930000;
}

.sliderImage {
  margin: 0 auto;
}

.buttonBlock {
  display: flex;
  justify-content: space-between;
  max-width: 330px;
  margin: 0 auto;
  margin-top: 42px;
  margin-bottom: 63px;
}

.buttonBlock .button {
  width: 150px;
  height: 50px;
  background: transparent;
  border: 1px solid #DCDCDC;
  border-radius: 4px;
  color: #DCDCDC;
  transition: all .2s ease-out;

  &:hover {
    color: #930000;
    border: .5px solid rgb(220 220 220 / 50%);
  }
}
```

### Swiper Configuration
```tsx
const params = {
  pagination: {
    el: '.pagination',
    clickable: true,
    renderBullet: (index: number, className: string) => `<span class="${className}"></span>`,
  },
  autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  },
  loop: true,
};
```

### Component Structure
```tsx
<StyleWrapper>
  <>
    <Swiper className='mySwiper' {...params}>
      {books.map((book) => (
        <SwiperSlide key={book.id}>
          <img className='sliderImage' src={book.banner} alt='BookDescription logo' />
        </SwiperSlide>
      ))}
    </Swiper>
    <div className='buttonBlock'>
      <button type='button' className='button'>
        Познать
      </button>
      <button type='button' className='button'>
        Купить
      </button>
    </div>
    <div className='pagination' />
  </>
</StyleWrapper>
```

### Key Measurements
- **Slide images**: Full width 100%, flexible height
- **Buttons**: 150px × 50px
- **Active bullet**: 22px × 22px, #930000 background
- **Inactive bullet**: 14px × 14px, #DCDCDC background
- **Bullet spacing**: 25px, last bullet 20px
- **Button block max-width**: 330px
- **Button spacing**: 42px top, 63px bottom

### Button Styles
- **Default**: Transparent background, 1px solid #DCDCDC border
- **Hover**: Color changes to #930000, border becomes .5px solid rgb(220 220 220 / 50%)
- **Border radius**: 4px

---

## Migration Notes for Update Branch

### External Library
- **Old**: `swiper` v7.3.1 with `swiper/react` v7.3.1
- **New**: Can use existing Swiper or migrate to Radix UI carousel

### Critical Style Preservations
1. **Exact button dimensions**: 150px × 50px
2. **Exact button styles**: Transparent background with 1px border, hover states
3. **Bullet dimensions**: 14px × 14px (inactive), 22px × 22px (active)
4. **Exact colors**: #DCDCDC, #930000, #fff
5. **Border radius**: 4px
6. **Spacing**: Exact margins for buttons and bullet points

### Color Mappings
- **Old**: #DCDCDC, #930000, #fff
- **New Token System**: Map these to appropriate tokens
  - #DCDCDC → Could be $color-text-secondary or custom
  - #930000 → $color-brand-primary or custom
  - #fff → $color-white

### Migration Options
1. **Keep Swiper**: If already installed in new branch
2. **Alternative**: Use Radix UI Carousel component
3. **Custom carousel**: Build simple carousel with CSS animations

---

## Dependencies Summary

### External Libraries Used
- `swiper`: Carousel/slider library
- `swiper/react`: React wrapper
- `swiper/css`: Swiper CSS
- `swiper/css/pagination`: Pagination styles

### Component Relationships
- Used in: MainPage (for homepage hero)
- Used in: SimilarBooks (for book detail page)
- Data source: `booksData` utility

### Functionality
- Auto-plays through slides (2500ms delay)
- Loops continuously
- Custom pagination rendering
- "Познать" and "Купить" CTA buttons
