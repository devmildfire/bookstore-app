# Book Detail Page Components Analysis

## Page Structure
**File**: `pages/books/[id].tsx`

## Main Component Analysis

### Page Component: `pages/books/[id].tsx`

#### Dependencies
```tsx
import React from 'react';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import Head from 'next/head';
import styled from 'styled-components';
import colors from '../../src/utils/colors';
import breakPoints from '../../src/utils/breakPoints';
import BookDescription from '../../src/components/BookPage/BookDescription';
import BookProperties from '../../src/components/BookPage/BookProperties';
import BookTrailer from '../../src/components/BookPage/BookTrailer';
import BookAuthor from '../../src/components/BookPage/BookAuthor';
import SimilarBooks from '../../src/components/BookPage/SimilarBooks';
import getBookInfo from '../../src/utils/bookInfo';
```

#### Exact Styles (Main Page Layout)
```scss
.StyleWrapper {
  max-width: 1394px;
  padding: 30px 0 166px;
  margin: 0 auto;
  color: ${colors.whiteBase};
  
  @media ${breakPoints.xl} {
    max-width: 1040px;
    padding: 30px 0 101px;
  } 
  
  @media ${breakPoints.lg} {
    max-width: 830px;
    padding: 41px 0 87px;
  }
  
  @media ${breakPoints.md} {
    padding: 20px 16px 71px;
  } 
  
  @media ${breakPoints.sm} {
    overflow: hidden;
  }
}
```

### Component Structure
```tsx
<StyleWrapper>
  <Head>
    <title>{book?.title}</title>
  </Head>
  {book && (
    <>
      <BookDescription book={book} />
      <BookProperties book={book} />
      <BookTrailer book={book} />
      <BookAuthor book={book} />
      <SimilarBooks />
    </>
  )}
</StyleWrapper>
```

#### Key Measurements (Responsive)
- **Desktop**: max-width: 1394px, padding: 30px 0 166px
- **XL breakpoint**: max-width: 1040px, padding: 30px 0 101px
- **LG breakpoint**: max-width: 830px, padding: 41px 0 87px
- **MD breakpoint**: padding: 20px 16px 71px
- **SM breakpoint**: overflow: hidden (likely for layout adjustment)

---

## Sub-Component 1: BookDescription

### Component: `src/components/BookPage/BookDescription.tsx`

#### Dependencies
```tsx
import React from 'react';
import styled from 'styled-components';
import colors from '../../utils/colors';
import breakPoints from '../../utils/breakPoints';
import { TBookProps } from '../../types/bookProps';
```

#### Exact Styles
```scss
.StyleWrapper {
  margin-bottom: 135px;
  display: flex;
  justify-content: space-between;
  
  @media ${breakPoints.md} {
    margin-bottom: 70px;
  } 
  
  @media ${breakPoints.sm} {
    flex-direction: column;
    align-items: center;
  }
}

.BookImage {
  margin-right: 50px;
  width: 510px;
  height: 810px;
  
  @media ${breakPoints.xl} {
    width: 485px;
    height: 740px;
  } 
  
  @media ${breakPoints.lg} {
    width: 312px;
    height: 480px;
  } 
  
  @media ${breakPoints.md} {
    width: 260px;
    height: 365px;
    margin-right: 20px;
  } 
  
  @media ${breakPoints.sm} {
    margin-right: 0;
    margin-bottom: 20px;
  }
}

.BookTitle {
  margin-bottom: 45px;
  font-family: Cheque;
  font-weight: 900;
  font-size: 80px;
  line-height: 65%;
  color: ${colors.gray5};
  
  @media ${breakPoints.xl} {
    margin-bottom: 57px;
    font-size: 60px;
  } 
  
  @media ${breakPoints.lg} {
    margin-bottom: 45px;
  } 
  
  @media ${breakPoints.md} {
    margin-bottom: 15px;
    font-size: 24px;
    line-height: 29px;
  }
  
  @media ${breakPoints.sm} {
    text-align: center;
  }
}

.BookAuthor {
  margin-bottom: 10px;
  font-weight: bold;
  font-size: 30px;
  line-height: 37px;
  
  @media ${breakPoints.xl} {
    margin-bottom: 23px;
  } 
  
  @media ${breakPoints.lg} {
    margin-bottom: 17px;
    font-size: 20px;
    line-height: 24px;
  }  
  
  @media ${breakPoints.sm} {
    text-align: center;
    margin-bottom: 5px;
  } 
}

.BookThesis {
  margin-bottom: 95px;
  font-style: italic;
  font-weight: 500;
  font-size: 28px;
  line-height: 34px;
  color: ${colors.red};
  
  @media ${breakPoints.xl} {
    margin-bottom: 23px;
    font-size: 24px;
    line-height: 29px;
  } 
  
  @media ${breakPoints.lg} {
    margin-bottom: 17px;
    font-size: 18px;
    line-height: 22px;
  } 
  
  @media ${breakPoints.md} {
    font-size: 14px;
    line-height: 17px;
  } 
}

.BookInfo {
  margin-bottom: 129px;
  font-weight: 700;
  font-size: 14px;
  line-height: 17px;
  
  @media ${breakPoints.xl} {
    margin-bottom: 45px;
  } 
  
  @media ${breakPoints.md} {
    margin-bottom: 25px;
  } 
  
  @media ${breakPoints.sm} {
    text-align: center;
    margin-bottom: 30px;
  } 
}

.BookDescrText {
  max-width: 700px;
  font-size: 24px;
  line-height: 29px;
  
  .bookDescrParagraph:not(last-child) {
    margin-bottom: 20px;
    
    @media ${breakPoints.xl} {
      margin-bottom: 10px;
    } 
  }
  
  @media ${breakPoints.lg} {
    max-width: 474px;
    font-size: 16px;
    line-height: 19.5px;
  }
  
  @media ${breakPoints.md} {
    /* No specific changes */
  } 
}
```

