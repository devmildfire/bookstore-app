/* eslint-disable react/no-array-index-key */
import * as React from 'react';
import { Book, useGetBooksQuery } from '@/models/books';
import BookRow from './BookRow';
import { StyledProductsList } from './styles';
import useGetParam from '@/hooks/useGetParam';
import { GET_PARAMS } from '@/consts/query';

const BooksList: React.FC = () => {
  const publishYear: string[] | null = useGetParam(GET_PARAMS.publishYear)?.split(',') || null;

  return (
    <StyledProductsList
      inRow={3}
      useQuery={useGetBooksQuery as any}
      rootMargin='300px'
      otherParams={{
        publishYear,
      }}
    >
      {({ rows }) =>
        rows.map((row, i) => (
          <BookRow books={row as Book[]} key={row.length + i} />
        ))}
    </StyledProductsList>
  );
};

export default React.memo(BooksList);
