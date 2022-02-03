import React from 'react';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import Head from 'next/head';
import styled from 'styled-components';

import colors from '../../src/utils/colors';
import BookDescription from '../../src/components/BookPage/BookDescription';
import BookProperties from '../../src/components/BookPage/BookProperties';
import BookTrailer from '../../src/components/BookPage/BookTrailer';
import BookAuthor from '../../src/components/BookPage/BookAuthor';
import SimilarBooks from '../../src/components/BookPage/SimilarBooks';
import getBookInfo from '../../src/utils/bookInfo';

const StyleWrapper = styled.div`
  max-width: 1394px;
  padding: 30px 0 166px;
  margin: 0 auto;
  color: ${colors.whiteBase};
  
  .propsBtn {
    margin: 0;
    width: 300px;
    height: 70px;
    font-size: 16px;
    line-height: 20px;
  }
  
  .propsBtn:last-child {
    margin-bottom: 20px;
  }
`;

const BookPage = (): React.ReactElement => {
  const router = useRouter();
  const { id }: ParsedUrlQuery = router.query;
  const book = getBookInfo(id);

  return (
    <StyleWrapper>
      <Head>
        <title>{book?.title}</title>
      </Head>
      {book
      && (
        <>
          <BookDescription book={book} />
          <BookProperties book={book} />
          <BookTrailer />
          <BookAuthor book={book} />
          <SimilarBooks />
        </>
      )}
    </StyleWrapper>
  );
};

export default BookPage;
