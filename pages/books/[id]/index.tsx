/* eslint-disable operator-linebreak */
import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import { Book, getBook } from '@/models/books';
import BookDescription from '@/components/BookPage/BookDescription';
import BookProperties from '@/components/BookPage/BookProperties';
import BookTrailer from '@/components/BookPage/BookTrailer';
import BookAuthor from '@/components/BookPage/BookAuthor';
import SimilarBooks from '@/components/BookPage/SimilarBooks';
import Container from '@/components/Common/Container';
import { wrapper } from '@/models';

interface BookPageProps {
  readonly book: Book;
}

const BookPage = (props: BookPageProps): React.ReactElement => {
  const { book } = props;

  return (
    <main>
      <Head>
        <title>{book.title}</title>
      </Head>
      <StyleWrapper>
        <BookDescription {...book} />
        <BookProperties {...book} />
        <BookTrailer src={book.trailerSrc} title={book.title} />
        <BookAuthor authors={book.authors} />
        <SimilarBooks />
      </StyleWrapper>
    </main>
  );
};

export const getServerSideProps = wrapper.getServerSideProps<BookPageProps>(
  (store) =>
    async ({ query }) => {
      const { id } = query;
      const { data: book } = await store.dispatch(
        getBook.initiate(id as string),
      );

      if (!book) {
        return {
          notFound: true,
        };
      }

      return {
        props: {
          book,
        },
      };
    },
);

const StyleWrapper = styled(Container)`
  display: grid;
  gap: 170px;
  padding: 30px 0 100px;
  @media ${breakPoints.xl} {
    gap: 150px;
    padding-bottom: 70px;
  }
  @media ${breakPoints.lg} {
    gap: 100px;
  }
  @media ${breakPoints.md} {
    gap: 80px;
    padding-bottom: 50px;
  }
  @media ${breakPoints} {
    gap: 70px;
  }
`;

export default BookPage;
