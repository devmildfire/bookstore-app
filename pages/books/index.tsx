import React from 'react';
import type { NextPage } from 'next';
import HomePage from '@/components/HomePage';
import Books from '@/components/BooksPage/Books';
import { wrapper } from '@/models';
import {
  getAuthorFilter,
  getBooks,
  getPopularBooks,
  getSortFilter,
  getTypeFilter,
  getYearFilter,
} from '@/models/books';
import { GET_PARAMS } from '@/consts/query';
import getParam from '@/utils/getParam';

const BooksPage: NextPage = () => (
  <HomePage title='Издания'>
    <Books />
  </HomePage>
);

export const getServerSideProps = wrapper.getServerSideProps(
  ({ dispatch }) =>
    async ({ query }) => {
      const publishYear = getParam(query, GET_PARAMS.publishYear)?.split(',') || null;
      const requests: Promise<unknown>[] = [
        dispatch(
          getBooks.initiate({
            page: 1,
            publishYear,
          }),
        ),
        dispatch(getAuthorFilter.initiate(undefined)),
        dispatch(getYearFilter.initiate(undefined)),
        dispatch(getSortFilter.initiate(undefined)),
        dispatch(getTypeFilter.initiate(undefined)),
        dispatch(getPopularBooks.initiate(undefined)),
      ];
      await Promise.all(requests);

      return {
        props: {},
      };
    },
);

export default BooksPage;
