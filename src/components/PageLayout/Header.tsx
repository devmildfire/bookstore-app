import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';

import Logo from '@/assets/images/logo.svg';
import SearchIcon from '@/assets/icons/search.svg';
import CartIcon from '@/assets/icons/shop-cart.svg';
import SignOutIcon from '@/assets/icons/sign-out.svg';
import HeaderTab from './components/HeaderTab';

import colors from '@/utils/colors';
import menu from '@/utils/menuItems';

const StyledWrapper = styled.header`
  width: 100%;
  position: sticky;
  top: 0;
  height: 80px;
  padding: 0 60px;
  background-color: ${colors.blackBase};
  z-index: var(--upper-z-index);

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

const SearchIconStyled = styled(SearchIcon)`
  cursor: pointer;

  :hover {
    fill: var(--main-red-100);
  }
`;

const CartIconStyled = styled(CartIcon)`
  width: 14px;
  height: 16px;

  stroke: var(--main-white);

  cursor: pointer;

  :hover {
    stroke: var(--main-red-100);
  }
`;

const SignOutIconStyled = styled(SignOutIcon)`
  cursor: pointer;

  :hover {
    fill: var(--main-red-100);
  }
`;

const Header = (): React.ReactElement => (
  <StyledWrapper>
    <HeaderContent>
      <Link href='/' passHref>
        <a href='fakePath'>
          <Logo />
        </a>
      </Link>
      <SearchIconStyled />
      {menu.map((item) => (
        <HeaderTab item={item} key={item.title} />
      ))}
      <CartIconStyled />
      <SignOutIconStyled fill={colors.grey} />
    </HeaderContent>
  </StyledWrapper>
);

export default Header;
