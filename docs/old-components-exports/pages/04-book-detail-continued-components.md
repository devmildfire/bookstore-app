# Book Detail Page - Continued Components Analysis

## Sub-Component 3: BookTrailer

### Component: `src/components/BookPage/BookTrailer.tsx`

#### Dependencies
```tsx
import React from 'react';
import styled from 'styled-components';
import breakPoints from '../../utils/breakPoints';
import { TBookProps } from '../../types/bookProps';
```

#### Exact Styles
```scss
.StyleWrapper {
  margin-bottom: 130px;
  
  @media ${breakPoints.lg} {
    margin-bottom: 100px;
  } 
  
  @media ${breakPoints.sm} {
    margin-bottom: 70px;
  } 
}

.Title {
  margin-bottom: 30px;
  text-align: center;
  font-family: Cheque;
  font-weight: 900;
  font-size: 57px;
  line-height: 68px;
  
  @media ${breakPoints.xl} {
    margin-bottom: 26px;
  } 
  
  @media ${breakPoints.lg} {
    font-size: 40px;
    line-height: 48px;
  } 
  
  @media ${breakPoints.md} {
    margin-bottom: 15px;
    font-size: 24px;
    line-height: 28px;
  } 
  
  @media ${breakPoints.sm} {
    font-size: 24px;
    line-height: 28px;
  }
}

.TrailerContainer {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
}

.TrailerVideo {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}
```

#### Component Structure
```tsx
<StyleWrapper>
  <Title>Буктрейлер</Title>
  <TrailerContainer>
    <TrailerVideo
      src={book.trailerSrc}
      title={book.title}
      frameBorder='0'
      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
      allowFullScreen
    />
  </TrailerContainer>
</StyleWrapper>
```

#### Key Measurements
- **Title**: 57px font-size, 68px line-height
- **Video container**: padding-top: 56.25% (creates 16:9 aspect ratio for full width video)
- **Title margins**: 30px bottom (reduces on mobile)
- **Section margin-bottom**: 130px (100px LG, 70px SM)

#### Responsive Behavior
- **Title size**: 57px (desktop), 40px (LG+), 24px (MD/SM)
- **Title line-height**: 68px (desktop), 48px (LG), 28px (MD/SM)

#### Video Attributes
- Fullscreen allowed
- Autoplay enabled
- Encrypted media support
- Gyroscope/picture-in-picture support
- Accelerometer support
- Zero frame border

---

## Sub-Component 4: BookAuthor

### Component: `src/components/BookPage/BookAuthor.tsx`

#### Dependencies
```tsx
import React, { ReactElement } from 'react';
import { ReactSVG } from 'react-svg';
import styled from 'styled-components';
import { TBookProps } from '../../types/bookProps';
import colors from '../../utils/colors';
import breakPoints from '../../utils/breakPoints';
import contactIconsSrc from '../../utils/contactIconsData';
```

