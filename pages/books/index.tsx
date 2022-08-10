import React from 'react';
import type { NextPage } from 'next';
import HomeLayout from '@/layouts/HomeLayout';
import Books from '@/components/BooksPage/Books';
import { wrapper } from '@/models';
import { BookType, getBooks, getPopularBooks } from '@/models/books';
import { GET_PARAMS } from '@/consts/query';
import getParam from '@/utils/getParam';

const BooksPage: NextPage = () => (
  <HomeLayout title='Издания'>
    <Books />
  </HomeLayout>
);

export const getServerSideProps = wrapper.getServerSideProps(
  ({ dispatch, }) =>
    async ({ query, }) => {
      const publishYear = getParam(query, GET_PARAMS.publishYear);
      const productType = getParam<BookType>(query, GET_PARAMS.productType);
      const requests: Promise<unknown>[] = [
        dispatch(
          getBooks.initiate({
            page: 1,
            publishYear,
            productType,
          })
        ),
        dispatch(getPopularBooks.initiate(undefined))
      ];
      await Promise.all(requests);

      return {
        props: {},
      };
    }
);

export default BooksPage;
