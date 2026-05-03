# Homepage Components Analysis

## Page Structure
**File**: `pages/index.tsx`
**Used Components**: `MainPage` (`src/components/MainPage/index.tsx`)

## MainPage Component Analysis

### Component: `src/components/MainPage/index.tsx`

#### Dependencies
```tsx
import Slider from '../PageLayout/Slider';
import NewProduct from '../NewProduct';
import booksData from '../../utils/booksData';
```

#### Component Structure
```tsx
<Slider books={booksData} />
<NewProduct />
```

---

## Sub-Component: `src/components/PageLayout/Slider.tsx`

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
}

.buttonBlock .button:hover {
  color: #930000;
  border: .5px solid rgb(220 220 220 / 50%);
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

### Key Measurements
- Slider height: 100%
- Bullet size: 14px × 14px (inactive), 22px × 22px (active)
- Bullet color: #DCDCDC (inactive), #930000 (active)
- Bullet spacing: 25px, reduced to 20px for last bullet
- Button size: 150px × 50px
- Button border: 1px solid #DCDCDC
- Button hover: .5px solid rgb(220 220 220 / 50%)
- Border radius: 4px
- Transition: .2s ease-out

---

## Sub-Component: `src/components/NewProduct/index.tsx`

### Dependencies
```tsx
import BookCard from '../BookCard';
import booksData from '../../utils/booksData';
```

### Exact Styles
```scss
.newProductTitle {
  display: flex;
  justify-content: center;
  margin: 204px 0 80px;
  font-family: Cheque;
  font-style: normal;
  font-weight: 900;
  font-size: 60px;
  text-transform: uppercase;
  line-height: 72px;
  color: #DCDCDC;
}

.newProducts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  grid-column-gap: 219px;
  grid-row-gap: 100px;
  max-width: 1400px;
  margin: 0 auto;
}

.buttonContainer {
  display: flex;
  justify-content: center;
  margin-bottom: 200px;
}

.buttonContainer .toBookStoreButton {
  width: 320px;
  height: 70px;
  color: #FFFFFF;
  margin-top: 100px;
  background: transparent;
  border: 1px solid #FFFFFF;
  border-radius: 4px;
  cursor: pointer;
  transition: all .2s ease-out;
}

.buttonContainer .toBookStoreButton:hover {
  color: #930000;
  border: .5px solid rgb(220 220 220 / 50%);
}
```

### Key Measurements
- Title size: 60px (desktop), line-height: 72px
- Grid columns: auto-fit with 320px minimum width
- Grid column gap: 219px
- Grid row gap: 100px
- Max width: 1400px
- Button size: 320px × 70px
- Button border: 1px solid #FFFFFF
- Button hover: .5px solid rgb(220 220 220 / 50%)
- Border radius: 4px
- Title color: #DCDCDC
- Button hover color: #930000

---

## Dependencies Summary

### External Libraries Used
- `swiper`: `^7.3.1` (carousel/slider)
- `swiper/react`: `^7.3.1` (React wrapper)
- `react-svg`: `^14.1.3` (SVG handling)

### Component Relationships
- MainPage → Slider (carousel of books)
- MainPage → NewProduct (new books grid with CTA button)
- Both use `booksData` utility for book data

---

## Migration Notes for Update Branch

### Style Stack Mappings
- **Old**: styled-components with exact CSS values
- **New**: SCSS Modules with token system
- **Colors**: Need to map from `#DCDCDC`, `#930000`, `#FFFFFF` to new token system

### Font Mappings
- **Old**: Cheque font (custom font-face)
- **New**: Inter font (Google Fonts)
- **Sizes**: Need to preserve visual hierarchy

### Component Structure Preservation
1. **Slider**: Can use existing Swiper or migrate to Radix UI carousel
2. **NewProduct**: Similar to books page structure
3. **Button**: Already exists in new branch as `Button` component

### Critical Differences to Preserve
- Exact button dimensions (150×50, 320×70)
- Exact border styles and hover states
- Exact typography sizes and colors
- Exact spacing and layout
- Grid configurations with exact gap sizes
