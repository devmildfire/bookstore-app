/* eslint-disable operator-linebreak */
import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { GetServerSideProps } from 'next';
import { Title } from '@/models/books';
import BookDescription from '@/components/BookPage/BookDescription';
import BookProperties from '@/components/BookPage/BookProperties';
import BookTrailer from '@/components/BookPage/BookTrailer';
import BookAuthor from '@/components/BookPage/BookAuthor';
import breakPoints from '@/utils/breakPoints';
import { supabase } from 'api';

interface BookPageProps {
  readonly book: Title;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.query;
  console.log(slug);
  const { data, error } = await supabase
    .from('Titles')
    .select('*')
    .eq('slug', slug);

  if (data) {
    const book = data[0];

    return {
      props: { book },
    };
  }

  return {
    props: { book: null },
  };
};

const BookPage = ({ book }: BookPageProps): React.ReactElement => {
  if (!book) return <p>Не удалось загрузить страницу книги</p>;

  return (
    <>
      <Head>
        <title>{book.name}</title>
      </Head>
      <StyleWrapper className='max-width'>
        <BookDescription {...book} />
        <BookProperties {...book} />
        <BookTrailer src={book.trailerSrc} title={book.name} />
        <BookAuthor authors={book.authors} />
        {/* <SimilarBooks /> */}
      </StyleWrapper>
    </>
  );
};

const StyleWrapper = styled.div`
  position: relative;
  display: grid;
  justify-content: center;
  gap: 170px;
  @media ${breakPoints.lg} {
    gap: 48px;
  }
  @media screen and (max-width: 576px) {
    gap: 48px;
  }
`;

export default BookPage;
