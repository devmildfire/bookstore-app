/* eslint-disable operator-linebreak */
import React from 'react';
import type { NextPage } from 'next';
import HomePage from '@/components/HomePage';
import { getBoxSets } from '@/models/boxSets';
import { wrapper } from '@/models';
import Sets from '@/components/SetsPage/Sets';
import { getPopularBooks } from '@/models/books';

const SetsPage: NextPage = () => (
  <HomePage title='БОКС-СЕТЫ'>
    <Sets />
  </HomePage>
);

export const getStaticProps = wrapper.getStaticProps(
  ({ dispatch }) =>
    async () => {
      const requests: Promise<unknown>[] = [
        dispatch(getBoxSets.initiate(undefined)),
        dispatch(getPopularBooks.initiate(undefined)),
      ];

      await Promise.all(requests);
      return {
        props: {},
        revalidate: 5000,
      };
    },
);

export default SetsPage;
