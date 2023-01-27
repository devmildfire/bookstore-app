import * as React from 'react';
import BooksList from './BooksList';
import { StyledWrapper } from './styles';
import Container from '@/components/Common/Container';
// import Filters from '../../Filters';
import MultiSelect from '@/components/Common/MultiSelect';

const Books: React.FC = () => (
  <StyledWrapper>
    <Container>
      {/* <Filters /> */}
      <MultiSelect />
    </Container>

    <BooksList />
  </StyledWrapper>
);

export default React.memo(Books);
