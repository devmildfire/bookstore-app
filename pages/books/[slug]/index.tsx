/* eslint-disable operator-linebreak */
import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { GetServerSideProps } from 'next';
import { bookTypes, Title } from '@/models/books';
import BookDescription from '@/components/BookPage/BookDescription';
import BookProperties from '@/components/BookPage/BookProperties';
import BookTrailer from '@/components/BookPage/BookTrailer';
import BookAuthor from '@/components/BookPage/BookAuthor';
import breakPoints from '@/utils/breakPoints';
import { API } from 'api/books';
import PageLayout from '@/layouts/PageLayout';

interface BookPageProps {
  readonly book: Title;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.query;

  if (!slug) {
    return {
      props: { book: null },
    };
  }

  const { data, error } = await API.getTitleBySlug(slug as string);

  console.log(data);

  if (data && data[0] !== undefined) {
    const bookItem = data[0];

    const book = {
      ...bookItem,
      price: bookTypes
        .map((type) => (bookItem[type] ? bookItem[type]?.price : null))
        .filter((price) => price !== null),
      types: bookTypes
        .map((type) => (bookItem[type] ? { type, info: bookItem[type] } : null))
        .filter((type) => type !== null),
    };

    console.log(book.types);

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
    <PageLayout headTitle={book.name}>
      <StyleWrapper className='max-width'>
        <BookDescription {...book} />
        {/* <BookProperties {...book} /> */}
        <BookTrailer src={book.trailer} title={book.name} />
        <BookAuthor authors={book.authors} />
        {/* <SimilarBooks /> */}
      </StyleWrapper>
    </PageLayout>
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
