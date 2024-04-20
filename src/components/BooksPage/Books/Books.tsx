import * as React from 'react';
// import BooksList from './BooksList';
// import { StyledWrapper } from './styles';
// import Container from '@/components/Common/Container';
// import Filters from '../../Filters';
import Products from '@/components/Products';
import books from '@/mocks/books';
import Filters from '@/components/Filters';

// const GET_RANDOM_PHOTO_URL = 'https://random.imagecdn.app/350/500';

const data = Array(12)
  .fill(0)
  .map(() => books[1]);

const Books: React.FC = () => (
  <>
    {/* <Container> */}
    {/* <Filters /> */}
    {/* <Multiselect /> */}
    {/* <Filters /> */}
    {/* </Container> */}
    {/* <Products /> */}
    {/* <BooksList /> */}
  </>
);

export default React.memo(Books);
