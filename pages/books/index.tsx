import React from 'react';
import type { NextPage } from 'next';
import HomePage from '@/components/HomePage';
import Books from '@/components/BooksPage/Books';
import { wrapper } from '@/models';
import { getBooks, getPopularBooks } from '@/models/books';

const BooksPage: NextPage = () => (
  <HomePage title='Издания'>
    <Books />
  </HomePage>
);

export const getStaticProps = wrapper.getStaticProps(
  ({ dispatch }) =>
    async () => {
      const requests: Promise<unknown>[] = [
        dispatch(getBooks.initiate({ page: 1 })),
        dispatch(getPopularBooks.initiate(undefined)),
      ];
      await Promise.all(requests);

      return {
        props: {},
        revalidate: 5000,
      };
    },
);

export default BooksPage;
