import React from 'react';

import styled from 'styled-components';

const Header = (): React.ReactElement => (
  <StyleWrapper>Header</StyleWrapper>
);

export default Header;

const StyleWrapper = styled.div`
  width: 100%;
  position: sticky;
  top: 0;
  height: 80px;
  background-color: black;
  border-bottom: 1px solid red;
`;
