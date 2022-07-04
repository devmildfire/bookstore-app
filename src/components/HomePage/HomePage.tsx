import React, { PropsWithChildren } from 'react';
import ProductSlider from './ProductSlider';
import Navigation from './Navigation';
import { StyledWrapper } from './styles';

const HomePage = (props: PropsWithChildren<{}>): React.ReactElement => {
  const { children } = props;
  return (
    <StyledWrapper>
      <ProductSlider />
      <Navigation />
      {children}
    </StyledWrapper>
  );
};

export default HomePage;
