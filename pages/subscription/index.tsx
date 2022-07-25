/* eslint-disable operator-linebreak */
import React from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import HomePage from '@/components/HomePage';
import { wrapper } from '@/models';
import { getPopularBooks } from '@/models/books';
import { getSubscriptions } from '@/models/subscription';

const Subscription: NextPage = () => (
  <HomePage title='Чудеса подписки'> </HomePage>
);

export const getServerSideProps: GetServerSideProps =
  wrapper.getServerSideProps(({ dispatch }) => async () => {
    const requests = [
      dispatch(getPopularBooks.initiate(undefined)),
      dispatch(getSubscriptions.initiate(undefined)),
    ];

    await Promise.all(requests);
    return {
      props: {},
    };
  });

export default Subscription;