#### Exact Styles
```scss
.StyleWrapper {
  margin-bottom: 105px;
  
  @media ${breakPoints.sm} {
    margin-bottom: 70px;
  }
}

.Title {
  margin-bottom: 30px;
  text-align: center;
  font-family: Cheque;
  font-weight: 900;
  font-size: 57px;
  line-height: 68px;
  
  @media ${breakPoints.xl} {
    margin-bottom: 26px;
  } 
  
  @media ${breakPoints.lg} {
    font-size: 40px;
    line-height: 48px;
  } 
  
  @media ${breakPoints.md} {
    margin-bottom: 15px;
    font-size: 24px;
    line-height: 28px;
  } 
  
  @media ${breakPoints.sm} {
    margin-bottom: 30px;
    font-size: 24px;
    line-height: 28px;
  }
}

.AuthorInfo {
  position: relative;
  margin-bottom: 40px;
  display: flex;
  
  @media ${breakPoints.lg} {
    margin-bottom: 20px;
  } 
  
  @media ${breakPoints.md} {
    flex-direction: column;
    align-items: center;
  } 
  
  @media ${breakPoints.sm} {
    margin-bottom: 10px;
  }
}

.AuthorFoto {
  margin-right: 40px;
  
  @media ${breakPoints.xl} {
    width: 416px;
    height: 294px;
  } 
  
  @media ${breakPoints.md} {
    margin-right: 0;
    margin-bottom: 20px;
  } 
  
  @media ${breakPoints.sm} {
    width: 288px;
    height: 200px;
  }
}

.AuthorDescr {
  font-size: 24px;
  line-height: 29px;
}

.AuthorProps {
  margin-bottom: 40px;
  font-weight: 700;
  
  @media ${breakPoints.xl} {
    margin-bottom: 25px;
  } 
  
  @media ${breakPoints.lg} {
    margin-bottom: 19px;
    font-size: 18px;
    line-height: 22px;
  } 
  
  @media ${breakPoints.sm} {
    margin-bottom: 15px;
    font-size: 16px;
    line-height: 20px;
    font-weight: 400;
    
    span {
      display: block;
      margin-top: 5px;
    }
  }
}

.AuthorSpeech {
  position: relative;
  max-width: 661px;
  font-style: italic;
  font-weight: 400;
  
  @media ${breakPoints.xl} {
    max-width: 558px;
    font-size: 20px;
    line-height: 24px;
  } 
  
  @media ${breakPoints.lg} {
    max-width: 406px;
    font-size: 16px;
    line-height: 19.5px;
  } 
  
  @media ${breakPoints.md} {
    font-size: 15px;
  } 
}

.Quotes {
  @media screen and (min-width: 960px) {
    display: none;
  }
}

.RedQuote {
  position: absolute;
  right: -126px;
  top: -40px;
  font-style: italic;
  font-weight: 500;
  font-size: 105px;
  line-height: 128px;
  color: ${colors.red};
  
  @media ${breakPoints.xl} {
    top: -30px;
    right: -43px;
    font-size: 65px;
    line-height: 80px;
  } 
  
  @media screen and (max-width: 1100px) {
    right: -8px;
  }
  
  @media ${breakPoints.lg} {
    right: -58px;
    font-size: 51px;
    line-height: 62px;
  } 
  
  @media screen and (max-width: 960px) {
    display: none;
  }
}

.AuthorAbout {
  margin-bottom: 54px;
  font-size: 24px;
  line-height: 29px;
  
  @media ${breakPoints.xl} {
    margin-bottom: 33px;
  } 
  
  @media ${breakPoints.lg} {
    font-size: 16px;
    line-height: 19.5px;
  } 
  
  @media ${breakPoints.sm} {
    margin-bottom: 22px;
  } 
}

.AuthorContacts {
  display: flex;
  justify-content: center;
  font-size: 18px;
  line-height: 22px;
  
  span {
    margin-right: 25px;
    font-weight: 700;
    
    @media ${breakPoints.sm} {
      font-size: 16px;
      line-height: 19.5px;
    } 
  }
  
  @media ${breakPoints.sm} {
    svg {
      width: 16.67px;
      height: 13.33px;
    }
  }
}

.ContactsList {
  display: flex;
  align-items: center;
}

.ContactsItem {
  &:not(:last-child) {
    margin-right: 30px;
    
    @media ${breakPoints.sm} {
      margin-right: 21px;
    }
  }
}

.ContactLink {
  svg path {
    transition: fill .3s ease-in-out;
  }
  
  &:hover svg path {
    fill: ${colors.redBase};
    transition: fill .3s ease-in-out;
  }
}
```

#### Component Structure
```tsx
<StyleWrapper>
  <Title>Об авторе</Title>
  <AuthorInfo>
    <AuthorFoto src='/images/authors/kune.jpg' alt={`${book.author}`} />
    <AuthorDescr>
      <AuthorProps>
        {book.author && <span>{`${book.author} `}</span>}
        {book.authors && book.authors.map((name) => <span>{`${name} `}</span>)}
        <span>| Аскер | 24.03.1984</span>
      </AuthorProps>
    </AuthorDescr>
    <AuthorSpeech>
      <RedQuote>&#187;</RedQuote>
      <Quotes>&#171;</Quotes>
      [Long biographical quote text with author's philosophy]
      <Quotes>&#187;</Quotes>
    </AuthorSpeech>
  </AuthorInfo>
  <AuthorAbout>
      [Long biographical text about the author]
    </AuthorAbout>
    <AuthorContacts>
      <span>Контакты:</span>
      <ContactsList>
        {contactIconsSrc.map((iconSrc) => (
          <ContactsItem>
            <ContactLink href='fakeHref' target='_blank' rel='noreferrer'>
              <ReactSVG src={iconSrc} />
            </ContactLink>
          </ContactsItem>
        ))}
      </ContactsList>
    </AuthorContacts>
</StyleWrapper>
```

