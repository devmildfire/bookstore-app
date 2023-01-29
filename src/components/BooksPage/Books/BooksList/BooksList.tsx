/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState } from 'react';
import { Book, BookType, useGetBooksQuery } from '@/models/books';
import BookRow from './BookRow';
import { StyledProductsList } from './styles';
import useGetParam from '@/hooks/useGetParam';
import { GET_PARAMS } from '@/consts/query';
import parseGetParams from '@/utils/parseGetParams';
import useScreenSize from '@/hooks/useScreenSize';

const getBooksInRow = (width: number) => {
  if (width < 512) {
    return 1;
  }
  if (width < 1024) {
    return 2;
  }
  return 3;
};

const BooksList: React.FC = () => {
  const [width] = useScreenSize();
  const [inRow, setInRow] = useState(getBooksInRow(width));
  const publishYear = useGetParam(GET_PARAMS.publishYear);
  const productType = useGetParam(GET_PARAMS.productType);
  const otherParams = React.useMemo(
    () => ({
      publishYear: parseGetParams(publishYear),
      productType: parseGetParams<BookType>(productType),
    }),
    [publishYear, productType]
  );

  useEffect(() => {
    setInRow(getBooksInRow(width));
  }, [width]);
  console.log(width, inRow);
  return (
    <StyledProductsList
      inRow={inRow}
      useQuery={useGetBooksQuery as any}
      rootMargin='300px'
      otherParams={otherParams}
    >
      {({ rows }) => {
        return rows.map((row, i) => {
          return <BookRow books={row as Book[]} key={row.length + i} />;
        });
      }}
    </StyledProductsList>
  );
};

export default React.memo(BooksList);
