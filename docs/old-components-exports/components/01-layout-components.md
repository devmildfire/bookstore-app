# Layout Components Analysis

## Overview
Layout components provide the visual frame and navigation structure for all pages.

## Component: `src/components/PageLayout/PageLayout.tsx`

### Dependencies
```tsx
import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import Header from './Header';
import Footer from './Footer';
import colors from '../../utils/colors';
```

### Exact Styles
```scss
const StyledWrapper = styled.div`
  width: 100%;
  position: relative;
  background-color: ${colors.blackBase};
  color: ${colors.white};
`;

const Content = styled.div`
  width: 100%;
  min-height: 100vh;
`;
```

### Component Structure
```tsx
<StyledWrapper>
  <Header />
  <Content>
    {children}
  </Content>
  <Footer />
</StyledWrapper>
```

### Default Props
```tsx
interface IPageLayout {
  children: React.ReactElement,
  headTitle?: string,
}

PageLayout.defaultProps = {
  headTitle: 'ЧТИВО | Независимое издательство современной художественной литературы — официальный сайт',
};
```

### Key Measurements
- Full-height: 100vh for content
- Black background: ${colors.blackBase}
- White text: ${colors.white}
- Auto-generated meta title

---

## Component: `src/components/PageLayout/Header.tsx`

### Dependencies
```tsx
import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import Logo from '../../assets/images/logo.svg';
import SearchIcon from '../../assets/icons/search.svg';
import CartIcon from '../../assets/icons/shop-cart.svg';
import SignOutIcon from '../../assets/icons/sign-out.svg';
import HeaderTab from './components/HeaderTab';
import colors from '../../utils/colors';
import menu from '../../utils/menuItems';
```

