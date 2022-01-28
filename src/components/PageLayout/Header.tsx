import React from 'react';
import Link from 'next/link';
import { ReactSVG } from 'react-svg';
import styled from 'styled-components';

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

const Header = (): React.ReactElement => (
  <StyledWrapper>
    <HeaderContent>
      <Link href='/' passHref>
        <a href='fakeHref'>
          <ReactSVG
            src='chtivo-logo.svg'
          />
        </a>
      </Link>
      {menu.map((item) => (
        <HeaderTab
          item={item}
        />
      ))}
    </HeaderContent>
  </StyledWrapper>
);

export default Header;
