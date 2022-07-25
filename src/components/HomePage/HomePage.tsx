import * as React from 'react';
import Container from '../Common/Container';
import Text from '../Common/Text';
import ProductSlider from './ProductSlider';
import {
  StyledContentWrapper,
  StyledNavigation,
  StyledWrapper,
} from './styles';

interface HonePageProps {
  readonly title: string;
}

const HomePage: React.FC<HonePageProps> = (props) => {
  const { children, title } = props;
  return (
    <StyledWrapper>
      <ProductSlider />
      <StyledNavigation />
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

export default HomePage;
