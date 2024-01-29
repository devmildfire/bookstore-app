/* eslint-disable operator-linebreak */
import React from 'react';
import type { NextPage } from 'next';
import HomeLayout from '@/layouts/HomeLayout';
import { wrapper } from '@/models';
import { getGifts } from '@/models/gifts';
import Gifts from '@/components/GiftsPage/Gifts';
import { getPopularBooks } from '@/models/books';

const GiftsPage: NextPage = () => (
  <HomeLayout title='Карты даров'>
    <Gifts />
  </HomeLayout>
);

export const getStaticProps = wrapper.getStaticProps(
  ({ dispatch }) =>
    async () => {
      const requests = [
        dispatch(getPopularBooks.initiate(undefined)),
        dispatch(getGifts.initiate(undefined)),
      ];

      await Promise.all(requests);
      return {
        props: {},
        revalidate: 1,
      };
    }
);

export default GiftsPage;
