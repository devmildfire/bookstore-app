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

const Header = (): React.ReactElement => (
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
);

export default Header;
