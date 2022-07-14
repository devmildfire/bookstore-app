import React, { PropsWithChildren } from 'react';
import ProductSlider from './ProductSlider';
import { StyledNavigation, StyledWrapper } from './styles';

const HomePage = (props: PropsWithChildren<{}>): React.ReactElement => {
  const { children } = props;
  return (
    <StyledWrapper>
      <ProductSlider />
      <StyledNavigation />
      {children}
    </StyledWrapper>
  );
};

export default HomePage;
