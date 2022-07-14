import React from 'react';
import type { NextPage } from 'next';
import HomePage from '@/components/HomePage';
import Books from '@/components/BooksPage/Books';
import { wrapper } from '@/models';
import { getBooks } from '@/models/books';
import Container from '@/components/Common/Container';
import Text from '@/components/Common/Text';

const BooksPage: NextPage = () => (
  <HomePage>
    <Container>
      <Text variant='h2' align='center'>
        Издания
      </Text>
    </Container>
    <Books />
  </HomePage>
);

export const getServerSideProps = wrapper.getServerSideProps(
  (store) => async () => {
    await store.dispatch(getBooks.initiate(undefined));
    return {
      props: {},
    };
  },
);

export default BooksPage;
