import React from 'react';
import type { NextPage } from 'next';
import HomePage from '@/components/HomePage';
import Books from '@/components/Books';
import { loadBooksThunk } from '@/models/books';
import { wrapper } from '@/models';

const BooksPage: NextPage = () => (
  <HomePage>
    <Books />
  </HomePage>
);

export const getServerSideProps = wrapper.getServerSideProps(
  (store) => async () => {
    await store.dispatch(loadBooksThunk());
    return {
      props: {},
    };
  },
);

export default BooksPage;
