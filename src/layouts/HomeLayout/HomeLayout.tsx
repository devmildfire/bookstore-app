import * as React from 'react';
import ProductSlider from '@/components/ProductSlider';
import {
  StyledContentWrapper,
  // StyledNavigation,
  StyledWrapper
} from './styles';

const HomeLayout: React.FC = (props) => {
  const { children, } = props;
  return (
    <StyledWrapper>
      {/* <StyledNavigation /> */}
      <ProductSlider />
      <StyledContentWrapper>{children}</StyledContentWrapper>
    </StyledWrapper>
  );
};

export default HomeLayout;