### Exact Styles
```scss
const StyledWrapper = styled.div`
  width: 100%;
  position: sticky;
  top: 0;
  height: 80px;
  padding: 0 60px;
  background-color: ${colors.blackBase};
  z-index: 999;
  
  @media (max-width: 1440px) {
    padding: 0 40px;
  }

  @media (max-width: 1024px) {
    padding: 0;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  height: 100%;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid grey;
  
  @media (max-width: 1024px) {
    padding: 0 20px;
  }
`;
```

### Component Structure
```tsx
<StyledWrapper>
  <HeaderContent>
    <Link href='/'>
      <Logo />
    </Link>
    <SearchIconStyled />
    {menu.map((item) => (
      <HeaderTab item={item} />
    ))}
    <CartIconStyled />
    <SignOutIconStyled fill={colors.grey} />
  </HeaderContent>
</StyledWrapper>
```

### Icon Hover Styles
```scss
const SearchIconStyled = styled(SearchIcon)`
  cursor: pointer;

  :hover {
    fill: ${colors.redBase};
  }
`;

const CartIconStyled = styled(CartIcon)`
  cursor: pointer;

  :hover {
    stroke: ${colors.redBase};
  }
`;

const SignOutIconStyled = styled(SignOutIcon)`
  cursor: pointer;

  :hover {
    fill: ${colors.redBase};
  }
`;
```

### Key Measurements
- **Header height**: 80px
- **Default padding**: 60px left/right
- **XL breakpoint padding**: 40px
- **LG breakpoint**: No padding
- **Border**: 1px solid grey
- **Icon hover**: fill/stroke changes to ${colors.redBase}

---

## Component: `src/components/PageLayout/components/HeaderTab.tsx`

### Dependencies
```tsx
import React, { Fragment } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import Popper from '../../Popper';
import { MenuItem } from '../../../utils/menuItems';
import colors from '../../../utils/colors';
```

### Exact Styles
```scss
const StyledLink = styled.a`
  font-size: 16px;
  line-height: 20px;
  font-weight: normal;
  color: ${colors.grey};
  white-space: pre-wrap;

  opacity: 0.7;
  cursor: pointer;

  :hover {
    color: ${colors.redBase};
    opacity: 1;
  }
`;

const SubmenuTitle = styled.span`
  font-size: 16px;
  line-height: 20px;
  font-weight: normal;
  color: ${colors.grey};
  margin-bottom: 8px;

  opacity: 0.7;
  cursor: default;
`;

const SubmenuLink = styled(StyledLink)`
  font-size: 14px;
  line-height: 17px;
  opacity: 0.5;
  margin-top: 4px;
`;

const SubmenuItem = styled.div`
  display: flex;
  flex-direction: column;
  margin: 10px 0;
`;

const PopperContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${colors.blackBase};
  padding: 20px;
`;
```

### Component Structure
```tsx
<Fragment key={title}>
  {link ? (
    <Link href={link} passHref>
      <StyledLink href='fakeHref'>{title}</StyledLink>
    </Link>
  ) : (
    <Popper
      target={<SubmenuTitle>{title}</SubmenuTitle>}
      padding={20}
    >
      <PopperContainer>
        {submenu?.map(({ subtitle, link: submenuLink, items }) => (
          <SubmenuItem key={subtitle}>
            {submenuLink ? (
              <Link href={submenuLink} passHref key={subtitle}>
                <StyledLink href='fakeHref'>{subtitle}</StyledLink>
              </Link>
            ) : (
              <>
                <SubmenuTitle>{subtitle}</SubmenuTitle>
                {items?.map(({ title: submenuTitle, link: subLink }) => (
                  <Link href={subLink} passHref key={submenuTitle}>
                    <SubmenuLink href='fakeHref'>{submenuTitle}</SubmenuLink>
                  </Link>
                ))}
              </>
            )}
          </SubmenuItem>
        ))}
      </PopperContainer>
    </Popper>
  )}
</Fragment>
```

### Key Measurements
- **Navigation links**: 16px font-size, 20px line-height
- **Hover states**: Opacity 0.7 → 1.0, color ${colors.grey} → ${colors.redBase}
- **Submenu links**: 14px font-size, 17px line-height, opacity 0.5
- **Dropdown container**: 20px padding, black background
- **Submenu items**: 10px vertical margin

---

## Component: `src/components/PageLayout/Footer.tsx`

### Dependencies
```tsx
import React from 'react';
import styled from 'styled-components';
import colors from '../../utils/colors';
import Logo from '../../assets/icons/footer-logo.svg';
import Insta from '../../assets/icons/footer-insta.svg';
import Telegram from '../../assets/icons/footer-telegram.svg';
import Vk from '../../assets/icons/footer-vk.svg';
import Fb from '../../assets/icons/footer-facebook.svg';
import Twitter from '../../assets/icons/footer-twitter.svg';
import breakPoints from '../../utils/breakPoints';
import getCurrentYear from '../../utils/getCurrentYear';
```

### Exact Styles
```scss
const StyleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  border-top: 1px solid red;
  color: ${colors.whiteBase};  
`;

const FooterContent = styled.div`
  padding: 30px 20px 40px;
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  width: 100%;
  max-width: 1394px;
  
  @media ${breakPoints.xl} {
    max-width: 1024px;
  } 
  
  @media ${breakPoints.lg} {
    max-width: 768px;
  }
  
  @media ${breakPoints.md} {
    max-width: 576px;
    flex-wrap: wrap;    
    align-items: center;
  } 
  
  @media ${breakPoints.sm} {
    flex-direction: column;
    padding: 10px 0 25px;
  }
`;

const FooterContacts = styled.div`
  padding-top: 64px;
  display: flex;
  flex-direction: column;
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  
  a:first-child {
    margin-bottom: 20px;
  } 
  
  span:last-child {
    color: ${colors.red};
  }
  
  @media ${breakPoints.md} {
    padding: 0;
  }
  
  @media ${breakPoints.sm} {
    text-align: center;
    margin-bottom: 30px;
  }
`;

const FooterInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media ${breakPoints.md} {
    width: 100%;
    order: -1;
    margin-bottom: 20px;
  }
`;

const FooterTitle = styled.h2`
  margin-bottom: 15px;
  font-weight: 700;
  font-size: 57px;
  line-height: 69px;
  
  span:first-child {
    color: ${colors.red};
  }
  
  @media ${breakPoints.sm} {
    font-size: 40px;
    line-height: 49px;
  }
`;

const FooterSocials = styled.ul`
  display: flex;
  align-items: center;
`;

const SocialItem = styled.li`

  :not(:last-child) {
    margin-right: 30px;
  }
`;

const IconInsta = styled(Insta)`
  transition: fill .3s ease-in-out;
  
  :hover {
    fill: ${colors.redBase};
    transition: fill .3s ease-in-out;
  }
`;

const IconTelegram = styled(Telegram)`
  transition: fill .3s ease-in-out;
  
  :hover {
    fill: ${colors.redBase};
    transition: fill .3s ease-in-out;
  }
`;

const IconVk = styled(Vk)`
  transition: fill .3s ease-in-out;
  
  :hover {
    fill: ${colors.redBase};
    transition: fill .3s ease-in-out;
  }
`;

const IconFb = styled(Fb)`
  transition: fill .3s ease-in-out;
  
  :hover {
    fill: ${colors.redBase};
    transition: fill .3s ease-in-out;
  }
`;

const IconTwitter = styled(Twitter)`
  transition: fill .3s ease-in-out;
  
  :hover {
    fill: ${colors.redBase};
    transition: fill .3s ease-in-out;
  }
`;

const FooterLogoLink = styled.a`
  margin-top: 56px;
  display: flex;
  
  @media ${breakPoints.md} {
    margin: 0;
  }
`;

const FooterLogo = styled(Logo)`
  margin-right: 17px;
`;

const FooterLogoText = styled.p`  
  span {
    display: block;    
    font-weight: 600;
    font-size: 20px;
    line-height: 26px; 
  } 
  
  span:first-child {
    font-size: 15px; 
    line-height: 20px;
  }
`;

const FooterCopyright = styled.div`
  padding: 15px 0;
  font-size: 12px;
  line-height: 15px;
  font-feature-settings: 'salt' on, 'liga' off;
  border-top: 1px solid rgba(220, 220, 220, 0.2);
  color: ${colors.whiteBase};
  
  span span {
    color: ${colors.red};
  }
  
  @media ${breakPoints.sm} {
    padding: 10px 0;
    font-size: 8px;
    line-height: 10px;
  }
`;

const CopyrightContainer = styled.div`
  max-width: 1394px;
  margin: 0 auto;
  padding: 0 20px;
  
  
  @media ${breakPoints.xl} {
    max-width: 1024px;
  } 
  
  @media ${breakPoints.lg} {
    max-width: 768px;
  } 
  
  @media ${breakPoints.md} {
    max-width: 576px;
  }
`;
```

### Component Structure
```tsx
<StyleWrapper>
  <FooterContent>
    <FooterContacts>
      <a href='tel:+78129158367'>
        Тел.&nbsp;
        <span>
          (812) 915-83-67
        </span>
      </a>
      <a
        href='mailto:info@chtivo.spb.ru'
        target='_top'
      >
        E-mail&nbsp;
        <span>
          info@chtivo.spb.ru
        </span>
      </a>
    </FooterContacts>
    <FooterInfo>
      <FooterTitle>
        <span>Чти</span>
        <span>во</span>
      </FooterTitle>
      <FooterSocials>
        <SocialItem>
          <a href='https://instagram.com' target='_blank' rel='noreferrer'>
            <IconInsta />
          </a>
        </SocialItem>
        <SocialItem>
          <a href='http://t.me.com' target='_blank' rel='noreferrer'>
            <IconTelegram />
          </a>
        </SocialItem>
        <SocialItem>
          <a href='https://vk.com' target='_blank' rel='noreferrer'>
            <IconVk />
          </a>
        </SocialItem>
        <SocialItem>
          <a href='https://facebook.com' target='_blank' rel='noreferrer'>
            <IconFb />
          </a>
        </SocialItem>
        <SocialItem>
          <a href='https://twitter.com' target='_blank' rel='noreferrer'>
            <IconTwitter />
          </a>
        </SocialItem>
      </FooterSocials>
    </FooterInfo>
    <FooterLogoLink href='https://russiandino.ru/' target='_blank' rel='noreferrer'>
      <FooterLogo />
      <FooterLogoText>
        <span>Made by</span>
        <span>Russkiy</span>
        <span>Dinozavr</span>
      </FooterLogoText>
    </FooterLogoLink>
    </FooterContent>
    <FooterCopyright>
      <span>
        ©2017-
        {getCurrentYear}
        &nbsp;
        <span>Чти</span>
        во. Санкт-Петербург. Все права защищены.
      </span>
    </FooterCopyright>
</StyleWrapper>
```

### Key Measurements
- **Max width**: 1394px (desktop)
- **Content padding**: 30px 20px 40px
- **Title**: 57px font-size, 69px line-height
- **Social icons**: 30px horizontal spacing
- **Copyright**: 12px font-size, 15px line-height
- **Border**: 1px solid red top border
- **Transition**: .3s ease-in-out for icon fills

### Responsive Breakpoints
- **XL**: >1440px - full layout
- **LG**: 1024-1394px - reduced padding
- **MD**: 768-1024px - social media stack, smaller title
- **SM**: ≤576px - footer stack: centered, 8px font-size copyright

### Icon Hover States
All social icons transition from their default colors to ${colors.redBase} on hover.

---

## Migration Notes for Update Branch

### Critical Style Preservations
1. **Header height**: MUST be 80px (not 60px)
2. **Exact padding**: 60px → 40px → 0px at different breakpoints
3. **Border**: Header MUST have 1px solid grey bottom border
4. **Icon hover states**: All icons must change color to ${colors.redBase} on hover
5. **Sticky positioning**: Header must be sticky top: 0 with z-index: 999

### Color Mappings
- **Old**: ${colors.blackBase}, ${colors.white}, ${colors.grey}, ${colors.redBase}
- **New Token System**: Need to map these to new params.scss
  - ${colors.blackBase} → $color-black-base
  - ${colors.white} → $color-white
  - ${colors.grey} → $color-grey  
  - ${colors.redBase} → $color-red-base

### Component Dependencies
- **Popper**: Custom dropdown component (not available in new branch)
- **Menu Items**: menu.ts with full navigation structure
- **Icons**: Multiple SVG icons for social media and header actions

### Breakpoint System
Old breakPoints.ts has exact same values as new system:
- sm: 830px
- md: 1024px
- lg: 1440px
- xl: 1441px (in old, but new uses 1441px)

This mapping should be maintained exactly.
