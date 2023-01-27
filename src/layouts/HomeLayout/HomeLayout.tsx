import * as React from 'react';
import Container from '@/components/Common/Container';
import Text from '@/components/Common/Text';
// import ProductSlider from '@/components/ProductSlider';
import {
  StyledContentWrapper,
  // StyledNavigation,
  StyledWrapper,
} from './styles';

interface HomeLayoutProps {
  readonly title: string;
}

const HomeLayout: React.FC<HomeLayoutProps> = (props) => {
  const { children, title } = props;
  return (
    <StyledWrapper>
      {/* <ProductSlider /> */}
      {/* <StyledNavigation /> */}
      <StyledContentWrapper>
        <Container>
          <Text variant='h2_1' align='center'>
            {title}
          </Text>
        </Container>
        {children}
      </StyledContentWrapper>
    </StyledWrapper>
  );
};

export default HomeLayout;
