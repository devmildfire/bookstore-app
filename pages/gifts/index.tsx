/* eslint-disable operator-linebreak */
import React from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import HomePage from '@/components/HomePage';
import { wrapper } from '@/models';
import { getGifts } from '@/models/gifts';
import Gifts from '@/components/GiftsPage/Gifts';
import { getPopularBooks } from '@/models/books';

const GiftsPage: NextPage = () => (
  <HomePage title='Карты даров'>
    <Gifts />
  </HomePage>
);

export const getServerSideProps: GetServerSideProps =
  wrapper.getServerSideProps(({ dispatch }) => async () => {
    const requests = [
      dispatch(getPopularBooks.initiate(undefined)),
      dispatch(getGifts.initiate(undefined)),
    ];

    await Promise.all(requests);
    return {
      props: {},
    };
  });

export default GiftsPage;