#### Key Measurements
- **Title**: 57px font-size, 68px line-height (matches BookTrailer)
- **Author image**: 416px × 294px (desktop), down to 288px × 200px (mobile)
- **Red quote**: 105px font-size, 128px line-height, positioned absolute
- **Quote spacing**: Right: -126px, top: -40px
- **Author speech width**: Max 661px
- **Contact icons**: 16.67px × 13.33px (mobile)

#### Responsive Behavior
- **Title**: 57px → 40px → 24px
- **Author image**: Full width (XL), side-by-side (LG), stacked (MD), centered (SM)
- **Red quote**: Hides below 960px
- **Author speech**: Max-width scales down on responsive breakpoints

#### Special Features
- **Large red quotes** (&#187;) positioned absolutely on both sides
- **Inline author/authors** display with spacing
- **SVG hover effects**: Contact icons fill ${colors.redBase} on hover

---

## Sub-Component 5: SimilarBooks

### Component: `src/components/BookPage/SimilarBooks.tsx`

#### Dependencies
```tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import styled from 'styled-components';
import breakPoints from '../../utils/breakPoints';
import booksData from '../../utils/booksData';
```

#### Exact Styles
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

#### Component Structure
```tsx
<section>
  <Title>Познакомьтесь также</Title>
  <BooksList>
    {isSliderActive ? (
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
    ) : booksData.map((book, index) => {
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
      }
      return null;
    })}
  </BooksList>
</section>
```

#### Swiper Configuration
```tsx
const params = {
  slidesPerView: 3,
  spaceBetween: 20,
  loop: true,
};
```

#### Key Measurements
- **Title**: 44px font-size, 53px line-height
- **Banner height**: 387px (desktop), responsive down
- **Book item width**: 0 0 18.5% flex (creates ~18.5% gap between items)
- **Swiper spaceBetween**: 20px

#### Responsive Behavior
- **Desktop**: Swiper carousel with 3 slides per view
- **Below 700px**: Switches to static grid layout (no carousel)
- **Banner images**: Scale down on breakpoints

---

## Migration Notes for Update Branch

### Critical Features to Preserve
1. **Swiper carousel functionality** with exact breakpoints (700px threshold)
2. **Large decorative quotes** (&#187;) with exact positioning
3. **Author photo dimensions** with responsive changes
4. **Contact icon hover states** with SVG color transitions
5. **Banner aspect ratios** with responsive scaling

### Style Stack Mappings
- **Old**: styled-components with exact CSS
- **New**: SCSS Modules with Radix UI components
- **Colors**: Map from ${colors.redBase} (#A10202), ${colors.grey} (#DCDCDC)
- **Typography**: Cheque font (custom) vs Inter (Google Fonts)

### Complex Responsive Logic
The SimilarBooks component has conditional rendering based on screen width:
- Desktop (700px+): Swiper carousel
- Mobile (<700px): Static grid
This requires JavaScript resize listener or CSS media queries.

---

## Dependencies Summary

### External Libraries Used
- `swiper`: `^7.3.1` (carousel component)
- `swiper/react`: `^7.3.1` (React wrapper)
- `react-svg`: `^14.1.3` (SVG icon handling)
- `styled-components`: `^5.3.3` (CSS-in-JS)

### Component Relationships
- Book Detail Page → BookDescription (top section)
- Book Detail Page → BookProperties (middle section)
- Book Detail Page → BookTrailer (trailer embed)
- Book Detail Page → BookAuthor (author info)
- Book Detail Page → SimilarBooks (related books carousel)
- BookAuthor → Contact icons (from `contactIconsData.ts` utility)

### Utility Dependencies
- `breakPoints.ts`: Responsive breakpoint mixins
- `colors.ts`: Color definitions
- `booksData.ts`: Book data utility
- `contactIconsData.ts`: Social media icon paths
