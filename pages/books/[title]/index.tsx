/* eslint-disable operator-linebreak */
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { GetServerSideProps } from 'next';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import { Book } from '@/models/books';
import BookDescription from '@/components/BookPage/BookDescription';
import BookProperties from '@/components/BookPage/BookProperties';
import BookTrailer from '@/components/BookPage/BookTrailer';
import BookAuthor from '@/components/BookPage/BookAuthor';
import books from '@/mocks/books';
import breakPoints from '@/utils/breakPoints';

// interface BookPageProps {
//   readonly book: Book;
// }

async function getBook(
  title: string | string[] | undefined
): Promise<Book | null> {
  const book = books.find(
    (b) => b.transliteratedTitle?.toLowerCase() === title
  );
  if (!book) return null;
  return book;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { title } = context.query;
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(['book', title], () => getBook(title));
  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

const BookPage = (): React.ReactElement => {
  const router = useRouter();
  const { title } = router.query;
  const { data: book, isLoading } = useQuery(
    ['book', title],
    () => getBook(title),
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  );

  if (!book) return <p>Не удалось загрузить страницу книги</p>;
  // const { book } = props;
  return (
    <>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <Head>
            <title>{book.title}</title>
          </Head>
          <StyleWrapper>
            <BookDescription {...book} />
            <BookProperties {...book} />
            <BookTrailer src={book.trailerSrc} title={book.title} />
            <BookAuthor authors={book.authors} />
            {/* <SimilarBooks /> */}
          </StyleWrapper>
        </>
      )}
    </>
  );
};

const StyleWrapper = styled.div`
  position: relative;
  display: grid;
  justify-content: center;
  justify-self: center;
  max-width: 1440px;
  gap: 170px;
  box-sizing: content-box;
  @media ${breakPoints.lg} {
    gap: 48px;
  }
  @media screen and (max-width: 576px) {
    gap: 48px;
  }

  @media ${breakPoints.xl} {
    padding: 0 90px;
  }

  @media ${breakPoints.lg} {
    padding: 0 20px;
  }

  @media ${breakPoints.sm} {
    padding: 0 0px;
  }

  @media screen and (min-width: 1440px) {
    padding: 0 180px;
  }
`;

export default BookPage;
