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
import SimilarBooks from '@/components/BookPage/SimilarBooks';
import books from '@/mocks/books';
import breakPoints from '@/utils/breakPoints';

// interface BookPageProps {
//   readonly book: Book;
// }

async function getBook(id: string | string[] | undefined): Promise<Book> {
  return books[Number(id)];
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(['book', id], () => getBook(id));
  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

const BookPage = (): React.ReactElement => {
  const router = useRouter();
  const { id } = router.query;
  const { data: book, isLoading } = useQuery(['book', id], () => getBook(id), {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

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
            <SimilarBooks />
          </StyleWrapper>
        </>
      )}
    </>
  );
};

// export const getServerSideProps = wrapper.getServerSideProps<BookPageProps>(
//   ({ dispatch }) =>
//     async ({ query }) => {
//       const { id } = query;
//       const { data: book } = await dispatch(getBook.initiate(id as string));

//       if (!book) {
//         return {
//           notFound: true,
//         };
//       }

//       return {
//         props: {
//           book,
//         },
//       };
//     }
// );

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

  @media screen and (min-width: 576px) {
    padding: 0 20px;
  }

  @media screen and (min-width: 1024px) {
    padding: 0 90px;
  }

  @media screen and (min-width: 1440px) {
    padding: 0 180px;
  }
`;

export default BookPage;
