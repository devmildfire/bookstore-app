import * as React from 'react';
import BooksList from './BooksList';
import { StyledWrapper } from './styles';
import Container from '@/components/Common/Container';
// import Filters from '../../Filters';
import Multiselect from '@/components/Common/Multiselect';

const Books: React.FC = () => (
  <StyledWrapper>
    <Container>
      {/* <Filters /> */}
      <Multiselect />
    </Container>

    <BooksList />
  </StyledWrapper>
);

export default React.memo(Books);
