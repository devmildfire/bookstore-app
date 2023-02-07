import * as React from 'react';
import SetsList from './SetsList';
import { StyledWrapper } from './styles';
import Container from '@/components/Common/Container';
import Filters from '@/components/Filters[depricated]';

const Sets: React.FC = () => (
  <StyledWrapper>
    <Container>
      <Filters />
    </Container>
    <SetsList />
  </StyledWrapper>
);

export default React.memo(Sets);
