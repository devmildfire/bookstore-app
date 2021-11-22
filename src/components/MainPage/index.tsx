import React from 'react';

import styled from 'styled-components';

const MainPage = (): React.ReactElement => (
  <StyleWrapper>Main Page</StyleWrapper>
);

export default MainPage;

const StyleWrapper = styled.div`
  color: red;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;
