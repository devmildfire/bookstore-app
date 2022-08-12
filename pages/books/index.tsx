import React from 'react';
import type { NextPage } from 'next';
import HomeLayout from '@/layouts/HomeLayout';
import Books from '@/components/BooksPage/Books';
import { wrapper } from '@/models';
import { getBooks, getPopularBooks } from '@/models/books';

const BooksPage: NextPage = () => (
  <HomeLayout title='Издания'>
    <Books />
  </HomeLayout>
);

export const getStaticProps = wrapper.getStaticProps(
  ({ dispatch, }) =>
    async () => {
      const requests: Promise<unknown>[] = [
        dispatch(
          getBooks.initiate({
            page: 1,
            productType: [],
            publishYear: [],
          })
        ),
        dispatch(getPopularBooks.initiate(undefined))
      ];
      await Promise.all(requests);

      return {
        props: {},
        revalidate: 1,
      };
    }
);

export default BooksPage;
