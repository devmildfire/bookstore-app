/* eslint-disable react/no-array-index-key */
import * as React from 'react';
import { Book, useGetBooksQuery } from '@/models/books';
import BookRow from './BookRow';
import { StyledProductsList } from './styles';

const BooksList: React.FC = () => (
  <StyledProductsList inRow={3} useQuery={useGetBooksQuery} rootMargin='300px'>
    {({ rows }) =>
      rows.map((row, i) => (
        <BookRow books={row as Book[]} key={row.length + i} />
      ))}
  </StyledProductsList>
);

export default React.memo(BooksList);
