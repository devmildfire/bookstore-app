# Books Page Components Analysis

## Page Structure
**File**: `pages/books.tsx`

## Component Analysis

### Page Component: `pages/books.tsx`

#### Dependencies
```tsx
import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import BookCard from '../src/components/BookCard';
import booksData from '../src/utils/booksData';
```

#### Exact Styles (In-Line Styled Components)
```scss
.newProductTitle {
  display: flex;
  justify-content: center;
  margin: 50px 0 80px;
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

### Component Structure
```tsx
<StyleWrapper>
  <h2 className='newProductTitle'>КНИЖНАЯ ЛАВКА</h2>
  <div className='newProducts'>
    {booksData.map((book) => (
      <BookCard book={book} />
    ))}
  </div>
  <div className='buttonContainer'>
    <Link href='/' passHref>
      <button className='toBookStoreButton'>
        <a href='fakeHref'>На главную</a>
      </button>
    </Link>
  </div>
</StyleWrapper>
```

---

## Sub-Component: BookCard (Also used on other pages)

### Component: `src/components/BookCard/index.tsx`

#### Dependencies
```tsx
import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { ReactSVG } from 'react-svg';
import styled from 'styled-components';
import { BooksData } from '../../types/api';
import Button from '../Common/Button';
import Counter from '../Common/Counter';
```

#### Exact Styles
```scss
.StyledWrapper {
  font-size: 16px;
  line-height: 20px;
  color: #F5F5F5;
  width: 320px;
  max-width: 320px;
}

.cover {
  margin: 0 auto;
  max-height: 452px;
  box-shadow: 0.5px 0.5px 3px 1px rgb(207 207 236 / 20%);
  overflow: hidden;
  position: relative;
  max-width: 320px;
}

.description {
  position: absolute;
  bottom: -293px;
  left: 0;
  width: 100%;
  padding: 20px 15px;
  background: rgba(19, 19, 19, 0.9);
  transition: .5s ease-in-out;
  font-size: 12px;
  line-height: 15px;
}

.descriptionParagraph {
  margin-bottom: 20px;
}

.descriptionInfo {
  text-align: end;
}

.cover:hover .description {
  bottom: 0;
}

.cardImage {
  height: 450px;
  width: 320px;
}

.cardTitle {
  font-weight: bold;
  font-size: 20px;
  line-height: 24px;
  margin-top: 25px;
}

.cardAuthor {
  margin: 10px 0 23px 0;
  height: 40px;
}

.cardInfo {
  display: flex;
  justify-content: space-between;
}

.cardPrice {
  font-size: 20px;
  font-weight: bold;
  line-height: 24px;
}

.oldPrice {
  margin-right: 17px;
  color: #930000;
}

.like {
  transition: all .2s ease-out;
}

.like:hover > div > svg {
  fill: #930000;
}

.liked > div > svg {
  fill: #930000;
}

.cardButtonBuy {
  width: 320px;
  height: 70px;
  color: #FFFFFF;
  margin-top: 40px;
  background: transparent;
  border: 1px solid #FFFFFF;
  cursor: pointer;
  transition: all .2s ease-out;
}

.cardButtonBuy:hover {
  color: #930000;
  border: .5px solid rgb(220 220 220 / 50%);
}
```

#### Key Measurements
- Card width: 320px (fixed)
- Card max-width: 320px
- Image height: 450px, width: 320px
- Cover max-height: 452px
- Cover box-shadow: `0.5px 0.5px 3px 1px rgb(207 207 236 / 20%)`
- Description position: absolute, bottom: -293px
- Description padding: 20px 15px
- Description background: `rgba(19, 19, 19, 0.9)`
- Description transition: .5s ease-in-out
- Card title margin-top: 25px
- Card author height: 40px
- Card author margin: 10px 0 23px 0
- Button size: 320px × 70px
- Button margin-top: 40px
- Old price color: #930000
- Like icon hover: fill #930000

#### Hover Behavior
- **Description hover**: Slides up from bottom: -293px to 0
- **Button hover**: Color changes to #930000, border becomes .5px solid rgb(220 220 220 / 50%)
- **Like button hover**: SVG fill changes to #930000

---

## Migration Notes for Update Branch

### Component Already Exists
- `BookCard` component exists in new branch at `src/components/common/BookCard/`
- **CRITICAL**: Current implementation is INCORRECT - needs to be completely replaced

### Style Stack Mappings
- **Old**: styled-components with exact CSS values
- **New**: SCSS Modules with token system
- **Grid Layout**: Use CSS Grid instead of current implementation
- **Colors**: Map from `#F5F5F5`, `#930000`, `#DCDCDC` to new token system
- **Typography**: Use appropriate Inter font weights

### Key Differences to Fix
1. **Card Dimensions**: Currently not matching exact 320px × 450px layout
2. **Cover Hover Effect**: Missing the description slide-up animation
3. **Exact Button Styling**: Border states, hover transitions
4. **Description Overlay**: Missing the hover overlay effect
5. **Spacing**: Exact margins and gaps
6. **Old Price Display**: Missing the strikethrough old price
7. **Like Button**: Missing the SVG icon and hover states

### Data Structure
The old `booksData` structure needs to be mapped to the new Supabase database structure.

---

## Dependencies Summary

### External Libraries Used
- `styled-components`: For exact CSS styling
- `next/link`: For navigation
- `react-svg`: For SVG icon handling

### Component Relationships
- books.tsx → BookCard (repeated in grid)
- BookCard → Button (for buy action)
- BookCard → Counter (for quantity)
- BookCard → Like SVG (for favorites)