#### Key Measurements
- **Layout**: Flex with justify-content: space-between
- **Margin bottom**: 135px (70px MD)
- **Image Size**: 510px × 810px (desktop), responsive down to 260px × 365px (mobile)
- **Title**: 80px font-size, 65% line-height
- **Author**: 30px font-size, 37px line-height
- **Thesis**: 28px italic, 34px line-height, color: ${colors.red}
- **Info**: 14px font-size, 17px line-height
- **Description text**: 24px font-size, 29px line-height, max-width: 700px

#### Responsive Breakpoints
- **XL (>1440px)**: Image 485px × 740px, title 60px
- **LG (>1024px)**: Image 312px × 480px, title 45px
- **MD (>830px)**: Image 260px × 365px, title 24px
- **SM (≤830px)**: Image 260px × 365px, title 24px, flex-direction: column

---

## Sub-Component 2: BookProperties

### Component: `src/components/BookPage/BookProperties.tsx`

#### Dependencies
```tsx
import React from 'react';
import styled from 'styled-components';
import { TBookProps } from '../../types/bookProps';
import Button from '../Common/Button';
import bookPropsList from '../../utils/bookPropertiesData';
import colors from '../../utils/colors';
import breakPoints from '../../utils/breakPoints';
```

#### Exact Styles
```scss
.StyleWrapper {
  padding: 44px 79px 40px 132px;
  margin-bottom: 135px;
  border: 1px solid ${colors.red};
  box-sizing: border-box;
  
  @media ${breakPoints.xl} {
    padding: 44px 24px 40px 60px;
    margin-bottom: 123px;
  } 
  
  @media ${breakPoints.lg} {
    padding: 33px 19px 40px 30px;
    margin-bottom: 100px;
  } 
  
  @media ${breakPoints.sm} {
    padding: 18px 19px 13px;
    margin-bottom: 70px;
  } 
}

.InnerContainer {
  @media ${breakPoints.sm} {
    max-width: 250px;
    margin: 0 auto;
  }
}

.PropsHeader {
  margin-bottom: 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media ${breakPoints.xl} {
    max-width: 777px;
    flex-wrap: wrap;
    margin-bottom: 35px;
  } 
  
  @media ${breakPoints.lg} {
    max-width: 671px;
  } 
  
  @media ${breakPoints.sm} {
    max-width: 243px;
    margin: 0 auto 21px;
  } 
}

.PropsTitle {
  font-weight: 700;
  font-size: 40px;
  line-height: 49px;
  
  @media ${breakPoints.lg} {
    font-size: 30px;
    line-height: 36px;
  } 
  
  @media ${breakPoints.sm} {
    width: 100%;
    margin-bottom: 4px;
    font-size: 20px;
    line-height: 24px;
  } 
}

.PropsBody {
  display: flex;
  
  @media ${breakPoints.sm} {
    flex-direction: column;
  }
}

.PropsPrice {
  font-weight: 700;
  font-size: 40px;
  line-height: 49px;
  
  @media ${breakPoints.lg} {
    font-size: 30px;
    line-height: 36px;
  } 
  
  @media ${breakPoints.sm} {
    font-size: 20px;
    line-height: 24px;
  }
}

.PropsDate {
  font-weight: 700;
  font-size: 20px;
  line-height: 24px;
  
  @media ${breakPoints.xl} {
    margin-top: 14px;
    width: 100%;
    font-size: 20px;
    line-height: 24px;
  } 
  
  @media ${breakPoints.sm} {
    width: auto;
    margin-top: 0;
    font-size: 12px;
    line-height: 14px;
    font-weight: 400;
  } 
}

.PropsBtnBlock {
  margin-right: 96px;
  
  .propsBtn {
    margin: 0;
    width: 300px;
    height: 70px;
    font-size: 16px;
    line-height: 20px;
    
    @media ${breakPoints.sm} {
      width: 250px;
      height: 40px;
    } 
  }
  
  .propsBtn:last-child {
    margin-bottom: 20px;
  }
  
  @media ${breakPoints.xl} {
    margin-right: 44px;
  } 
  
  @media ${breakPoints.lg} {
    margin-right: 35px;
  } 
  
  @media ${breakPoints.sm} {
    margin-right: 0 auto 5px;
    order: 1;
  } 
}

.PropsItems {
  width: 100%;
  
  @media ${breakPoints.xl} {
    display: flex;
    flex-direction: column;
  } 
  
  @media ${breakPoints.sm} {
    margin-bottom: 24px;
  } 
}

.PropsItem {
  margin-bottom: 30px;
  font-size: 16px;
  line-height: 20px;
  
  span {
    margin-bottom: 15px;
    display: block;
    
    @media ${breakPoints.sm} {
      margin-bottom: 7px;
    }  
  }
  
  &:last-child {
    @media ${breakPoints.xl} {
      order: -1;
      margin-bottom: 30px;
    } 
    
    @media ${breakPoints.lg} {
      margin-bottom: 15px;
    } 
    
    @media ${breakPoints.sm} {
      margin-bottom: 10px;
    }
  }
  
  @media ${breakPoints.xl} {
    margin-bottom: 15px;
    
    &:nth-child(2) {
      margin-bottom: 0;
    }     
  }  
  
  @media ${breakPoints.md} {
    font-size: 12px;
    line-height: 14px;
  } 
  
  @media ${breakPoints.xl} {
    margin-bottom: 15px;
    
    &:nth-child(2) {
      margin-bottom: 0;
    }     
  }  
  
  @media ${breakPoints.md} {
    margin-bottom: 10px;
    
    &:nth-child(2) {
      margin-bottom: 0;
    }     
  }  
}

.PropsFooter {
  max-width: 1054px;
  font-size: 14px;
  line-height: 17px;
  
  @media ${breakPoints.sm} {
    font-size: 10px;
    line-height: 12px;
  }
}
```

