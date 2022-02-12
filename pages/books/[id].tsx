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

const StyleWrapper = styled.main`
  max-width: 1394px;
  padding: 30px 0 166px;
  margin: 0 auto;
  color: ${colors.whiteBase};
  
  @media screen and (max-width: 1440px) {
    max-width: 1040px;
    padding: 30px 0 101px;
  } 
  
  @media screen and (max-width: 1024px) {
    max-width: 830px;
    padding: 41px 0 87px;
  }
  
  @media screen and (max-width: 830px) {
    padding: 20px 16px 71px;
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
          <BookTrailer book={book} />
          <BookAuthor book={book} />
          <SimilarBooks />
        </>
      )}
    </StyleWrapper>
  );
};

export default BookPage;
