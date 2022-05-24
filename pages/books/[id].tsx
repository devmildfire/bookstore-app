import React from 'react';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import Head from 'next/head';
import styled from 'styled-components';
import colors from '@/utils/colors';
import breakPoints from '@/utils/breakPoints';
import BookDescription from '@/components/BookPage/BookDescription';
import BookProperties from '@/components/BookPage/BookProperties';
import BookTrailer from '@/components/BookPage/BookTrailer';
import BookAuthor from '@/components/BookPage/BookAuthor';
import SimilarBooks from '@/components/BookPage/SimilarBooks';
import getBookInfo from '@/utils/bookInfo';

const StyleWrapper = styled.main`
  max-width: 1394px;
  padding: 30px 0 166px;
  margin: 0 auto;
  color: ${colors.whiteBase};

  @media ${breakPoints.xl} {
    max-width: 1040px;
    padding: 30px 0 101px;
  }

  @media ${breakPoints.lg} {
    max-width: 830px;
    padding: 41px 0 87px;
  }

  @media ${breakPoints.md} {
    padding: 20px 16px 71px;
  }

  @media ${breakPoints.sm} {
    overflow: hidden;
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
