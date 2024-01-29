/* eslint-disable operator-linebreak */
import React from 'react';
import type { NextPage } from 'next';
import HomeLayout from '@/layouts/HomeLayout';
import { getBoxSets } from '@/models/boxSets';
import { wrapper } from '@/models';
import Sets from '@/components/SetsPage/Sets';
import { getPopularBooks } from '@/models/books';

const SetsPage: NextPage = () => (
  <HomeLayout title='БОКС-СЕТЫ'>
    <Sets />
  </HomeLayout>
);

export const getStaticProps = wrapper.getStaticProps(
  ({ dispatch }) =>
    async () => {
      const requests: Promise<unknown>[] = [
        dispatch(getBoxSets.initiate({ page: 1 })),
        dispatch(getPopularBooks.initiate(undefined)),
      ];

      await Promise.all(requests);
      return {
        props: {},
        revalidate: 1,
      };
    }
);

export default SetsPage;
