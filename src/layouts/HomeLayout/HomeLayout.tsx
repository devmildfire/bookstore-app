import * as React from 'react';
import styled from 'styled-components';
// import Container from '@/components/Common/Container';
import Text from '@/components/Common/Text';
// import ProductSlider from '@/components/ProductSlider';
import {
  // StyledContentWrapper,
  // StyledNavigation,
  StyledWrapper,
} from './styles';
import Slider from '@/components/Slider';

interface HomeLayoutProps {
  readonly title: string;
}

const StyledTitle = styled(Text)`
  background: linear-gradient(
    180deg,
    rgba(5, 5, 5, 1) 0%,
    rgba(0, 0, 0, 0.1) 100%
  );
  width: 100%;
  padding: 2rem 0;
`;

const HomeLayout: React.FC<HomeLayoutProps> = (props) => {
  const { children, title } = props;
  return (
    <StyledWrapper>
      <Slider />
      {/* <StyledNavigation /> */}
      {/* <StyledContentWrapper> */}
      <StyledTitle variant='h2_1' align='center'>
        {title}
      </StyledTitle>
      {children}
      {/* </StyledContentWrapper> */}
    </StyledWrapper>
  );
};

export default HomeLayout;
