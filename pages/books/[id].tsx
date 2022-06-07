import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import { Book } from '@/types/book';
import BookDescription from '@/components/BookPage/BookDescription';
import BookProperties from '@/components/BookPage/BookProperties';
import BookTrailer from '@/components/BookPage/BookTrailer';
import BookAuthor from '@/components/BookPage/BookAuthor';
import SimilarBooks from '@/components/BookPage/SimilarBooks';
import getBook from '@/utils/getBook';
import Container from '@/components/Common/Container';

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
        <BookAuthor author={book.author} authorId={0} authors={book.authors} />
        <SimilarBooks />
      </StyleWrapper>
    </main>
  );
};

export const getServerSideProps: GetServerSideProps<BookPageProps> = async ({
  query,
}) => {
  const { id } = query;
  const book = getBook(id);

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
};

export default BookPage;
