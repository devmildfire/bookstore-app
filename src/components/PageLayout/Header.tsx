import React from 'react';

import styled from 'styled-components';

import colors from '../../styles/colors';

const StyledWrapper = styled.div`
  width: 100%;
  position: sticky;
  top: 0;
  height: 80px;
  padding: 0 60px;
  background-color: ${colors.black};
  
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
  border-bottom: 1px solid ${colors.grey70};

  @media (max-width: 1024px) {
    padding: 0 20px;
  }
`;

const Header = (): React.ReactElement => (
  <StyledWrapper>
    <HeaderContent>
      Header
    </HeaderContent>
  </StyledWrapper>
);

export default Header;
