/* eslint-disable react/no-array-index-key */
import * as React from 'react';
import { Book, BookType, useGetBooksQuery } from '@/models/books';
import BookRow from './BookRow';
import { StyledProductsList } from './styles';
import useGetParam from '@/hooks/useGetParam';
import { GET_PARAMS } from '@/consts/query';
import parseGetParams from '@/utils/parseGetParams';

const BooksList: React.FC = () => {
  const publishYear = parseGetParams(useGetParam(GET_PARAMS.publishYear));
  const productType = parseGetParams<BookType>(useGetParam(GET_PARAMS.productType));

  const otherParams = React.useMemo(
    () => ({
      publishYear,
      productType,
    }),
    [...publishYear, ...productType]
  );

  return (
    <StyledProductsList
      inRow={3}
      useQuery={useGetBooksQuery as any}
      rootMargin='300px'
      otherParams={otherParams}
    >
      {({ rows, }) =>
        rows.map((row, i) => (
          <BookRow books={row as Book[]} key={row.length + i} />
        ))}
    </StyledProductsList>
  );
};

export default React.memo(BooksList);
