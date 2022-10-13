import * as React from 'react';
import BooksList from './BooksList';
import { StyledWrapper } from './styles';
import Container from '@/components/Common/Container';
import Filters from '../../Filters';

console.log(process.env.NEXT_PUBLIC_VERCEL_URL);
const Books: React.FC = () => (
  <StyledWrapper>
    <Container>
      <Filters />
    </Container>
    <BooksList />
  </StyledWrapper>
);

export default React.memo(Books);