#### Key Measurements
- **Padding**: 44px 79px 40px 132px (desktop), responsive
- **Border**: 1px solid ${colors.red}
- **Header flex**: space-between, margin-bottom: 48px
- **Button size**: 300px × 70px (250px × 40px mobile)
- **Item margin-bottom**: 30px (24px mobile)
- **Item font-size**: 16px (12px mobile)
- **Props title**: 40px (20px mobile)
- **Props price**: 40px (20px mobile)

#### Responsive Behavior
- **Desktop**: Full width header, buttons on right
- **XL**: Header wraps, buttons below title
- **LG**: Header continues wrapping
- **MD**: Buttons move to bottom, change order
- **SM**: Full width with stacked layout

---

## Migration Notes for Update Branch

### Critical Style Preservations
1. **Exact font sizes** and line-heights must be maintained
2. **Exact spacing** and margins are crucial for visual match
3. **Responsive breakpoints** must match exactly: sm: 830, md: 1024, lg: 1440, xl: 1441
4. **Color system**: ${colors.red} (#A10202) and ${colors.gray5} (#e0e0e0)
5. **Border styles**: 1px solid red border is distinctive feature
6. **Button dimensions**: 300px × 70px must be exact

### Component Structure
- The book detail page uses multiple specialized sections
- Each section has distinct typography hierarchy
- Layout is responsive with complex breakpoint handling

### Data Structure
The old `bookInfo` utility needs to map to new Supabase database book structure.

---

## Dependencies Summary

### External Libraries Used
- `styled-components`: For exact CSS styling
- `next/router`: For route parameter handling
- `querystring`: For URL query parsing

### Component Relationships
- Book Detail Page → BookDescription (left side, book image + info)
- Book Detail Page → BookProperties (center section, pricing + buttons)
- Book Detail Page → BookTrailer (trailer embed)
- Book Detail Page → BookAuthor (author info with contact links)
- Book Detail Page → SimilarBooks (carousel at bottom)

### Utility Dependencies
- `colors.ts`: Color definitions
- `breakPoints.ts`: Responsive breakpoint mixins
- `bookInfo.ts`: Book data lookup utility
- `bookPropertiesData.ts`: Properties data content